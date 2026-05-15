import type { Metadata } from "next";
import { Instrument_Sans, Shrikhand, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
});

const shrikhand = Shrikhand({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-display",
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Echoes — Voices of care-experienced Wales",
  description:
    "A demo dashboard surfacing the voices of care-experienced children and young people in Wales. Built for the Voices From Care Cymru (VFCC) board and the AWS Imagine Grant 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${instrumentSans.variable} ${shrikhand.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-[family-name:var(--font-ui)] antialiased">
        {children}
      </body>
    </html>
  );
}
