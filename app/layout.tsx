import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Sam's Albums",
    default: "Sam's Albums",
  },
  description:
    "A personal music album collection, ranked and reviewed by Sam Gage.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://albums.gage.cool",
    siteName: "Sam's Albums",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-surface text-white antialiased">{children}</body>
    </html>
  );
}
