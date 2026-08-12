"use client";

import { useState, useMemo } from "react";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { ProductCard } from "./ProductCard";

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

  const filtered = useMemo(() => {
    let result = products;
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
  }, [products, activeCategory, search]);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />
      <CategoryFilter categories={categories} active={activeCategory} onSelect={setActiveCategory} />

      <section className="max-w-5xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-sm">Ничего не найдено</p>
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
