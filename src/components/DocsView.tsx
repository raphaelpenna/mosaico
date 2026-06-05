"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Doc } from "@/lib/docs";
import type { Block } from "@/types";
import { BlockEditor } from "./BlockEditor";
import { SelectMenu } from "./ui/SelectMenu";
import { Button } from "./ui/Button";
import {
  createDocAction,
  createNoteAction,
  deleteDocAction,
  updateDocBlocksAction,
  updateDocIconAction,
  updateDocLinksAction,
  updateDocTitleAction,
} from "@/app/(work)/docs/actions";

const EMOJIS = [
  "📘", "📕", "📗", "📙", "📒", "📓", "🗂️", "📑", "🎯", "💡",
  "🧵", "👗", "👜", "🎨", "🏷️", "⭐", "🚀", "📝", "📷", "🗓️",
]; // prettier-ignore

/** Tarefa que aponta para um doc (backlink), resolvida no servidor. */
export interface DocBacklink {
  taskId: string;
  title: string;
  brandId: string;
}

/**
 * Superfície de documentos: lista + editor. Serve tanto a base de conhecimento
 * da marca (`brandId` setado, `basePath="/docs"`) quanto as notas pessoais
 * (`brandId=null`, `basePath="/notes"`). A seleção mora na URL (?doc=) — sobrevive
 * a reload e é compartilhável. Edições vão por server action (o store revalida
 * escopo). O corpo reusa o BlockEditor.
 */
