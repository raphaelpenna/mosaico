"use client";

import { useEffect, useRef, useState } from "react";
import type { Block, BlockType } from "@/types";
import { useTaskBoard } from "./task-board-context";

/**
 * Editor de blocos do corpo da tarefa (a "página"). Minimal e sem dependências:
 * cada bloco é um textarea auto-ajustável. Enter cria parágrafo; Backspace no
 * início de bloco vazio remove; atalhos markdown no espaço transformam o tipo
 * (`# `/`## ` título, `[] ` tarefa, `- ` lista, `> ` citação); `---`+Enter vira
 * divisor. Texto persiste no blur; mudanças estruturais persistem na hora.
 */
function uid(): string {
  return `b${Math.random().toString(36).slice(2, 9)}`;
}
function paragraph(text = ""): Block {
  return { id: uid(), type: "paragraph", text };
}

const MD: Record<string, () => Partial<Block> & { type: BlockType }> = {
  "#": () => ({ type: "heading", level: 1 }),
  "##": () => ({ type: "heading", level: 2 }),
  "[]": () => ({ type: "todo", done: false }),
  "[ ]": () => ({ type: "todo", done: false }),
  "-": () => ({ type: "bullet" }),
  ">": () => ({ type: "quote" }),
};

export function BlockEditor({
  id,
  blocks: initial,
}: {
  id: string;
  blocks: Block[];
}) {
  const { mutate } = useTaskBoard();
  const [blocks, setBlocks] = useState<Block[]>(
    initial.length ? initial : [paragraph()],
  );
  const refs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const focusId = useRef<string | null>(null);

  // Foca o bloco pendente (após criar/remover) e leva o caret ao fim.
  useEffect(() => {
    const fid = focusId.current;
    if (!fid) return;
    const el = refs.current[fid];
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
    focusId.current = null;
  });

  function persist(next: Block[]) {
    setBlocks(next);
    mutate(id, { blocks: next });
  }
  function setLocal(next: Block[]) {
    setBlocks(next);
  }
  function commit() {
    mutate(id, { blocks });
  }
  function patchBlock(bid: string, patch: Partial<Block>, save = false) {
    const next = blocks.map((b) => (b.id === bid ? { ...b, ...patch } : b));
    if (save) persist(next);
    else setLocal(next);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>, b: Block) {
    const el = e.currentTarget;
    const atStart = el.selectionStart === 0 && el.selectionEnd === 0;

    if (e.key === " ") {
      const transform = MD[el.value];
      if (transform) {
        e.preventDefault();
        patchBlock(b.id, { text: "", ...transform() }, true);
      }
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (b.type !== "todo" && b.type !== "bullet" && el.value === "---") {
        patchBlock(b.id, { type: "divider", text: "" }, true);
        const nb = paragraph();
        focusId.current = nb.id;
        persist([...insertAfter(b.id, nb)]);
        return;
      }
      const nb = paragraph();
      // listas/checklist continuam o mesmo tipo na nova linha
      if ((b.type === "todo" || b.type === "bullet") && b.text !== "") {
        nb.type = b.type;
        if (b.type === "todo") nb.done = false;
      }
      focusId.current = nb.id;
      persist(insertAfter(b.id, nb));
      return;
    }
    if (e.key === "Backspace" && atStart) {
      const idx = blocks.findIndex((x) => x.id === b.id);
      if (b.text === "" && blocks.length > 1) {
        e.preventDefault();
        const prev = blocks[idx - 1];
        if (prev) focusId.current = prev.id;
        persist(blocks.filter((x) => x.id !== b.id));
      } else if (b.type !== "paragraph" && b.text === "") {
        // volta tipo especial para parágrafo antes de remover
        e.preventDefault();
        patchBlock(
          b.id,
          { type: "paragraph", level: undefined, done: undefined },
          true,
        );
      }
    }
  }

  function insertAfter(bid: string, nb: Block): Block[] {
    const idx = blocks.findIndex((x) => x.id === bid);
    return [...blocks.slice(0, idx + 1), nb, ...blocks.slice(idx + 1)];
  }

  return (
    <div className="flex flex-col">
      {blocks.map((b) => {
        if (b.type === "divider") {
          return (
            <div
              key={b.id}
              className="group/blk flex items-center gap-2 py-1.5"
            >
              <hr className="border-border flex-1" />
              <button
                type="button"
                onClick={() => persist(blocks.filter((x) => x.id !== b.id))}
                aria-label="Remover divisor"
                className="text-faint hover:text-fg text-xs opacity-0 group-hover/blk:opacity-100"
              >
                ✕
              </button>
            </div>
          );
        }

        const isHeading = b.type === "heading";
        const textClass = [
          isHeading && b.level === 1 ? "text-lg font-semibold" : "",
          isHeading && b.level === 2 ? "text-base font-semibold" : "",
          b.type === "quote" ? "text-muted italic" : "",
          b.type === "todo" && b.done ? "text-faint line-through" : "",
        ].join(" ");

        return (
          <div key={b.id} className="flex items-start gap-1.5 py-0.5">
            {b.type === "todo" && (
              <button
                type="button"
                onClick={() => patchBlock(b.id, { done: !b.done }, true)}
                aria-pressed={b.done}
                aria-label={b.done ? "Desmarcar" : "Marcar"}
                className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  b.done ? "border-done bg-done text-white" : "border-faint"
                }`}
              >
                {b.done && (
                  <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" aria-hidden>
                    <path
                      d="M4 8.5l2.5 2.5L12 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            )}
            {b.type === "bullet" && (
              <span className="text-muted mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
            )}
            {b.type === "quote" && (
              <span className="bg-border mt-0.5 w-0.5 shrink-0 self-stretch rounded" />
            )}
            <textarea
              ref={(el) => {
                refs.current[b.id] = el;
              }}
              value={b.text}
              rows={1}
              aria-label="Bloco de conteúdo"
              onChange={(e) => patchBlock(b.id, { text: e.target.value })}
              onKeyDown={(e) => onKeyDown(e, b)}
              onBlur={commit}
              placeholder={
                b.type === "paragraph"
                  ? "Escreva algo, ou use # / [] / - / >…"
                  : ""
              }
              className={`placeholder:text-faint [field-sizing:content] w-full resize-none bg-transparent text-sm outline-none ${textClass}`}
            />
          </div>
        );
      })}
    </div>
  );
}
