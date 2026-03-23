"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getProductLogoSources } from "@/data/productBranding";
import styles from "./ProductLogo.module.css";

interface ProductLogoProps {
  organization?: string;
  productId?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: 28,
  md: 34,
  lg: 44,
} as const;

function buildFallback(name: string) {
  const latin = name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
  if (latin) return latin;
  return name.replace(/\s+/g, "").slice(0, 2);
}

export default function ProductLogo({ organization, productId, name, size = "md" }: ProductLogoProps) {
  const sources = useMemo(() => getProductLogoSources(organization, productId), [organization, productId]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const pixelSize = sizeMap[size];
  const currentSource = sources[sourceIndex];

  return (
    <span className={`${styles.wrap} ${styles[size]}`} aria-hidden>
      {currentSource ? (
        <Image
          key={currentSource}
          src={currentSource}
          alt=""
          width={pixelSize}
          height={pixelSize}
          className={styles.image}
          unoptimized
          onError={() => {
            setSourceIndex((current) => {
              if (current < sources.length - 1) return current + 1;
              return current;
            });
          }}
        />
      ) : (
        <span className={styles.fallback}>{buildFallback(name)}</span>
      )}
    </span>
  );
}
