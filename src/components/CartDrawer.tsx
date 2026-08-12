"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { OrderForm } from "./OrderForm";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, isOpen, setIsOpen } = useCart();
  const [showOrder, setShowOrder] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={() => { setIsOpen(false); setShowOrder(false); }} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white flex flex-col animate-fadeIn">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-bold tracking-tight">
            {showOrder ? "Оформление заказа" : "Корзина"}
          </h2>
          <button
            onClick={() => { setIsOpen(false); setShowOrder(false); }}
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {showOrder ? (
          <OrderForm onBack={() => setShowOrder(false)} />
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className="text-sm text-neutral-400">Корзина пуста</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-neutral-50 shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-6 h-8 rounded bg-neutral-200" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{item.name}</p>
                    <p className="text-sm font-bold mt-0.5">{item.price.toLocaleString("ru-RU")} с.</p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center border border-neutral-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-neutral-400 text-sm"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-neutral-400 text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-300 hover:text-red-500 transition-colors ml-auto"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 px-5 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">{totalItems} товаров</span>
                <span className="font-bold text-lg">{totalPrice.toLocaleString("ru-RU")} с.</span>
              </div>
              <button
                onClick={() => setShowOrder(true)}
                className="w-full py-3.5 rounded-xl bg-neutral-900 text-white text-sm font-medium active:scale-[0.98] transition-transform"
              >
                Оформить заказ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
