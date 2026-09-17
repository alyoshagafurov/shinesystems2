"use client";

import Image from "next/image";
import { useState } from "react";

const optimizedHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "").split(",").filter(Boolean);

function canOptimize(src: string) {
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      optimizedHosts.includes(url.hostname) &&
      url.pathname.startsWith("/storage/v1/object/public/") &&
      !url.search
    );
  } catch {
    return false;
  }
}

interface Props {
  src: string;
  alt: string;
  sizes: string;
  quality?: 60 | 75;
  className?: string;
  preload?: boolean;
}

export function ProductImage({ src, alt, sizes, quality = 60, className, preload }: Props) {
  const [failed, setFailed] = useState(false);
  const optimize = !failed && canOptimize(src);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      preload={preload}
      unoptimized={!optimize}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
