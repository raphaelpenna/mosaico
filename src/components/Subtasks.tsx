"use client";

import { useState } from "react";
import type { Subtask } from "@/types";
import { useTaskBoard } from "./task-board-context";

function uid(): string {
  return `s${Math.random().toString(36).slice(2, 9)}`;
}

/** Checklist de subtarefas: adicionar, marcar e remover (otimista via contexto). */
export function Subtasks({
  id,
  subtasks,
}: {
  id: string;
  subtasks: Subtask[];
}) {
  const { mutate } = useTaskBoard();
  const [draft, setDraft] = useState("");

  function add() {
    const title = draft.trim();
    if (!title) return;
    mutate(id, { subtasks: [...subtasks, { id: uid(), title, done: false }] });
    setDraft("");
  }
  function toggle(sid: string) {
    mutate(id, {
      subtasks: subtasks.map((s) =>
        s.id === sid ? { ...s, done: !s.done } : s,
      ),
    });
  }
  function remove(sid: string) {
    mutate(id, { subtasks: subtasks.filter((s) => s.id !== sid) });
  }

  const total = subtasks.length;
  const done = subtasks.filter((s) => s.done).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-1">
      {total > 0 && (
        <div className="mb-1 flex items-center gap-2">
          <div
            className="bg-surface-2 h-1.5 flex-1 overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do checklist"
          >
            <div
              className="bg-done h-full rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-faint text-xs tabular-nums">
            {done}/{total}
          </span>
        </div>
      )}
      {subtasks.map((s) => (
        <div key={s.id} className="group/sub flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggle(s.id)}
            aria-pressed={s.done}
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
              s.done ? "border-done bg-done text-white" : "border-faint"
            }`}
            aria-label={s.done ? "Desmarcar" : "Marcar"}
          >
            {s.done && (
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
          <span
            className={`flex-1 text-sm ${s.done ? "text-faint line-through" : "text-fg"}`}
          >
            {s.title}
          </span>
          <button
            type="button"
            onClick={() => remove(s.id)}
            className="text-faint hover:text-fg text-xs opacity-0 transition-opacity group-hover/sub:opacity-100"
            aria-label="Remover subtarefa"
          >
            ✕
          </button>
        </div>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="Adicionar item…"
        className="placeholder:text-faint border-border focus:border-border-strong mt-0.5 rounded-md border bg-transparent px-2 py-1 text-sm outline-none"
      />
    </div>
  );
}
