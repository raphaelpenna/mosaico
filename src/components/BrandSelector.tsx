"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Brand } from "@/types";

/**
 * Seletor de marca ativa. Escreve a escolha em ?brand= na URL (server-readable),
 * em vez de estado de client — assim a pagina (Server Component) le o contexto
 * de marca no servidor.
 *
 * As opcoes ja vem filtradas pelo escopo da sessao (server). O client nao tem
 * como pedir uma marca fora do escopo: mesmo que forcasse ?brand=, o servidor
 * ignora o que nao esta no escopo. Quando nao ha ?brand, cai na primeira marca
 * em escopo (`defaultBrandId`) — o mesmo default que a pagina usa nos dados.
 */
export function BrandSelector({
  brands,
  defaultBrandId,
}: {
  brands: Brand[];
  defaultBrandId: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("brand") || defaultBrandId;

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set("brand", value);
    router.push(`/tasks?${next.toString()}`);
  }

  if (brands.length === 0) {
    return <span className="text-faint text-sm">sem marcas em escopo</span>;
  }

  return (
    <label className="group relative flex items-center">
      <span className="sr-only">Marca ativa</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="hover:bg-surface-2 focus-visible:bg-surface-2 cursor-pointer appearance-none rounded-md py-1 pr-7 pl-2 text-sm font-medium transition-colors"
      >
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
        <option value="all">Todas as marcas</option>
      </select>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="text-faint pointer-events-none absolute right-2 h-3.5 w-3.5"
      >
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </label>
  );
}
