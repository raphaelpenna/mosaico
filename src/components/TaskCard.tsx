"use client";

import type { Task } from "@/types";
import { useTaskBoard } from "./task-board-context";
import { TaskTitle } from "./TaskTitle";
import { PriorityPicker } from "./PriorityPicker";
import { DuePicker } from "./DuePicker";
import { AssigneePicker } from "./AssigneePicker";
import { LabelChips } from "./LabelChips";
import { StatusButton } from "./StatusButton";

export function TaskCard({
  task,
  draggable = false,
}: {
  task: Task;
  draggable?: boolean;
}) {
  const { remove, selected, toggleSelect, selecting, openTask, openId } =
    useTaskBoard();
  const done = task.status === "done";
  const isSelected = selected.has(task.id);
  const isOpen = openId === task.id;
  const subDone = task.subtasks.filter((s) => s.done).length;

  return (
    <li
      draggable={draggable}
      onDragStart={
        draggable
          ? (e) => {
              e.dataTransfer.setData("text/plain", task.id);
              e.dataTransfer.effectAllowed = "move";
            }
          : undefined
      }
      className={`group bg-surface rounded-xl border transition-colors ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      } ${
        isSelected
          ? "border-accent ring-accent/30 ring-1"
          : isOpen
            ? "border-accent"
            : "border-border hover:border-border-strong"
      }`}
    >
      <div className="flex items-start gap-2 px-3 py-2.5 sm:items-center">
        {/* Seleção (lote) — aparece no hover ou quando ha selecao ativa */}
        <button
          type="button"
          onClick={() => toggleSelect(task.id)}
          aria-pressed={isSelected}
          aria-label={isSelected ? "Desmarcar tarefa" : "Selecionar tarefa"}
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
            isSelected
              ? "border-accent bg-accent text-white"
              : "border-border-strong text-transparent"
          } ${selecting || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
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
        </button>

        <StatusButton id={task.id} status={task.status} />

        {/* Conteúdo: no mobile vira duas linhas (título em cima, metadados
            embaixo); no desktop fica tudo numa linha só. */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {task.icon && <span className="shrink-0 text-sm">{task.icon}</span>}
            <TaskTitle id={task.id} title={task.title} done={done} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <LabelChips labelIds={task.labelIds} className="flex" />

            {task.subtasks.length > 0 && (
              <span
                className="text-faint shrink-0 text-xs tabular-nums"
                title="Subtarefas concluídas"
              >
                {subDone}/{task.subtasks.length}
              </span>
            )}

            <AssigneePicker id={task.id} assigneeId={task.assigneeId} />
            <DuePicker id={task.id} dueDate={task.dueDate} />
            <PriorityPicker id={task.id} priority={task.priority} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => openTask(task.id)}
          aria-label="Abrir detalhes"
          className={`hover:bg-surface-2 hover:text-fg flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors ${
            isOpen ? "text-fg bg-surface-2" : "text-faint"
          }`}
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
            <path
              d="M6 4l4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => remove(task.id)}
          title="Remover tarefa"
          aria-label="Remover tarefa"
          className="text-faint hover:bg-surface-2 hover:text-fg flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
            <path
              d="M4 4l8 8M12 4l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </li>
  );
}
