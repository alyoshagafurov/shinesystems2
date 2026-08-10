"use client";

import { useCart } from "./CartProvider";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addItem, removeItem, updateQuantity, items } = useCart();
  const inCart = items.find((i) => i.id === product.id);

  return (
    <div className="animate-fadeIn bg-white rounded-2xl border border-neutral-100 overflow-hidden">
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
        {product.description && (
          <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-50">
          <span className="text-base font-bold">
            {product.price.toLocaleString("ru-RU")} с.
          </span>
          {inCart ? (
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
