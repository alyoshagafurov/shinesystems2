"use client";

import { useState, useEffect } from "react";
import { CartProvider } from "./CartProvider";
import { FavoritesProvider } from "./FavoritesProvider";
import { Header } from "./Header";
import { CompanyInfo } from "./CompanyInfo";
import { Catalog } from "./Catalog";
import { CartDrawer } from "./CartDrawer";

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

export function ClientApp({ categories: initialCategories, products: initialProducts }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/products", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
    });
  }, []);

  return (
    <FavoritesProvider>
      <CartProvider>
        <Header />
        <main className="flex-1">
          <CompanyInfo />
          <div className="border-t border-neutral-100" />
          <Catalog categories={categories} products={products} />
        </main>

        <footer className="border-t border-neutral-100 bg-neutral-50">
          <div className="max-w-5xl mx-auto px-4 py-8 text-center">
            <p className="text-xs text-neutral-400">
              AUTOSHINE.TJ — Детейлинг Маркет
            </p>
            <p className="text-xs text-neutral-300 mt-1">
              ш. Душанбе бозори Кушониён блоки 14 моғозаи 4492
            </p>
            <a href="/admin" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-neutral-200 text-neutral-500 text-xs font-medium hover:bg-neutral-300 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Админ-панель
            </a>
          </div>
        </footer>

        <CartDrawer />
      </CartProvider>
    </FavoritesProvider>
  );
}
