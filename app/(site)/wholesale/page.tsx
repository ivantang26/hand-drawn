import type { Metadata } from "next";
import { EnquiryForm, type EnquiryField } from "@/components/EnquiryForm";
import { Illo } from "@/components/illustrations";
import { PageHeader } from "@/components/PageHeader";
import "../../pages.css";

export const metadata: Metadata = {
  title: "Wholesale",
  description: "Sourdough and pastries for cafés, restaurants and delis around Ashcombe.",
};

const FIELDS: EnquiryField[] = [
  { name: "business", label: "Business name", required: true, autoComplete: "organization" },
  { name: "type", label: "What kind of business?", type: "select", options: ["Café", "Restaurant", "Deli or farm shop", "Hotel or B&B", "Office", "Something else"] },
  {
    name: "volume",
    label: "Rough weekly volume",
    type: "select",
    required: true,
    options: ["Up to 20 loaves", "20–60 loaves", "60–150 loaves", "More than 150 loaves", "Mostly pastries"],
  },
  { name: "area", label: "Delivery area or postcode", required: true, hint: "We deliver within about 8 miles of Mill Lane, six days a week." },
  { name: "name", label: "Your name", required: true, autoComplete: "name" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "message", label: "Anything else we should know?", type: "textarea" },
];

export default function WholesalePage() {
  return (
    <>
      <PageHeader
        kicker="Bread for your menu"
        title="Wholesale"
        intro="We bake for a handful of local cafés, restaurants and delis. If you'd like our bread on your tables, tell us a little about your business and we'll be in touch within two working days."
        illo="flourSack"
        blob="d"
      />
      <div className="container split">
        <div className="split__aside">
          <ul className="perks">
            <li>
              <Illo name="clock" />
              <div>
                <h2>Delivered by 7am</h2>
                <p>Our van leaves at 5:30. Orders by 2pm the day before.</p>
              </div>
            </li>
            <li>
              <Illo name="loaf" />
              <div>
                <h2>The full range</h2>
                <p>Every loaf on our menu, plus tin loaves and rolls made for sandwiches.</p>
              </div>
            </li>
            <li>
              <Illo name="calendar" />
              <div>
                <h2>Standing orders</h2>
                <p>Set it once, change it any day before 2pm. Monthly invoicing.</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="card">
          <EnquiryForm
            kind="wholesale"
            fields={FIELDS}
            submitLabel="Send enquiry"
            thanks="We've got your details. Our head baker will get back to you within two working days, usually with a box of samples."
            illo="flourSack"
          />
        </div>
      </div>
    </>
  );
}
