"use client";

import { useState } from "react";
import type { Task } from "@/types";
import { useTaskBoard } from "./task-board-context";
import { PRIORITY_META } from "@/lib/tasks/board";

/**
 * Visão Calendário: grade do mês com as tarefas posicionadas pelo prazo
 * (`dueDate`). Navega mês a mês; "hoje" vem do servidor (ctx.today) para o mês
 * inicial bater no SSR. Tarefas sem prazo aparecem num rodapé. Clicar abre o
 * painel.
 */
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const pad = (n: number) => String(n).padStart(2, "0");
const prioColor = (p: Task["priority"]) =>
  PRIORITY_META.find((m) => m.value === p)?.color ?? "var(--prio-medium)";

function TaskChip({ task }: { task: Task }) {
  const { openTask } = useTaskBoard();
  return (
    <button
      type="button"
      onClick={() => openTask(task.id)}
      title={task.title}
      className="hover:bg-surface-2 flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-xs"
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: prioColor(task.priority) }}
      />
      <span
        className={`truncate ${task.status === "done" ? "text-faint line-through" : ""}`}
      >
        {task.title}
      </span>
    </button>
  );
}

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const { today } = useTaskBoard();
  const [ty, tm] = today.split("-").map(Number);
  const [cur, setCur] = useState({ year: ty, month: tm - 1 });

  const byDate = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.dueDate) continue;
    const arr = byDate.get(t.dueDate) ?? [];
    arr.push(t);
    byDate.set(t.dueDate, arr);
  }
  const undated = tasks.filter((t) => !t.dueDate);

  const first = new Date(cur.year, cur.month, 1);
  const startDay = first.getDay(); // 0 = domingo
  const daysInMonth = new Date(cur.year, cur.month + 1, 0).getDate();
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => i - startDay + 1);

  function shift(delta: number) {
    setCur(({ year, month }) => {
      const m = month + delta;
      return { year: year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Cabeçalho de navegação */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold">
          {MONTHS[cur.month]} {cur.year}
        </h2>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Mês anterior"
            className="text-muted hover:bg-surface-2 hover:text-fg flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setCur({ year: ty, month: tm - 1 })}
            className="text-muted hover:bg-surface-2 hover:text-fg rounded-md px-2 py-1 text-sm transition-colors"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Próximo mês"
            className="text-muted hover:bg-surface-2 hover:text-fg flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Grade */}
      <div className="border-border overflow-hidden rounded-xl border">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="text-muted border-border border-b px-2 py-1.5 text-center text-xs font-semibold"
            >
              {w}
            </div>
          ))}
          {cells.map((day, i) => {
            const valid = day >= 1 && day <= daysInMonth;
            const dateStr = valid
              ? `${cur.year}-${pad(cur.month + 1)}-${pad(day)}`
              : "";
            const isToday = dateStr === today;
            const dayTasks = valid ? (byDate.get(dateStr) ?? []) : [];
            return (
              <div
                key={i}
                className={`border-border min-h-24 border-b p-1 ${
                  i % 7 !== 6 ? "border-r" : ""
                } ${valid ? "" : "bg-surface-2/30"}`}
              >
                {valid && (
                  <>
                    <div className="flex justify-end px-1">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs tabular-nums ${
                          isToday
                            ? "bg-accent text-accent-fg font-semibold"
                            : "text-muted"
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayTasks.slice(0, 3).map((t) => (
                        <TaskChip key={t.id} task={t} />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-faint px-1 text-[11px]">
                          +{dayTasks.length - 3} mais
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sem prazo */}
      {undated.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-faint text-xs font-semibold tracking-wide uppercase">
            Sem prazo ({undated.length})
          </span>
          <div className="flex flex-wrap gap-1">
            {undated.map((t) => (
              <span
                key={t.id}
                className="border-border max-w-48 rounded-lg border"
              >
                <TaskChip task={t} />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