export function DocsView({
  docs,
  brandId,
  selectedId,
  basePath = "/docs",
  backlinks = [],
}: {
  docs: Doc[];
  brandId: string | null;
  selectedId?: string;
  basePath?: string;
  backlinks?: DocBacklink[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const isNotes = brandId === null;

  // Preserva os params (ex.: ?brand=) ao navegar entre lista e documento.
  function go(docId?: string) {
    const next = new URLSearchParams(params.toString());
    if (docId) next.set("doc", docId);
    else next.delete("doc");
    const qs = next.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  const selected = selectedId
    ? docs.find((d) => d.id === selectedId)
    : undefined;

  if (selected) {
    return (
      <DocEditor
        doc={selected}
        collection={docs}
        pending={pending}
        backLabel={isNotes ? "Notas" : "Documentos"}
        backlinks={backlinks}
        onOpen={(id) => go(id)}
        onSetLinks={(ids) =>
          startTransition(async () => {
            await updateDocLinksAction(selected.id, ids);
          })
        }
        onBack={() => go()}
        onDelete={() =>
          startTransition(async () => {
            await deleteDocAction(selected.id);
            go();
          })
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          onClick={() =>
            startTransition(async () => {
              const id = isNotes
                ? await createNoteAction()
                : await createDocAction(brandId);
              if (id) go(id);
            })
          }
        >
          {isNotes ? "Nova nota" : "Novo documento"}
        </Button>
      </div>

      {docs.length === 0 ? (
        <p className="text-muted py-12 text-center text-sm">
          {isNotes
            ? "Nenhuma nota ainda. Crie a primeira — só você vê suas notas."
            : "Nenhum documento ainda. Crie o primeiro para começar a base de conhecimento desta marca."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => go(d.id)}
                className="border-border bg-surface hover:border-fg/20 hover:bg-surface-2 flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors"
              >
                <span className="text-xl">{d.icon ?? "📄"}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{d.title}</span>
                  <span className="text-muted block text-xs">
                    {d.blocks.length} bloco{d.blocks.length === 1 ? "" : "s"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DocEditor({
  doc,
  collection,
  pending,
  backLabel,
  backlinks,
  onOpen,
  onSetLinks,
  onBack,
  onDelete,
}: {
  doc: Doc;
  collection: Doc[];
  pending: boolean;
  backLabel: string;
  backlinks: DocBacklink[];
  onOpen: (id: string) => void;
  onSetLinks: (ids: string[]) => void;
  onBack: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(doc.title);

  // Wiki: relacionados (saída) e "mencionado em" (entrada) dentro da coleção.
  const linkedSet = new Set(doc.linkedDocIds);
  const related = collection.filter((d) => linkedSet.has(d.id));
  const available = collection.filter(
    (d) => d.id !== doc.id && !linkedSet.has(d.id),
  );
  const mentionedBy = collection.filter(
    (d) => d.id !== doc.id && d.linkedDocIds.includes(doc.id),
  );
  const link = (id: string) => onSetLinks([...doc.linkedDocIds, id]);
  const unlink = (id: string) =>
    onSetLinks(doc.linkedDocIds.filter((x) => x !== id));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-muted hover:text-fg flex items-center gap-1.5 text-sm"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
            <path
              d="M10 3L5 8l5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {backLabel}
        </button>
        <Button variant="danger" size="sm" disabled={pending} onClick={onDelete}>
          Remover
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <SelectMenu
          ariaLabel="Ícone do documento"
          align="start"
          value={doc.icon ?? ""}
          onChange={(v) => updateDocIconAction(doc.id, v)}
          options={[
            { value: "", label: "Sem ícone" },
            ...EMOJIS.map((e) => ({
              value: e,
              label: e,
              node: <span className="text-2xl">{e}</span>,
            })),
          ]}
          triggerClassName="hover:bg-surface-2 flex h-10 w-10 items-center justify-center rounded-md text-2xl"
          trigger={doc.icon || <span className="text-muted text-2xl">📄</span>}
        />
        <input
          aria-label="Título do documento"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title.trim() && title !== doc.title)
              updateDocTitleAction(doc.id, title);
          }}
          placeholder="Sem título"
          className="placeholder:text-faint flex-1 bg-transparent text-2xl font-semibold tracking-tight outline-none"
        />
      </div>

      <BlockEditor
        blocks={doc.blocks}
        onChange={(b: Block[]) => updateDocBlocksAction(doc.id, b)}
      />

      {/* Wiki: documentos relacionados (saída) */}
      <div className="border-border flex flex-col gap-2 border-t pt-4">
        <span className="text-faint text-xs font-semibold tracking-wide uppercase">
          Documentos relacionados
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {related.map((d) => (
            <span
              key={d.id}
              className="border-border bg-surface-2 flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-2 text-[11px] font-medium"
            >
              <button
                type="button"
                onClick={() => onOpen(d.id)}
                className="hover:text-fg text-muted flex items-center gap-1"
              >
                <span aria-hidden>{d.icon ?? "📄"}</span>
                <span className="max-w-40 truncate">{d.title}</span>
              </button>
              <button
                type="button"
                onClick={() => unlink(d.id)}
                aria-label={`Desrelacionar ${d.title}`}
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
              ariaLabel="Relacionar documento"
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
              trigger={<>+ Relacionar documento</>}
            />
          )}
          {related.length === 0 && available.length === 0 && (
            <span className="text-faint text-xs">
              Nenhum outro documento nesta coleção ainda.
            </span>
          )}
        </div>
      </div>

      {/* Backlinks: mencionado por outros docs e por tarefas */}
      {(mentionedBy.length > 0 || backlinks.length > 0) && (
        <div className="border-border flex flex-col gap-2 border-t pt-4">
          <span className="text-faint text-xs font-semibold tracking-wide uppercase">
            Mencionado em
          </span>
          <ul className="flex flex-col gap-1">
            {mentionedBy.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => onOpen(d.id)}
                  className="text-muted hover:bg-surface-2 hover:text-fg flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors"
                >
                  <span aria-hidden>{d.icon ?? "📄"}</span>
                  <span className="truncate">{d.title}</span>
                  <span className="text-faint ml-auto text-[11px]">doc</span>
                </button>
              </li>
            ))}
            {backlinks.map((b) => (
              <li key={b.taskId}>
                <a
                  href={`/tasks?brand=${b.brandId}&task=${b.taskId}`}
                  className="text-muted hover:bg-surface-2 hover:text-fg flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                    <path
                      d="M6.5 9.5l3-3M7 4.5l.7-.7a2.5 2.5 0 0 1 3.5 3.5l-.7.7M9 11.5l-.7.7a2.5 2.5 0 0 1-3.5-3.5l.7-.7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="truncate">{b.title}</span>
                  <span className="text-faint ml-auto text-[11px]">tarefa</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
