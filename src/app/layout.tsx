import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AUTOSHINE.TJ — Детейлинг Маркет",
  description: "Автохимия и аксессуары для детейлинга в Душанбе. Доставка по Таджикистану.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col bg-white text-neutral-900 touch-manipulation">
        {children}
      </body>
    </html>
  );
}
