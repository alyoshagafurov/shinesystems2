"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useFavorites } from "./FavoritesProvider";
import { ProductGallery } from "./ProductGallery";
import { hasInternalNav } from "@/lib/nav";

export interface ProductFull {
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

function InfoSection({ label, text }: { label: string; text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="py-4 border-b border-neutral-100 last:border-0">
      <h2 className="text-sm font-bold text-neutral-900 mb-1.5">{label}</h2>
      <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{text.trim().replace(/\n\s*\n+/g, "\n\n")}</p>
    </div>
  );
}

export function ProductDetails({ product, categoryName }: { product: ProductFull; categoryName: string }) {
  const router = useRouter();
  const { addItem, removeItem, updateQuantity, items } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [copied, setCopied] = useState(false);
  const inCart = items.find((i) => i.id === product.id);
  const fav = isFavorite(product.id);

  const goBack = () => {
    if (hasInternalNav()) router.back();
    else router.push("/");
  };

  const share = async () => {
    const url = `${window.location.origin}/product/${product.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text: product.name, url }); } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="sm:max-w-5xl sm:mx-auto sm:px-4">
      <div className="flex items-center gap-2 px-4 sm:px-0 h-12">
        <button onClick={goBack} className="flex items-center gap-1 -ml-1 pr-2 py-2 text-sm font-medium text-neutral-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Назад
        </button>
        {categoryName && <span className="text-xs text-neutral-400 truncate">{categoryName}</span>}
      </div>

      <div className="sm:grid sm:grid-cols-2 sm:gap-8 sm:items-start">
        <ProductGallery images={product.images} name={product.name} />

        <div className="px-4 pt-5 sm:px-0 sm:pt-0">
          <h1 className="text-xl font-bold leading-snug break-words">{product.name}</h1>

          <div className="flex items-center gap-2 mt-3">
            <span className="text-2xl font-bold">{product.price.toLocaleString("ru-RU")} с.</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.inStock ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
              {product.inStock ? "В наличии" : "Нет в наличии"}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-5">
            {!product.inStock ? (
              <div className="flex-1 py-3.5 rounded-xl bg-red-50 text-red-500 text-sm font-medium text-center">
                Нет в наличии
              </div>
            ) : inCart ? (
              <div className="flex-1 flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-neutral-200 overflow-hidden">
                  <button
                    onClick={() => (inCart.quantity <= 1 ? removeItem(product.id) : updateQuantity(product.id, inCart.quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-lg font-bold text-neutral-600 hover:bg-neutral-100"
                  >
                    −
                  </button>
                  <span className="w-12 h-12 flex items-center justify-center text-sm font-bold bg-neutral-900 text-white">
                    {inCart.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-lg font-bold text-neutral-600 hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm font-medium">{(inCart.quantity * product.price).toLocaleString("ru-RU")} с.</span>
              </div>
            ) : (
              <button
                onClick={() => addItem(product)}
                className="flex-1 py-3.5 rounded-xl bg-neutral-900 text-white text-sm font-medium active:scale-[0.98] transition-transform"
              >
                В корзину
              </button>
            )}

            <button
              onClick={() => toggleFavorite(product.id)}
              aria-label={fav ? "Убрать из избранного" : "В избранное"}
              className="w-12 h-12 shrink-0 rounded-xl border border-neutral-200 flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={fav ? "#ef4444" : "none"} stroke={fav ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={fav ? "" : "text-neutral-600"}>
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>

            <button
              onClick={share}
              aria-label="Поделиться"
              className="w-12 h-12 shrink-0 rounded-xl border border-neutral-200 flex items-center justify-center"
            >
              {copied ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              )}
            </button>
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
    </div>
  );
}
