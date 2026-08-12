"use client";

import { useState, useMemo } from "react";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { ProductCard } from "./ProductCard";
import { useFavorites } from "./FavoritesProvider";

interface Category {
  id: string;
  name: string;
  slug: string;
}

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
  categoryId: string;
}

interface Props {
  categories: Category[];
  products: Product[];
}

export function Catalog({ categories, products }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const { isFavorite, totalFavorites } = useFavorites();

  const filtered = useMemo(() => {
    let result = products;
    if (showFavOnly) {
      result = result.filter((p) => isFavorite(p.id));
    }
    if (activeCategory) {
      result = result.filter((p) => p.categoryId === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, search, showFavOnly, isFavorite]);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />
      <CategoryFilter categories={categories} active={activeCategory} onSelect={setActiveCategory} />

      {totalFavorites > 0 && (
        <div className="max-w-5xl mx-auto px-4 -mt-1 mb-2">
          <button
            onClick={() => setShowFavOnly(!showFavOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
              showFavOnly
                ? "bg-red-50 text-red-500 border border-red-200"
                : "bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-neutral-100"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={showFavOnly ? "#ef4444" : "none"} stroke={showFavOnly ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            Избранное ({totalFavorites})
          </button>
        </div>
      )}

      <section className="max-w-5xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-sm">
              {showFavOnly ? "Нет избранных товаров" : "Ничего не найдено"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
