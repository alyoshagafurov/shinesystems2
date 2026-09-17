"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { ProductCard } from "./ProductCard";
import { useFavorites } from "./FavoritesProvider";
import { CATALOG_STATE_KEY } from "@/lib/nav";

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  inStock: boolean;
  categoryId: string;
}

interface Props {
  categories: CatalogCategory[];
  products: CatalogProduct[];
}

const PAGE_SIZE = 24;

function getDescendantIds(categories: CatalogCategory[], parentId: string): Set<string> {
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
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [searchIndex, setSearchIndex] = useState<Record<string, string> | null>(null);
  const [indexStatus, setIndexStatus] = useState<"idle" | "loading" | "done">("idle");
  const { isFavorite, showFavOnly } = useFavorites();
  const router = useRouter();
  const [restored, setRestored] = useState(false);
  const pendingScroll = useRef<number | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const indexRequested = useRef(false);

  const loadSearchIndex = useCallback(() => {
    if (indexRequested.current) return;
    indexRequested.current = true;
    setIndexStatus("loading");
    fetch("/api/search-index", { cache: "no-store" })
      .then((r) => r.json())
      .then((index) => setSearchIndex(index))
      .catch(() => {})
      .finally(() => setIndexStatus("done"));
  }, []);

  useEffect(() => {
    const pid = new URLSearchParams(window.location.search).get("product");
    if (pid) {
      router.replace(`/product/${encodeURIComponent(pid)}`);
      return;
    }
    try {
      const saved = JSON.parse(sessionStorage.getItem(CATALOG_STATE_KEY) || "null");
      if (saved) {
        setCategoryPath(Array.isArray(saved.categoryPath) ? saved.categoryPath : []);
        const savedSearch = typeof saved.search === "string" ? saved.search : "";
        setSearch(savedSearch);
        if (savedSearch.trim()) loadSearchIndex();
        setLimit(Math.max(PAGE_SIZE, Number(saved.limit) || 0));
        pendingScroll.current = Number(saved.scrollY) || 0;
      }
    } catch {}
    setRestored(true);
  }, [router, loadSearchIndex]);

  const saveState = useCallback(() => {
    try {
      sessionStorage.setItem(CATALOG_STATE_KEY, JSON.stringify({ categoryPath, search, limit, scrollY: window.scrollY }));
    } catch {}
  }, [categoryPath, search, limit]);

  useEffect(() => {
    if (!restored) return;
    if (pendingScroll.current !== null) {
      window.scrollTo(0, pendingScroll.current);
      pendingScroll.current = null;
    }
    saveState();
  }, [restored, saveState]);

  useEffect(() => {
    const handler = () => {
      setCategoryPath([]);
      setSearch("");
      setLimit(PAGE_SIZE);
    };
    window.addEventListener("autoshine-go-home", handler);
    return () => window.removeEventListener("autoshine-go-home", handler);
  }, []);

  const query = search.trim().toLowerCase();

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
    let result = query ? products : filteredByCategory;
    if (showFavOnly) {
      result = result.filter((p) => isFavorite(p.id));
    }
    if (query) {
      const terms = query.split(/\s+/);
      result = result
        .filter((p) => {
          const text = `${p.name.toLowerCase()} ${searchIndex?.[p.id] ?? ""} ${p.price}`;
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
  }, [products, filteredByCategory, query, searchIndex, showFavOnly, isFavorite]);

  const hasMore = limit < filtered.length;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setLimit((l) => l + PAGE_SIZE);
      },
      { rootMargin: "1200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, limit]);

  const handleNavigate = useCallback((path: string[]) => {
    setCategoryPath(path);
    setLimit(PAGE_SIZE);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setLimit(PAGE_SIZE);
    if (value.trim()) loadSearchIndex();
  }, [loadSearchIndex]);

  const searching = query !== "" && indexStatus === "loading";

  return (
    <>
      <SearchBar value={search} onChange={handleSearch} />
      <CategoryFilter categories={categories} activePath={categoryPath} onNavigate={handleNavigate} />

      <section onClickCapture={saveState} className="sm:max-w-5xl sm:mx-auto sm:px-4 sm:py-6 py-0">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-sm">
              {showFavOnly ? "Нет избранных товаров" : searching ? "Ищем…" : "Ничего не найдено"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-[1px] bg-neutral-100 sm:gap-4 sm:bg-transparent sm:grid-cols-3 lg:grid-cols-4">
              {filtered.slice(0, limit).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMore && <div ref={sentinel} className="h-px" aria-hidden />}
          </>
        )}
      </section>
    </>
  );
}
