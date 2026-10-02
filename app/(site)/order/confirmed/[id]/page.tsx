import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Illo } from "@/components/illustrations";
import { Mark, Note } from "@/components/shapes";
import { ButtonLink } from "@/components/ui";
import { formatDate, formatTime } from "@/lib/dates";
import { money } from "@/lib/format";
import { getShop } from "@/lib/shops";
import { getOrder } from "@/lib/server/store";
import "../../../../order.css";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function Confirmed({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const order = getOrder(id);
  if (!order || order.status === "cancelled" || order.status === "pending") notFound();
  const shop = getShop(order.shop)!;

  return (
    <div className="container confirm">
      <div className="confirm__card">
        <Illo name="bag" className="confirm__illo" />
        <Note className="confirm__kicker">Thank you, {order.customer.name.split(" ")[0]}!</Note>
        <h1>
          See you <Mark kind="circle">{formatDate(order.date)}</Mark>
        </h1>
        <p className="lead">
          Your order is paid and will be bagged and waiting at <strong>{shop.name}</strong> from{" "}
          <strong>{formatTime(order.slot)}</strong> on {formatDate(order.date, "long")}.
        </p>

        <div className="confirm__number">
          <span className="confirm__number-label">Order number</span>
          <span className="confirm__number-value">{order.id}</span>
        </div>

        <ul className="confirm__lines">
          {order.lines.map((l) => (
            <li key={l.productId}>
              <span>
                {l.qty} × {l.name}
              </span>
              <span className="price">{money(l.qty * l.price)}</span>
            </li>
          ))}
          <li className="confirm__total">
            <span>Paid</span>
            <span className="price">{money(order.total)}</span>
          </li>
        </ul>

        <p className="confirm__sent">
          We&apos;ve emailed a receipt to <strong>{order.customer.email}</strong> and texted your order number to{" "}
          <strong>{order.customer.phone}</strong>. Show either at the counter.
        </p>
        <address className="confirm__address">
          {shop.address.join(", ")} · <a href={`tel:${shop.phone.replace(/\s/g, "")}`}>{shop.phone}</a>
        </address>

        <div className="confirm__actions">
          <ButtonLink href="/order">Order something else</ButtonLink>
          <Link href="/" className="btn btn--ghost">
            Back to the home page
          </Link>
        </div>
        <p className="small muted">Plans changed? Call the shop before 8pm the evening before and we&apos;ll refund you.</p>
      </div>
    </div>
  );
}
