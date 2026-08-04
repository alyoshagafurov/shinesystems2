import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AUTOSHINE.TJ ОПТ — Оптовый Детейлинг Маркет",
  description: "Оптовая продажа автохимии и аксессуаров для детейлинга в Душанбе. Доставка по Таджикистану.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
