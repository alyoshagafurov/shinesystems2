"use client";

import { useState, useMemo, useCallback } from "react";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { ProductCard } from "./ProductCard";
import { useFavorites } from "./FavoritesProvider";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
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

function getDescendantIds(categories: Category[], parentId: string): Set<string> {
  const ids = new Set<string>();
  const queue = [parentId];
  while (queue.length > 0) {
    const pid = queue.shift()!;
    for (const c of categories) {
      if (c.parentId === pid && !ids.has(c.id)) {
        ids.add(c.id);
        queue.push(c.id);
      }
    }
  }
  return ids;
}

export function Catalog({ categories, products }: Props) {
  const [search, setSearch] = useState("");
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const { isFavorite, showFavOnly } = useFavorites();

  const activeCategory = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1] : null;

  const filteredByCategory = useMemo(() => {
    if (!activeCategory) return products;
    const hasDirectProducts = products.some((p) => p.categoryId === activeCategory);
    const descendantIds = getDescendantIds(categories, activeCategory);
    if (hasDirectProducts || descendantIds.size === 0) {
      return products.filter((p) => p.categoryId === activeCategory || descendantIds.has(p.categoryId));
    }
    return products.filter((p) => descendantIds.has(p.categoryId));
  }, [products, categories, activeCategory]);

  const filtered = useMemo(() => {
    let result = filteredByCategory;
    if (showFavOnly) {
      result = result.filter((p) => isFavorite(p.id));
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
  }, [filteredByCategory, search, showFavOnly, isFavorite]);

  const handleNavigate = useCallback((path: string[]) => {
    setCategoryPath(path);
  }, []);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />
      <CategoryFilter categories={categories} activePath={categoryPath} onNavigate={handleNavigate} />

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
