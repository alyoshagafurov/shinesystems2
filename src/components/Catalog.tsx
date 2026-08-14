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

function getPathToCategory(categories: Category[], catId: string): string[] {
  const path: string[] = [];
  let current = categories.find((c) => c.id === catId);
  while (current) {
    path.unshift(current.id);
    current = current.parentId ? categories.find((c) => c.id === current!.parentId) : undefined;
  }
  return path;
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

  const matchedCategories = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

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
      const terms = q.split(/\s+/);
      result = result.filter((p) => {
        const text = [
          p.name, p.description, p.composition, p.dilution,
          p.application, p.precautions, p.storage, p.shelfLife,
          String(p.price),
        ].join(" ").toLowerCase();
        return terms.every((t) => text.includes(t));
      });
    }
    return result;
  }, [filteredByCategory, search, showFavOnly, isFavorite]);

  const handleNavigate = useCallback((path: string[]) => {
    setCategoryPath(path);
  }, []);

  const navigateToCategory = useCallback((catId: string) => {
    const path = getPathToCategory(categories, catId);
    setCategoryPath(path);
    setSearch("");
  }, [categories]);

  const getCategoryBreadcrumb = useCallback((cat: Category): string => {
    const parts: string[] = [cat.name];
    let current = cat;
    while (current.parentId) {
      const parent = categories.find((c) => c.id === current.parentId);
      if (!parent) break;
      parts.unshift(parent.name);
      current = parent;
    }
    return parts.join(" → ");
  }, [categories]);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />
      <CategoryFilter categories={categories} activePath={categoryPath} onNavigate={handleNavigate} />

      {matchedCategories.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-2">
          <p className="text-xs text-neutral-400 mb-2">Категории по запросу:</p>
          <div className="flex flex-wrap gap-2">
            {matchedCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigateToCategory(cat.id)}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
              >
                {getCategoryBreadcrumb(cat)}
              </button>
            ))}
          </div>
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
