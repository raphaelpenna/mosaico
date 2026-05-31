"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Brand } from "@/types";

/**
 * Seletor de marca ativa. Escreve a escolha em ?brand= na URL (server-readable),
 * em vez de estado de client — assim a pagina (Server Component) le o contexto
 * de marca no servidor e o DataLinkPicker so oferece metricas dessa marca.
 *
 * As opcoes ja vem filtradas pelo escopo da sessao (server). O client nao tem
 * como pedir uma marca fora do escopo: mesmo que forcasse ?brand=, o servidor
 * ignora o que nao esta no escopo.
 */
export function BrandSelector({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("brand") ?? "";

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("brand", value);
    else next.delete("brand");
    router.push(`/tasks?${next.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-foreground/60">Marca:</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="border-foreground/15 bg-background rounded-md border px-2 py-1 text-sm"
      >
        <option value="">— selecione —</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </label>
  );
}
