"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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

  useEffect(() => {
    const handler = () => {
      setCategoryPath([]);
      setSearch("");
    };
    window.addEventListener("autoshine-go-home", handler);
    return () => window.removeEventListener("autoshine-go-home", handler);
  }, []);

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
    let result = search.trim() ? products : filteredByCategory;
    if (showFavOnly) {
      result = result.filter((p) => isFavorite(p.id));
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const terms = q.split(/\s+/);
      result = result
        .filter((p) => {
          const text = [
            p.name, p.description, p.composition, p.dilution,
            p.application, p.precautions, p.storage, p.shelfLife,
            String(p.price),
          ].join(" ").toLowerCase();
          return terms.every((t) => text.includes(t));
        })
        .sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aMatch = terms.every((t) => aName.includes(t));
          const bMatch = terms.every((t) => bName.includes(t));
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          const aPartial = terms.some((t) => aName.includes(t));
          const bPartial = terms.some((t) => bName.includes(t));
          if (aPartial && !bPartial) return -1;
          if (!aPartial && bPartial) return 1;
          return 0;
        });
    }
    return result;
  }, [products, filteredByCategory, search, showFavOnly, isFavorite]);

  const handleNavigate = useCallback((path: string[]) => {
    setCategoryPath(path);
  }, []);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />
      <CategoryFilter categories={categories} activePath={categoryPath} onNavigate={handleNavigate} />

      <section className="py-1">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-sm">
              {showFavOnly ? "Нет избранных товаров" : "Ничего не найдено"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[1px] bg-neutral-100">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
