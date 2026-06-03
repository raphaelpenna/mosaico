"use client";

import type { Task } from "@/types";
import { useTaskBoard } from "./task-board-context";
import { buildTimeline, PRIORITY_META, type Timeline } from "@/lib/tasks/board";

/**
 * Visão Linha do tempo (Gantt simples): cada tarefa com prazo vira um marcador
 * numa régua temporal, com ticks mensais e a linha de "hoje". Tarefas sem prazo
 * saem num rodapé. Layout derivado por buildTimeline (lógica pura). Clicar abre
 * o painel. Respeita os filtros (recebe as tarefas já filtradas).
 */
const STATUS_COLOR: Record<Task["status"], string> = {
  todo: "var(--todo)",
  doing: "var(--doing)",
  done: "var(--done)",
};

function prioColor(p: Task["priority"]) {
  return PRIORITY_META.find((m) => m.value === p)?.color ?? "var(--prio-medium)";
}

/** Linhas verticais (meses + hoje) repetidas em cada faixa para alinhar. */
function Grid({ tl }: { tl: Timeline }) {
  return (
    <>
      {tl.months.map((mo, i) => (
        <span
          key={i}
          aria-hidden
          className="bg-border/50 absolute inset-y-0 w-px"
          style={{ left: `${mo.leftPct}%` }}
        />
      ))}
      <span
        aria-hidden
        className="bg-accent/70 absolute inset-y-0 w-0.5"
        style={{ left: `${tl.todayPct}%` }}
      />
    </>
  );
}

export function TimelineView({ tasks }: { tasks: Task[] }) {
  const { today, openTask, openId } = useTaskBoard();
  const tl = buildTimeline(tasks, today);

  if (tl.bars.length === 0) {
    return (
      <p className="text-muted py-8 text-center text-sm">
        Nenhuma tarefa com prazo para posicionar na linha do tempo.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <div className="flex min-w-[720px] flex-col">
          {/* Régua de meses */}
          <div className="flex h-5 items-end">
            <div className="w-44 shrink-0" />
            <div className="relative h-full flex-1">
              {tl.months.map((mo, i) => (
                <span
                  key={i}
                  className="text-faint absolute -translate-x-1/2 text-[11px] whitespace-nowrap"
                  style={{ left: `${mo.leftPct}%` }}
                >
                  {mo.label}
                </span>
              ))}
            </div>
          </div>

          {/* Uma faixa por tarefa */}
          {tl.bars.map(({ task, leftPct, overdue }) => {
            const isOpen = openId === task.id;
            const color =
              task.status === "done"
                ? STATUS_COLOR.done
                : prioColor(task.priority);
            return (
              <div
                key={task.id}
                className="border-border/50 flex h-9 items-center border-t"
              >
                <div className="flex w-44 shrink-0 items-center gap-1.5 pr-2">
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR[task.status] }}
                  />
                  {task.icon && (
                    <span className="shrink-0 text-xs">{task.icon}</span>
                  )}
                  <span
                    className={`truncate text-xs ${
                      task.status === "done"
                        ? "text-faint line-through"
                        : "text-fg"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="relative h-full flex-1">
                  <Grid tl={tl} />
                  <button
                    type="button"
                    onClick={() => openTask(task.id)}
                    aria-label={`Abrir detalhes: ${task.title}`}
                    title={`${task.title} · ${task.dueDate}`}
                    style={{ left: `${leftPct}%`, backgroundColor: color }}
                    className={`absolute top-1/2 flex h-5 -translate-x-1/2 -translate-y-1/2 items-center rounded-full px-2 text-[10px] font-medium whitespace-nowrap text-white shadow-sm transition-transform hover:scale-110 ${
                      isOpen ? "ring-fg ring-2" : ""
                    } ${overdue ? "ring-1 ring-[var(--due-overdue)]" : ""}`}
                  >
                    {task.dueDate!.slice(8, 10)}/{task.dueDate!.slice(5, 7)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {tl.noDate.length > 0 && (
        <div className="text-faint flex flex-wrap items-center gap-2 text-xs">
          <span>Sem prazo:</span>
          {tl.noDate.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => openTask(t.id)}
              aria-label={`Abrir detalhes: ${t.title}`}
              className="border-border text-muted hover:bg-surface-2 hover:text-fg max-w-44 truncate rounded-full border px-2 py-0.5"
            >
              {t.icon ? `${t.icon} ` : ""}
              {t.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
