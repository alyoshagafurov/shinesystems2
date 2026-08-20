import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AUTOSHINE.TJ — Детейлинг Маркет",
  description: "Автохимия и аксессуары для детейлинга в Душанбе. Доставка по Таджикистану.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col bg-white text-neutral-900">
        {children}
      </body>
    </html>
  );
}
