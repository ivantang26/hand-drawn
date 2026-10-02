import type { Metadata, Viewport } from "next";
import { Caveat, DM_Sans, Fraunces } from "next/font/google";
import { IllustrationSprite } from "@/components/illustrations";
import { MotionManager } from "@/components/MotionManager";
import "./globals.css";
import "./site.css";

const display = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-display",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const hand = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Wildroot · Sourdough bakery & café", template: "%s · Wildroot" },
  description:
    "Slow bread for busy mornings. Pre-order tomorrow's sourdough, pastries and coffee for collection from our two Ashcombe shops.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F7F1E5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable} ${hand.variable}`} suppressHydrationWarning>
      <head>
        {/* Lets CSS hide hand-drawn marks until they can draw in; without JS they simply show. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <IllustrationSprite />
        {children}
        <MotionManager />
      </body>
    </html>
  );
}
