"use client";

import type { TaskStatus } from "@/types";
import { useTaskBoard } from "./task-board-context";

// Clicar avanca o workflow: a fazer -> fazendo -> feito -> (reabre).
export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: "doing",
  doing: "done",
  done: "todo",
};
const ADVANCE_LABEL: Record<TaskStatus, string> = {
  todo: "Marcar como fazendo",
  doing: "Marcar como feito",
  done: "Reabrir tarefa",
};

/** Indicador visual do status (círculo / dot / check). */
export function StatusControl({ status }: { status: TaskStatus }) {
  if (status === "done") {
    return (
      <span className="bg-done flex h-[18px] w-[18px] items-center justify-center rounded-full">
        <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" aria-hidden>
          <path
            d="M4 8.5l2.5 2.5L12 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === "doing") {
    return (
      <span className="border-doing flex h-[18px] w-[18px] items-center justify-center rounded-full border-2">
        <span className="bg-doing h-2 w-2 rounded-full" />
      </span>
    );
  }
  return (
    <span className="border-faint group-hover:border-fg h-[18px] w-[18px] rounded-full border-2 transition-colors" />
  );
}

/** Botão que avança o status da tarefa (otimista via contexto). */
export function StatusButton({
  id,
  status,
}: {
  id: string;
  status: TaskStatus;
}) {
  const { mutate } = useTaskBoard();
  return (
    <button
      type="button"
      onClick={() => mutate(id, { status: NEXT_STATUS[status] })}
      title={ADVANCE_LABEL[status]}
      aria-label={ADVANCE_LABEL[status]}
      className="flex shrink-0 cursor-pointer items-center justify-center rounded-full"
    >
      <StatusControl status={status} />
    </button>
  );
}
