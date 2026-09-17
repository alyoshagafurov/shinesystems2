"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { useFavorites } from "./FavoritesProvider";
import { markInternalNav } from "@/lib/nav";
import { ProductImage } from "./ProductImage";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  inStock: boolean;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, removeItem, updateQuantity, items } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const inCart = items.find((i) => i.id === product.id);

  const href = `/product/${product.id}`;
  const firstImage = product.images?.[0];
  const fav = isFavorite(product.id);

  return (
    <div className="animate-fadeIn bg-white overflow-hidden sm:rounded-2xl sm:border sm:border-neutral-100">
      <div className="relative">
        <Link href={href} prefetch={false} onClick={markInternalNav} className="relative block aspect-square bg-neutral-50 overflow-hidden">
          {firstImage ? (
            <ProductImage
              src={firstImage}
              alt={product.name}
              sizes="(min-width: 1024px) 250px, (min-width: 640px) 33vw, 50vw"
              className="object-contain"
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
        </Link>
        <button
          onClick={() => toggleFavorite(product.id)}
          aria-label="В избранное"
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm active:scale-90 transition-transform z-[1]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? "#ef4444" : "none"} stroke={fav ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={fav ? "" : "text-neutral-400"}>
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
        {product.images.length > 1 && (
          <div className="pointer-events-none absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium">
            1/{product.images.length}
          </div>
        )}
      </div>

      <div className="p-3">
        <Link href={href} prefetch={false} onClick={markInternalNav} className="block">
          <h3 className="text-[13px] font-semibold tracking-tight leading-snug">
            {product.name}
          </h3>
        </Link>
        <span className={`inline-block mt-1 text-[11px] font-medium ${product.inStock ? "text-green-600" : "text-red-500"}`}>
          {product.inStock ? "В наличии" : "Нет в наличии"}
        </span>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[15px] font-bold">
            {product.price.toLocaleString("ru-RU")} с.
          </span>
          {!product.inStock ? null : inCart ? (
            <div className="flex items-center gap-0 rounded-xl border border-neutral-200 overflow-hidden">
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
              onClick={() => addItem(product)}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.95] bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            >
              В корзину
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
