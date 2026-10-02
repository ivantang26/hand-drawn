/**
 * Acceptance check: stock can never go below zero under concurrent orders.
 *
 * Fires a crowd of simultaneous orders at the last few loaves, with payments taking a random
 * time and some cards declining, then checks that exactly the available stock was sold and
 * that nothing went negative. Also checks the 8pm cut-off and a full collection slot.
 *
 *   npm run test:stock
 */
import assert from "node:assert/strict";
import { addDays, londonNow, weekday, type LondonNow } from "../lib/dates";
import { SLOT_CAPACITY, collectionSlots, getShop } from "../lib/shops";
import { availability, bakePlan, placeOrder, resetStore, slotOptions, updateBake, StoreError } from "../lib/server/store";

(process.env as Record<string, string>).NODE_ENV = "test";

// Pick a morning when Mill Lane is open, beyond the seeded demo orders and the demo closure.
const real = londonNow();
let date = addDays(real.date, 4);
while (!getShop("mill-lane")!.hours[weekday(date)]) date = addDays(date, 1);
const now: LondonNow = { date: addDays(date, -1), minutes: 9 * 60 };
const slots = collectionSlots(getShop("mill-lane")!, date);

const customer = (i: number) => ({ name: `Tester ${i}`, email: `t${i}@example.com`, phone: `07700 900${String(i).padStart(3, "0")}` });

async function crowd() {
  resetStore(now);
  const product = "country-loaf";
  const before = bakePlan("mill-lane", date).find((r) => r.productId === product)!;
  // Leave exactly 3 loaves.
  await updateBake("mill-lane", date, product, { planned: before.sold + 3 });
  assert.equal(availability("mill-lane", date)[product].remaining, 3);

  // Only aim at slots with room, so every refusal below is about stock, not a full slot.
  const open = slotOptions("mill-lane", date).filter((s) => s.available).map((s) => s.time);
  const attempts = 60;
  const results = await Promise.allSettled(
    Array.from({ length: attempts }, (_, i) =>
      placeOrder(
        { shop: "mill-lane", date, slot: open[i % open.length], lines: [{ productId: product, qty: 1 }], customer: customer(i) },
        { now, paymentDelayMs: Math.floor(Math.random() * 40), failPayment: i % 7 === 0 },
      ),
    ),
  );

  const ok = results.filter((r) => r.status === "fulfilled").length;
  const slotFull = results.filter((r) => r.status === "rejected" && (r.reason as StoreError).field === "slot").length;
  const soldOut = results.filter((r) => r.status === "rejected" && (r.reason as StoreError).field === "lines").length;
  const declined = results.filter((r) => r.status === "rejected" && (r.reason as StoreError).status === 402).length;
  const left = availability("mill-lane", date)[product].remaining;
  const row = bakePlan("mill-lane", date).find((r) => r.productId === product)!;

  console.log(`  ${attempts} simultaneous orders for 3 loaves → ${ok} paid, ${declined} declined, ${soldOut} told "sold out", ${slotFull} slot full; ${left} left`);
  assert.ok(declined >= 1, "the declined-card path was exercised");
  assert.ok(ok <= 3, "never sells more than was baked");
  assert.ok(left >= 0 && row.planned - row.sold >= 0, "stock never goes negative");
  assert.equal(ok + left, 3, "every loaf is either sold or still available (declined cards release stock)");
}

async function multiLine() {
  resetStore(now);
  await updateBake("mill-lane", date, "croissant", { planned: bakePlan("mill-lane", date).find((r) => r.productId === "croissant")!.sold + 2 });
  const results = await Promise.allSettled(
    Array.from({ length: 20 }, (_, i) =>
      placeOrder(
        {
          shop: "mill-lane",
          date,
          slot: slots[(i + 3) % slots.length],
          lines: [
            { productId: "croissant", qty: 1 },
            { productId: "baguette", qty: 1 },
          ],
          customer: customer(i),
        },
        { now, paymentDelayMs: 5 },
      ),
    ),
  );
  const ok = results.filter((r) => r.status === "fulfilled").length;
  console.log(`  20 two-item baskets competing for 2 croissants → ${ok} paid, croissants left ${availability("mill-lane", date).croissant.remaining}`);
  assert.equal(ok, 2);
  assert.equal(availability("mill-lane", date).croissant.remaining, 0);
}

async function cutoff() {
  resetStore(now);
  const tomorrow = addDays(now.date, 1);
  const late: LondonNow = { date: now.date, minutes: 20 * 60 + 1 };
  await assert.rejects(
    placeOrder({ shop: "mill-lane", date: tomorrow, slot: slots[0], lines: [{ productId: "baguette", qty: 1 }], customer: customer(1) }, { now: late, paymentDelayMs: 0 }),
    (e: StoreError) => e.status === 409 && /8pm/.test(e.message),
  );
  console.log("  orders for tomorrow are refused after 8pm, with the reason");
}

async function fullSlot() {
  resetStore(now);
  const slot = slots[slots.length - 1];
  const results = await Promise.allSettled(
    Array.from({ length: SLOT_CAPACITY + 8 }, (_, i) =>
      placeOrder({ shop: "mill-lane", date, slot, lines: [{ productId: "filter-coffee", qty: 1 }], customer: customer(i) }, { now, paymentDelayMs: 0 }),
    ),
  );
  const ok = results.filter((r) => r.status === "fulfilled").length;
  console.log(`  ${SLOT_CAPACITY + 8} orders for one ${slot} slot → ${ok} accepted (capacity includes seeded orders)`);
  assert.ok(ok <= SLOT_CAPACITY);
}

(async () => {
  console.log(`Stock and slot checks for Mill Lane, ${date}:`);
  await crowd();
  await multiLine();
  await cutoff();
  await fullSlot();
  console.log("\nAll checks passed.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
