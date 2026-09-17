"use client";

import { useState, useEffect } from "react";
import { SiteShell } from "./SiteShell";
import { CompanyInfo } from "./CompanyInfo";
import { Catalog } from "./Catalog";

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
    <SiteShell products={products}>
      <CompanyInfo />
      <div className="border-t border-neutral-100" />
      <Catalog categories={categories} products={products} />
    </SiteShell>
  );
}
