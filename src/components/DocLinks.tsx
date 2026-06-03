"use client";

import { useTaskBoard } from "./task-board-context";
import { SelectMenu } from "./ui/SelectMenu";

/**
 * Vínculos tarefa↔documento (corpo do painel). Lista os docs vinculados como
 * chips que levam ao documento (e o backlink aparece lá), com um ✕ para
 * desvincular; um picker abaixo oferece os demais docs da mesma marca.
 */
export function DocLinks({
  id,
  brandId,
  linkedDocIds,
}: {
  id: string;
  brandId: string;
  linkedDocIds: string[];
}) {
  const { mutate, docs } = useTaskBoard();
  // Só docs da mesma marca da tarefa podem ser vinculados.
  const brandDocs = docs.filter((d) => d.brandId === brandId);
  const linked = linkedDocIds
    .map((docId) => brandDocs.find((d) => d.id === docId))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const available = brandDocs.filter((d) => !linkedDocIds.includes(d.id));

  function unlink(docId: string) {
    mutate(id, { linkedDocIds: linkedDocIds.filter((x) => x !== docId) });
  }
  function link(docId: string) {
    if (!docId || linkedDocIds.includes(docId)) return;
    mutate(id, { linkedDocIds: [...linkedDocIds, docId] });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {linked.map((d) => (
        <span
          key={d.id}
          className="border-border bg-surface-2 flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-2 text-[11px] font-medium"
        >
          <a
            href={`/docs?brand=${brandId}&doc=${d.id}`}
            className="hover:text-fg text-muted flex items-center gap-1"
          >
            <span aria-hidden>{d.icon ?? "📄"}</span>
            <span className="max-w-40 truncate">{d.title}</span>
          </a>
          <button
            type="button"
            onClick={() => unlink(d.id)}
            aria-label={`Desvincular ${d.title}`}
            className="text-faint hover:text-fg flex h-4 w-4 items-center justify-center rounded-full"
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
              <path
                d="M4 4l8 8M12 4l-8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </span>
      ))}

      {available.length > 0 && (
        <SelectMenu
          ariaLabel="Vincular documento"
          align="start"
          value=""
          onChange={link}
          options={available.map((d) => ({
            value: d.id,
            label: d.title,
            node: (
              <span className="flex items-center gap-1.5">
                <span aria-hidden>{d.icon ?? "📄"}</span>
                {d.title}
              </span>
            ),
          }))}
          triggerClassName="border-border text-muted hover:bg-surface-2 flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-[11px] font-medium"
          trigger={<>+ Vincular documento</>}
        />
      )}

      {linked.length === 0 && available.length === 0 && (
        <span className="text-faint text-xs">
          Nenhum documento nesta marca ainda.
        </span>
      )}
    </div>
  );
}
