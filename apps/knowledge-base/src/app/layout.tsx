import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Fathom from "@/component/Fathom";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Peppermint Knowledge Base",
  description:
    "Find answers, guides, and troubleshooting steps for Peppermint.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>
        <Fathom />
        {children}
      </body>
    </html>
  );
}
