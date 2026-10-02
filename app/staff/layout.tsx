import type { Metadata } from "next";
import { StaffNav } from "@/components/staff/StaffNav";
import "./staff.css";

export const metadata: Metadata = {
  title: { default: "Staff", template: "%s · Wildroot staff" },
  robots: { index: false, follow: false },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="staff">
      <StaffNav />
      <p className="staff-demo">
        Demo: in production these pages sit behind staff sign-in. Changes here affect the live site straight away.
      </p>
      <main id="main" className="staff__main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
