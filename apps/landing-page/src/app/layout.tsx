import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pepperminto.sh"),
  title: "Pepperminto — Calm support, fast resolution",
  description:
    "Pepperminto is the open-source helpdesk for teams who want clarity, speed, and a public knowledge base that stays in sync with every ticket.",
  openGraph: {
    title: "Pepperminto — Calm support, fast resolution",
    description:
      "A modern, open-source helpdesk with a public knowledge base and a refined admin experience.",
    images: ["/og-image.png"],
    url: "https://pepperminto.sh",
  },
  twitter: {
    card: "summary_large_image",
    site: "@pepperminto",
    creator: "@pepperminto",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${sourceSans.variable} bg-grain`}>
        {children}
      </body>
    </html>
  );
}
