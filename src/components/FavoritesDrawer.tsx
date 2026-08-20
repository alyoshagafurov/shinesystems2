"use client";

import { useFavorites } from "./FavoritesProvider";
import { useCart } from "./CartProvider";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  inStock: boolean;
}

export function FavoritesDrawer({ products }: { products: Product[] }) {
  const { favorites, toggleFavorite, favDrawerOpen, setFavDrawerOpen } = useFavorites();
  const { addItem, items } = useCart();

  if (!favDrawerOpen) return null;

  const favProducts = products.filter((p) => favorites.has(p.id));

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setFavDrawerOpen(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white flex flex-col animate-fadeIn">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-bold tracking-tight">Избранное</h2>
          <button onClick={() => setFavDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {favProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <p className="text-sm text-neutral-400">Нет избранных товаров</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {favProducts.map((product) => {
              const inCart = items.some((i) => i.id === product.id);
              return (
                <div key={product.id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-neutral-50 shrink-0 overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-6 h-8 rounded bg-neutral-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{product.name}</p>
                    <p className="text-sm font-bold mt-0.5">{product.price.toLocaleString("ru-RU")} с.</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {product.inStock && !inCart && (
                        <button
                          onClick={() => addItem(product as Parameters<typeof addItem>[0])}
                          className="px-3 py-1.5 rounded-lg bg-neutral-100 text-xs font-medium"
                        >
                          В корзину
                        </button>
                      )}
                      {inCart && <span className="text-xs text-green-600 font-medium">В корзине</span>}
                      <button
                        onClick={() => toggleFavorite(product.id)}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
