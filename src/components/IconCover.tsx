"use client";

import type { Task } from "@/types";
import { useTaskBoard } from "./task-board-context";
import { SelectMenu } from "./ui/SelectMenu";

/** Seletores de ícone (emoji) e capa (cor) da tarefa — no header do painel. */
const EMOJIS = [
  "📌", "🎯", "🛍️", "👗", "👜", "📷", "🧵", "✂️", "📋", "🗓️", "🔥", "✅",
  "💡", "📈", "🎨", "🏷️", "⭐", "🚀", "📝", "🧥", "👠", "💳",
]; // prettier-ignore

const COVERS = [
  { n: "Coral", h: "#e8552d" },
  { n: "Bordô", h: "#8e1b2e" },
  { n: "Verde", h: "#1fa67a" },
  { n: "Azul", h: "#1e5a8a" },
  { n: "Violeta", h: "#5b4b8a" },
  { n: "Magenta", h: "#c2407a" },
  { n: "Âmbar", h: "#d97706" },
  { n: "Grafite", h: "#475569" },
];

export function IconCover({ task }: { task: Task }) {
  const { mutate } = useTaskBoard();

  return (
    <div className="flex items-center gap-1">
      <SelectMenu
        ariaLabel="Ícone"
        align="start"
        value={task.icon ?? ""}
        onChange={(v) => mutate(task.id, { icon: v })}
        options={[
          { value: "", label: "Sem ícone" },
          ...EMOJIS.map((e) => ({
            value: e,
            label: e,
            node: <span className="text-lg">{e}</span>,
          })),
        ]}
        triggerClassName="text-muted hover:bg-surface-2 flex h-7 w-7 items-center justify-center rounded-md text-base"
        trigger={
          task.icon || (
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
              <circle
                cx="8"
                cy="8"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M5.5 9.5a3 3 0 0 0 5 0M6 6.5h.01M10 6.5h.01"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          )
        }
      />
      <SelectMenu
        ariaLabel="Capa"
        align="start"
        value={task.cover ?? ""}
        onChange={(v) => mutate(task.id, { cover: v })}
        options={[
          { value: "", label: "Sem capa" },
          ...COVERS.map((c) => ({
            value: c.h,
            label: c.n,
            node: (
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-5 rounded"
                  style={{ backgroundColor: c.h }}
                />
                {c.n}
              </span>
            ),
          })),
        ]}
        triggerClassName="text-muted hover:bg-surface-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs"
        trigger={<>Capa</>}
      />
    </div>
  );
}
