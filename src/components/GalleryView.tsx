"use client";

import type { Task, TaskStatus } from "@/types";
import { useTaskBoard } from "./task-board-context";
import { PRIORITY_META, sortTasks } from "@/lib/tasks/board";
import { initials } from "@/lib/people";

/**
 * Visão Galeria: grade de cards com capa (cor) + ícone, no espírito de um board
 * visual (lookbook). Apresentacional — o card inteiro abre o painel (sem
 * controles aninhados). Respeita os filtros (recebe as tarefas já filtradas).
 */
const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "A fazer", color: "var(--todo)" },
  doing: { label: "Fazendo", color: "var(--doing)" },
  done: { label: "Feito", color: "var(--done)" },
};

function prioMeta(p: Task["priority"]) {
  return PRIORITY_META.find((m) => m.value === p);
}

function GalleryCard({ task }: { task: Task }) {
  const { openTask, openId, labels, people } = useTaskBoard();
  const isOpen = openId === task.id;
  const status = STATUS_META[task.status];
  const prio = prioMeta(task.priority);
  const assignee = people.find((p) => p.id === task.assigneeId);
  const taskLabels = task.labelIds
    .map((id) => labels.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const subDone = task.subtasks.filter((s) => s.done).length;

  return (
    <li>
      <button
        type="button"
        onClick={() => openTask(task.id)}
        aria-label={`Abrir detalhes: ${task.title}`}
        className={`group bg-surface flex w-full flex-col overflow-hidden rounded-xl border text-left transition-colors ${
          isOpen
            ? "border-accent"
            : "border-border hover:border-border-strong"
        }`}
      >
        {/* Capa: cor da tarefa, ou faixa neutra com o ícone em destaque. */}
        <div
          className="bg-surface-2 flex h-20 items-center justify-center"
          style={task.cover ? { backgroundColor: task.cover } : undefined}
        >
          <span className="text-3xl drop-shadow-sm" aria-hidden>
            {task.icon ?? "🗂️"}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: status.color }}
              title={status.label}
              aria-hidden
            />
            <span
              className={`line-clamp-2 flex-1 text-sm font-medium ${
                task.status === "done" ? "text-faint line-through" : "text-fg"
              }`}
            >
              {task.title}
            </span>
          </div>

          {taskLabels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {taskLabels.map((l) => (
                <span
                  key={l.id}
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    color: l.color,
                    backgroundColor: `color-mix(in oklab, ${l.color} 14%, transparent)`,
                  }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}

          <div className="text-faint mt-auto flex items-center gap-2 text-xs">
            {prio && (
              <span className="flex items-center gap-1" title={prio.label}>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: prio.color }}
                  aria-hidden
                />
                {prio.label}
              </span>
            )}
            {task.dueDate && (
              <span className="tabular-nums">
                {task.dueDate.slice(8, 10)}/{task.dueDate.slice(5, 7)}
              </span>
            )}
            {task.subtasks.length > 0 && (
              <span className="tabular-nums">
                {subDone}/{task.subtasks.length}
              </span>
            )}
            {assignee && (
              <span
                className="bg-surface-2 text-muted ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium"
                title={assignee.name}
              >
                {initials(assignee.name)}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

export function GalleryView({ tasks }: { tasks: Task[] }) {
  const sorted = [...tasks].sort(sortTasks);
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {sorted.map((task) => (
        <GalleryCard key={task.id} task={task} />
      ))}
    </ul>
  );
}
