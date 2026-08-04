"use client";

import { useCart } from "./CartProvider";

export function Header() {
  const { totalItems, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="AUTOSHINE.TJ" className="w-full h-full object-contain" />
          </div>
          <span className="text-sm font-semibold tracking-tight">AUTOSHINE.TJ ОПТ</span>
        </div>

        <div className="flex items-center gap-1">
        <a
          href="/admin"
          className="p-2"
          aria-label="Админ-панель"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </a>
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-2 -mr-2"
          aria-label="Корзина"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-neutral-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
        </div>
      </div>
    </header>
  );
}
