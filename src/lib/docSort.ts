import type { Doc } from "@/lib/docs";

/**
 * Busca e ordenação de documentos — PURAS (sem store, sem React). Em módulo
 * próprio para o client importar sem puxar o store em memória de lib/docs.
 * Testável em node.
 */
export type DocSort = "recent" | "alpha";

/** Filtra por título + texto dos blocos (case-insensitive). */
export function searchDocs(docs: Doc[], query: string): Doc[] {
  const q = query.trim().toLowerCase();
  if (!q) return docs;
  return docs.filter((d) => {
    const hay = `${d.title} ${d.blocks.map((b) => b.text).join(" ")}`.toLowerCase();
    return hay.includes(q);
  });
}

/** Ordena: fixados primeiro; depois por recentes (updatedAt desc) ou A–Z. */
export function orderDocs(docs: Doc[], sort: DocSort): Doc[] {
  const byPin = (a: Doc, b: Doc) => Number(b.pinned) - Number(a.pinned);
  const cmp =
    sort === "alpha"
      ? (a: Doc, b: Doc) => a.title.localeCompare(b.title)
      : (a: Doc, b: Doc) =>
          a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0;
  return [...docs].sort((a, b) => byPin(a, b) || cmp(a, b));
}
