import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm, type EnquiryField } from "@/components/EnquiryForm";
import { Icon } from "@/components/illustrations";
import { PageHeader } from "@/components/PageHeader";
import { SHOPS } from "@/lib/shops";
import "../../pages.css";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with Wildroot." };

const FIELDS: EnquiryField[] = [
  { name: "name", label: "Your name", required: true, autoComplete: "name" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "shop", label: "Which shop is this about?", type: "select", options: ["Mill Lane", "Harbour Street", "Both, or neither"] },
  { name: "order", label: "Order or booking number", hint: "If it's about an order, e.g. WR-7K3PQ." },
  { name: "message", label: "Message", type: "textarea", required: true },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        kicker="We read everything"
        title="Say hello"
        intro="Questions about an order, a birthday cake, a private class or just which loaf goes with soup? Call the shop in the morning, or send us a note."
        illo="cup"
        blob="a"
      />
      <div className="container split">
        <div className="split__aside">
          {SHOPS.map((s) => (
            <div key={s.id} className="contact-shop">
              <h2>{s.short}</h2>
              <address>{s.address.join(", ")}</address>
              <p>
                <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="icon-link">
                  <Icon name="phone" /> {s.phone}
                </a>
              </p>
            </div>
          ))}
          <p>
            <a href="mailto:hello@wildroot.example" className="icon-link">
              <Icon name="mail" /> hello@wildroot.example
            </a>
          </p>
          <p className="small muted">
            For trade supply, use the <Link href="/wholesale">wholesale form</Link>. To change an order, call before 8pm the evening before.
          </p>
        </div>
        <div className="card">
          <EnquiryForm kind="contact" fields={FIELDS} submitLabel="Send message" thanks="Thanks for getting in touch. We reply within a day, usually after the morning rush." illo="cup" />
        </div>
      </div>
    </>
  );
}
