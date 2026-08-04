"use client";

import { useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  active: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({ categories, active, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const activeName = categories.find((c) => c.id === active)?.name || "Все категории";

  return (
    <div className="max-w-5xl mx-auto px-4 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-100 text-sm font-medium"
      >
        <span className="truncate">{active ? activeName : "Все категории"}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 bg-white rounded-xl border border-neutral-100 shadow-lg max-h-80 overflow-y-auto">
          <button
            onClick={() => { onSelect(null); setOpen(false); }}
            className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-neutral-50 ${
              active === null ? "bg-neutral-900 text-white" : "text-neutral-700 active:bg-neutral-50"
            }`}
          >
            Все категории
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { onSelect(cat.id === active ? null : cat.id); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm border-b border-neutral-50 last:border-0 ${
                active === cat.id
                  ? "bg-neutral-900 text-white font-medium"
                  : "text-neutral-700 active:bg-neutral-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
