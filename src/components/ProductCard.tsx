"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
}

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addItem, removeItem, updateQuantity, items } = useCart();
  const inCart = items.find((i) => i.id === product.id);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="animate-fadeIn bg-white rounded-2xl border border-neutral-100 overflow-hidden cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="aspect-square bg-neutral-50 relative overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-200">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold tracking-tight leading-tight">
            {product.name}
          </h3>
          <span className={`inline-block mt-1.5 text-[11px] font-medium ${product.inStock ? "text-green-600" : "text-red-500"}`}>
            {product.inStock ? "В наличии" : "Нет в наличии"}
          </span>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-50">
            <span className="text-base font-bold">
              {product.price.toLocaleString("ru-RU")} с.
            </span>
            {inCart ? (
              <div
                className="flex items-center gap-0 rounded-xl border border-neutral-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    inCart.quantity <= 1
                      ? removeItem(product.id)
                      : updateQuantity(product.id, inCart.quantity - 1)
                  }
                  className="w-9 h-9 flex items-center justify-center text-lg font-bold text-neutral-600 hover:bg-neutral-100 active:scale-[0.9] transition-all"
                >
                  −
                </button>
                <span className="w-9 h-9 flex items-center justify-center text-sm font-bold bg-neutral-900 text-white">
                  {inCart.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center text-lg font-bold text-neutral-600 hover:bg-neutral-100 active:scale-[0.9] transition-all"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addItem(product);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.95] bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              >
                В корзину
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white w-full max-w-lg mx-4 rounded-2xl overflow-hidden max-h-[90dvh] flex flex-col animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="overflow-y-auto">
              {product.image && (
                <div className="w-full aspect-square bg-neutral-50">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5 space-y-3">
                <h2 className="text-lg font-bold">{product.name}</h2>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${product.inStock ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  {product.inStock ? "В наличии" : "Нет в наличии"}
                </span>
                {product.description && (
                  <p className="text-sm text-neutral-500 leading-relaxed">{product.description}</p>
                )}
                <p className="text-2xl font-bold">{product.price.toLocaleString("ru-RU")} с.</p>

                {inCart ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0 rounded-xl border border-neutral-200 overflow-hidden">
                      <button
                        onClick={() =>
                          inCart.quantity <= 1
                            ? removeItem(product.id)
                            : updateQuantity(product.id, inCart.quantity - 1)
                        }
                        className="w-11 h-11 flex items-center justify-center text-lg font-bold text-neutral-600 hover:bg-neutral-100"
                      >
                        −
                      </button>
                      <span className="w-11 h-11 flex items-center justify-center text-sm font-bold bg-neutral-900 text-white">
                        {inCart.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
                        className="w-11 h-11 flex items-center justify-center text-lg font-bold text-neutral-600 hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-neutral-400">в корзине</span>
                  </div>
                ) : (
                  <button
                    onClick={() => addItem(product)}
                    className="w-full py-3.5 rounded-xl bg-neutral-900 text-white text-sm font-medium active:scale-[0.98] transition-transform"
                  >
                    В корзину
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
