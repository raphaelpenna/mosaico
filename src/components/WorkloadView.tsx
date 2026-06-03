"use client";

import type { Task } from "@/types";
import { useTaskBoard } from "./task-board-context";
import { buildWorkload, PRIORITY_META } from "@/lib/tasks/board";
import { initials } from "@/lib/people";

/**
 * Visão Carga de trabalho: uma linha por responsável, com barra empilhada por
 * status (a fazer / fazendo / feito) proporcional ao total — comparável entre
 * pessoas — mais abertas, atrasadas e quebra por prioridade. Apresentacional;
 * derivada por buildWorkload (lógica pura). Respeita os filtros ativos.
 */
const SEGMENTS: { key: "todo" | "doing" | "done"; label: string; color: string }[] = [
  { key: "todo", label: "A fazer", color: "var(--todo)" },
  { key: "doing", label: "Fazendo", color: "var(--doing)" },
  { key: "done", label: "Feito", color: "var(--done)" },
];

export function WorkloadView({ tasks }: { tasks: Task[] }) {
  const { people, today } = useTaskBoard();
  const rows = buildWorkload(tasks, people, today);
  const maxTotal = rows.reduce((m, r) => Math.max(m, r.total), 0) || 1;

  if (rows.length === 0) {
    return (
      <p className="text-muted py-8 text-center text-sm">
        Nenhuma tarefa para distribuir.
      </p>
    );
  }

  return (
    <div className="border-border bg-surface flex flex-col rounded-xl border">
      {rows.map((r) => {
        const open = r.todo + r.doing;
        return (
          <div
            key={r.assigneeId ?? "__none"}
            className="border-border flex items-center gap-3 border-b px-4 py-3 last:border-0"
          >
            {/* Identidade */}
            <div className="flex w-40 shrink-0 items-center gap-2">
              <span className="bg-surface-2 text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
                {r.assigneeId ? initials(r.name) : "—"}
              </span>
              <span className="truncate text-sm font-medium">{r.name}</span>
            </div>

            {/* Barra empilhada por status (largura relativa ao maior total) */}
            <div className="min-w-0 flex-1">
              <div
                className="bg-surface-2 flex h-3 overflow-hidden rounded-full"
                style={{ width: `${(r.total / maxTotal) * 100}%` }}
                role="img"
                aria-label={`${r.name}: ${r.todo} a fazer, ${r.doing} fazendo, ${r.done} feito`}
              >
                {SEGMENTS.map((s) =>
                  r[s.key] > 0 ? (
                    <span
                      key={s.key}
                      title={`${s.label}: ${r[s.key]}`}
                      style={{
                        width: `${(r[s.key] / r.total) * 100}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  ) : null,
                )}
              </div>
            </div>

            {/* Quebra por prioridade (entre abertas) */}
            <div className="hidden items-center gap-2 sm:flex">
              {PRIORITY_META.map((p) =>
                r.byPriority[p.value] > 0 ? (
                  <span
                    key={p.value}
                    title={`${p.label}: ${r.byPriority[p.value]}`}
                    className="text-faint flex items-center gap-1 text-xs tabular-nums"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                      aria-hidden
                    />
                    {r.byPriority[p.value]}
                  </span>
                ) : null,
              )}
            </div>

            {/* Números */}
            <div className="flex w-32 shrink-0 items-center justify-end gap-2 text-xs">
              {r.overdue > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 font-medium"
                  style={{
                    color: "var(--due-overdue)",
                    backgroundColor:
                      "color-mix(in oklab, var(--due-overdue) 14%, transparent)",
                  }}
                  title="Atrasadas"
                >
                  {r.overdue} atrasada{r.overdue === 1 ? "" : "s"}
                </span>
              )}
              <span className="text-muted tabular-nums">
                {open} aberta{open === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
