"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const hideScrollbar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function scrollToIndex(el: HTMLDivElement | null, i: number, smooth = true) {
  if (!el) return;
  el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "instant" });
}

function indexOf(el: HTMLDivElement) {
  return Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
}

function Arrow({ dir, onClick, dark }: { dir: "left" | "right"; onClick: () => void; dark?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === "left" ? "Предыдущее фото" : "Следующее фото"}
      className={`absolute top-1/2 -translate-y-1/2 ${dir === "left" ? "left-3" : "right-3"} w-10 h-10 rounded-full items-center justify-center shadow-sm hidden sm:flex ${dark ? "bg-white/15 text-white" : "bg-white/90 text-neutral-800"}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points={dir === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
      </svg>
    </button>
  );
}

function Lightbox({ images, name, start, onClose }: { images: string[]; name: string; start: number; onClose: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(start);

  useLayoutEffect(() => {
    scrollToIndex(ref.current, start, false);
  }, [start]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(active);
      if (e.key === "ArrowRight") scrollToIndex(ref.current, Math.min(active + 1, images.length - 1));
      if (e.key === "ArrowLeft") scrollToIndex(ref.current, Math.max(active - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 h-14 text-white shrink-0">
        <span className="text-sm">{active + 1} / {images.length}</span>
        <button onClick={() => onClose(active)} aria-label="Закрыть" className="w-10 h-10 -mr-2 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="relative flex-1 min-h-0">
        <div
          ref={ref}
          onScroll={(e) => setActive(indexOf(e.currentTarget))}
          className={`h-full flex overflow-x-auto snap-x snap-mandatory ${hideScrollbar}`}
        >
          {images.map((src, i) => (
            <div key={i} className="w-full h-full shrink-0 snap-center flex items-center justify-center">
              <img src={src} alt={`${name} — фото ${i + 1}`} className="max-w-full max-h-full object-contain" />
            </div>
          ))}
        </div>
        {images.length > 1 && active > 0 && <Arrow dir="left" dark onClick={() => scrollToIndex(ref.current, active - 1)} />}
        {images.length > 1 && active < images.length - 1 && <Arrow dir="right" dark onClick={() => scrollToIndex(ref.current, active + 1)} />}
      </div>
      <div className="h-10 shrink-0" />
    </div>
  );
}

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-square bg-neutral-50 sm:rounded-2xl flex items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-200">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      <div className="relative bg-neutral-50 sm:rounded-2xl overflow-hidden">
        <div
          ref={ref}
          onScroll={(e) => setActive(indexOf(e.currentTarget))}
          className={`flex overflow-x-auto snap-x snap-mandatory ${hideScrollbar}`}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setFullscreen(true)}
              aria-label="Открыть фото на весь экран"
              className="w-full aspect-square shrink-0 snap-center cursor-zoom-in"
            >
              <img src={src} alt={`${name} — фото ${i + 1}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <>
            {active > 0 && <Arrow dir="left" onClick={() => scrollToIndex(ref.current, active - 1)} />}
            {active < images.length - 1 && <Arrow dir="right" onClick={() => scrollToIndex(ref.current, active + 1)} />}
            <div className="pointer-events-none absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/50 text-white text-xs font-medium">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className={`flex gap-2 overflow-x-auto px-4 sm:px-0 pt-3 ${hideScrollbar}`}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(ref.current, i)}
              aria-label={`Фото ${i + 1}`}
              className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-neutral-50 border-2 transition-colors ${i === active ? "border-neutral-900" : "border-transparent"}`}
            >
              <img src={src} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {fullscreen && (
        <Lightbox
          images={images}
          name={name}
          start={active}
          onClose={(i) => {
            setFullscreen(false);
            scrollToIndex(ref.current, i, false);
          }}
        />
      )}
    </div>
  );
}
