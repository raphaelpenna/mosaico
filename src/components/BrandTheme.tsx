"use client";

import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import type { Brand } from "@/types";

/**
 * Aplica o acento da marca ATIVA (?brand=, com fallback no default em escopo)
 * como a CSS var `--brand-accent`, que tinge sutilmente a chrome (wordmark,
 * avatar). Roda no client porque a marca ativa mora na URL; em navegacao entre
 * marcas o re-render atualiza o acento sem flash.
 */
export function BrandTheme({
  brands,
  defaultBrandId,
  children,
}: {
  brands: Brand[];
  defaultBrandId: string;
  children: React.ReactNode;
}) {
  const params = useSearchParams();
  const activeId = params.get("brand") || defaultBrandId;
  const accent =
    brands.find((b) => b.id === activeId)?.accent ?? "var(--accent)";

  return (
    <div
      className="flex min-h-full flex-col"
      style={{ "--brand-accent": accent } as CSSProperties}
    >
      {children}
    </div>
  );
}
