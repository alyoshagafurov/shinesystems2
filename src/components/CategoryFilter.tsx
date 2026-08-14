"use client";

import { useMemo } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface Props {
  categories: Category[];
  activePath: string[];
  onNavigate: (path: string[]) => void;
}

export function CategoryFilter({ categories, activePath, onNavigate }: Props) {
  const currentParentId = activePath.length > 0 ? activePath[activePath.length - 1] : null;

  const children = useMemo(
    () => categories.filter((c) => c.parentId === currentParentId),
    [categories, currentParentId]
  );

  const breadcrumb = useMemo(() => {
    const trail: Category[] = [];
    for (const id of activePath) {
      const cat = categories.find((c) => c.id === id);
      if (cat) trail.push(cat);
    }
    return trail;
  }, [categories, activePath]);

  if (children.length === 0 && activePath.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-3">
      {activePath.length > 0 && (
        <div className="flex items-center gap-1 mb-2 flex-wrap text-xs">
          <button
            onClick={() => onNavigate([])}
            className="text-neutral-400 hover:text-neutral-600"
          >
            Все
          </button>
          {breadcrumb.map((cat, i) => (
            <span key={cat.id} className="flex items-center gap-1">
              <span className="text-neutral-300">/</span>
              <button
                onClick={() => onNavigate(activePath.slice(0, i + 1))}
                className={i === breadcrumb.length - 1 ? "font-medium text-neutral-900" : "text-neutral-400 hover:text-neutral-600"}
              >
                {cat.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {children.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activePath.length > 0 && (
            <button
              onClick={() => onNavigate(activePath.slice(0, -1))}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-100 text-sm font-medium text-neutral-500 hover:bg-neutral-200 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Назад
            </button>
          )}
          {children.map((cat) => {
            const hasChildren = categories.some((c) => c.parentId === cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onNavigate([...activePath, cat.id])}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
              >
                {cat.name}
                {hasChildren && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
