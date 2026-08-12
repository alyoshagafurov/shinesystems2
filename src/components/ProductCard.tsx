"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { useFavorites } from "./FavoritesProvider";

interface Product {
  id: string;
  name: string;
  description: string;
  composition: string;
  dilution: string;
  application: string;
  precautions: string;
  storage: string;
  shelfLife: string;
  price: number;
  images: string[];
  inStock: boolean;
}

interface Props {
  product: Product;
}

function InfoSection({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <div className="py-2.5 border-b border-neutral-100 last:border-0">
      <p className="text-xs font-bold text-neutral-800 mb-1">{label}</p>
      <p className="text-xs text-neutral-500 leading-relaxed">{text}</p>
    </div>
  );
}

export function ProductCard({ product }: Props) {
  const { addItem, removeItem, updateQuantity, items } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const inCart = items.find((i) => i.id === product.id);
  const [open, setOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const firstImage = product.images?.[0];
  const fav = isFavorite(product.id);

  return (
    <>
      <div
        className="animate-fadeIn bg-white rounded-2xl border border-neutral-100 overflow-hidden cursor-pointer"
        onClick={() => { setOpen(true); setActiveImg(0); }}
      >
        <div className="aspect-square bg-neutral-50 relative overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
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
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm active:scale-90 transition-transform z-[1]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? "#ef4444" : "none"} stroke={fav ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={fav ? "" : "text-neutral-400"}>
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold">Нет в наличии</span>
            </div>
          )}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium">
              1/{product.images.length}
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
            {!product.inStock ? (
              <span className="px-3 py-2 rounded-xl bg-neutral-50 text-[11px] text-neutral-400">Недоступно</span>
            ) : inCart ? (
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
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[92dvh] flex flex-col animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <button
                onClick={() => toggleFavorite(product.id)}
                className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "#ef4444" : "none"} stroke={fav ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={fav ? "" : "text-neutral-600"}>
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {product.images.length > 0 && (
                <div className="relative">
                  <div className="w-full aspect-[4/3] bg-neutral-50 overflow-hidden">
                    <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImg((prev) => (prev - 1 + product.images.length) % product.images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                      </button>
                      <button
                        onClick={() => setActiveImg((prev) => (prev + 1) % product.images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {product.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImg(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? "bg-white scale-125" : "bg-white/50"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="p-5">
                <h2 className="text-base font-bold leading-snug break-words">{product.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xl font-bold">{product.price.toLocaleString("ru-RU")} с.</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${product.inStock ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {product.inStock ? "В наличии" : "Нет в наличии"}
                  </span>
                </div>

                <div className="mt-4">
                  <InfoSection label="Описание" text={product.description} />
                  <InfoSection label="Состав" text={product.composition} />
                  <InfoSection label="Разбавление" text={product.dilution} />
                  <InfoSection label="Применение" text={product.application} />
                  <InfoSection label="Меры предосторожности" text={product.precautions} />
                  <InfoSection label="Условия хранения" text={product.storage} />
                  <InfoSection label="Срок годности" text={product.shelfLife} />
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 p-4">
              {!product.inStock ? (
                <div className="w-full py-3.5 rounded-xl bg-neutral-100 text-neutral-400 text-sm font-medium text-center">
                  Нет в наличии
                </div>
              ) : inCart ? (
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
                  <span className="text-sm font-medium">{(inCart.quantity * product.price).toLocaleString("ru-RU")} с.</span>
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
      )}
    </>
  );
}
