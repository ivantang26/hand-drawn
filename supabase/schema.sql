-- Wildroot production schema (Supabase / Postgres).
-- The demo runs on the in-memory store in lib/server/store.ts, which mirrors these rules.

create table shops (
  id            text primary key,              -- 'mill-lane', 'harbour-street'
  name          text not null,
  collect_until time not null default '12:00'
);

create table opening_hours (
  shop_id  text references shops on delete cascade,
  weekday  smallint check (weekday between 0 and 6),  -- 0 = Sunday
  opens    time,
  closes   time,                                       -- null opens/closes = closed all day
  primary key (shop_id, weekday)
);

create table closures (
  id        uuid primary key default gen_random_uuid(),
  shop_id   text references shops,                     -- null = both shops
  starts_on date not null,
  ends_on   date not null check (ends_on >= starts_on),
  reason    text not null
);

create table products (
  id          text primary key,
  name        text not null,
  category    text not null check (category in ('breads', 'pastries', 'cakes', 'drinks')),
  price_pence integer not null check (price_pence > 0),
  par         integer not null default 0,              -- usual bake size
  contains    jsonb not null default '[]',             -- [{ "id": "gluten", "detail": "wheat" }]
  may_contain text[] not null default '{}'
);

-- One row per product, per shop, per day. The check constraint is the last line of defence:
-- Postgres will refuse any update that would oversell, even if application code is wrong.
create table stock (
  shop_id    text references shops,
  bake_date  date not null,
  product_id text references products,
  planned    integer not null check (planned >= 0),
  sold       integer not null default 0,
  sold_out   boolean not null default false,
  primary key (shop_id, bake_date, product_id),
  constraint never_oversold check (sold <= planned and sold >= 0)
);

create table orders (
  id          text primary key,                        -- 'WR-7K3PQ'
  shop_id     text references shops,
  collect_on  date not null,
  slot        time not null,
  customer    jsonb not null,                          -- { name, email, phone }
  notes       text,
  total_pence integer not null,
  status      text not null default 'pending' check (status in ('pending', 'paid', 'collected', 'cancelled')),
  stripe_payment_intent text,
  created_at  timestamptz not null default now(),
  collected_at timestamptz
);
create index orders_collection on orders (shop_id, collect_on, slot) where status in ('paid', 'collected');

create table order_lines (
  order_id    text references orders on delete cascade,
  product_id  text references products,
  qty         integer not null check (qty between 1 and 30),
  price_pence integer not null,
  primary key (order_id, product_id)
);

-- Reserve stock and a slot for a basket in one transaction.
-- `select … for update` locks just the stock rows involved, in a fixed order (by product id) so
-- two baskets sharing products can't deadlock. A second customer after the last loaf waits
-- for the lock, then sees sold = planned and gets a clean error instead of an oversell.
create or replace function reserve_order(
  p_order_id text, p_shop text, p_date date, p_slot time,
  p_lines jsonb, p_customer jsonb, p_notes text, p_slot_capacity integer default 12
) returns orders
language plpgsql as $$
declare
  line   record;
  s      stock;
  taken  integer;
  total  integer := 0;
  result orders;
begin
  -- Serialise slot bookings for this shop and day.
  perform pg_advisory_xact_lock(hashtext(p_shop || p_date::text));

  select count(*) into taken from orders
   where shop_id = p_shop and collect_on = p_date and slot = p_slot and status <> 'cancelled';
  if taken >= p_slot_capacity then
    raise exception 'SLOT_FULL' using errcode = 'P0001';
  end if;

  for line in
    select (l->>'product_id') as product_id, (l->>'qty')::int as qty
      from jsonb_array_elements(p_lines) l order by 1
  loop
    select * into s from stock
     where shop_id = p_shop and bake_date = p_date and product_id = line.product_id
     for update;
    if not found or s.sold_out or s.planned - s.sold < line.qty then
      raise exception 'SOLD_OUT:%', line.product_id using errcode = 'P0002';
    end if;
    update stock set sold = sold + line.qty
     where shop_id = p_shop and bake_date = p_date and product_id = line.product_id;
    total := total + line.qty * (select price_pence from products where id = line.product_id);
  end loop;

  insert into orders (id, shop_id, collect_on, slot, customer, notes, total_pence)
  values (p_order_id, p_shop, p_date, p_slot, p_customer, p_notes, total)
  returning * into result;

  insert into order_lines (order_id, product_id, qty, price_pence)
  select p_order_id, l->>'product_id', (l->>'qty')::int, p.price_pence
    from jsonb_array_elements(p_lines) l join products p on p.id = l->>'product_id';

  return result;
end $$;

-- Called from the Stripe webhook when a payment fails or the checkout session expires.
create or replace function release_order(p_order_id text) returns void
language plpgsql as $$
begin
  update stock st set sold = st.sold - ol.qty
    from order_lines ol join orders o on o.id = ol.order_id
   where ol.order_id = p_order_id and o.status = 'pending'
     and st.shop_id = o.shop_id and st.bake_date = o.collect_on and st.product_id = ol.product_id;
  update orders set status = 'cancelled' where id = p_order_id and status = 'pending';
end $$;

-- Row-level security: customers never touch these tables directly; the API uses the service role.
alter table stock enable row level security;
alter table orders enable row level security;
alter table order_lines enable row level security;
create policy "public can read availability" on stock for select using (true);
