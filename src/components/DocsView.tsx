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
  updateDocTitleAction,
} from "@/app/(work)/docs/actions";

const EMOJIS = [
  "📘", "📕", "📗", "📙", "📒", "📓", "🗂️", "📑", "🎯", "💡",
  "🧵", "👗", "👜", "🎨", "🏷️", "⭐", "🚀", "📝", "📷", "🗓️",
]; // prettier-ignore

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
}: {
  docs: Doc[];
  brandId: string | null;
  selectedId?: string;
  basePath?: string;
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
        pending={pending}
        backLabel={isNotes ? "Notas" : "Documentos"}
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
  pending,
  backLabel,
  onBack,
  onDelete,
}: {
  doc: Doc;
  pending: boolean;
  backLabel: string;
  onBack: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(doc.title);

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
    </div>
  );
}
