"use client";

import { useState, useEffect } from "react";
import { SiteShell } from "./SiteShell";
import { CompanyInfo } from "./CompanyInfo";
import { Catalog, type CatalogCategory, type CatalogProduct } from "./Catalog";

interface Props {
  categories: CatalogCategory[];
  products: CatalogProduct[];
  version: string;
}

export function ClientApp({ categories: initialCategories, products: initialProducts, version }: Props) {
  const [catalog, setCatalog] = useState({ categories: initialCategories, products: initialProducts });

  useEffect(() => {
    fetch(`/api/catalog?v=${encodeURIComponent(version)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.unchanged && Array.isArray(data.products) && Array.isArray(data.categories)) {
          setCatalog({ categories: data.categories, products: data.products });
        }
      })
      .catch(() => {});
  }, [version]);

  return (
    <SiteShell products={catalog.products}>
      <CompanyInfo />
      <div className="border-t border-neutral-100" />
      <Catalog categories={catalog.categories} products={catalog.products} />
    </SiteShell>
  );
}
