/** Shapes shared by the API, the server store and client components. */
import type { ISODate } from "./dates";
import type { Closure, DateOption, ShopId } from "./shops";

export type AvailabilityStatus = "plenty" | "few" | "soldout";

export type ProductAvailability = { remaining: number; status: AvailabilityStatus };

export type AvailabilityMap = Record<string, ProductAvailability>;

export type SlotOption = { time: string; available: boolean; left: number };

export type OrderOptions = {
  shop: ShopId;
  dates: DateOption[];
  date: ISODate | null;
  slots: SlotOption[];
  availability: AvailabilityMap;
  now: { date: ISODate; minutes: number };
};

export type OrderLine = { productId: string; name: string; qty: number; price: number };

export type Customer = { name: string; email: string; phone: string };

export type Order = {
  id: string;
  shop: ShopId;
  date: ISODate;
  slot: string;
  lines: OrderLine[];
  total: number;
  customer: Customer;
  notes?: string;
  status: "pending" | "paid" | "collected" | "cancelled";
  createdAt: string;
  collectedAt?: string;
};

export type BasketLine = { productId: string; qty: number };

export type PlaceOrderInput = {
  shop: string;
  date: string;
  slot: string;
  lines: BasketLine[];
  customer: Customer;
  notes?: string;
};

export type Shortage = { productId: string; name: string; requested: number; remaining: number };

export type ApiError = { error: string; field?: string; shortages?: Shortage[] };

export type Special = {
  id: string;
  kind: "today" | "seasonal";
  title: string;
  detail?: string;
  price?: string;
};

export type BakeRow = {
  productId: string;
  planned: number;
  sold: number;
  remaining: number;
  soldOut: boolean;
  par: number;
};

export type WorkshopSession = {
  id: string;
  typeId: string;
  date: ISODate;
  start: string;
  seatsLeft: number;
  seats: number;
};

export type Booking = {
  id: string;
  sessionId: string;
  seats: number;
  name: string;
  email: string;
  total: number;
  voucherApplied: number;
  paid: number;
  createdAt: string;
};

export type Voucher = {
  code: string;
  amount: number;
  balance: number;
  recipient: string;
  from: string;
  message?: string;
  buyerEmail: string;
  createdAt: string;
};

export type Enquiry = {
  id: string;
  kind: "wholesale" | "contact";
  fields: Record<string, string>;
  createdAt: string;
};

export type OutboxMessage = {
  channel: "email" | "sms";
  to: string;
  subject?: string;
  body: string;
  at: string;
};

export type { Closure };
