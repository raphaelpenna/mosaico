"use client";

import { useTransition } from "react";
import type { Brand, Task } from "@/types";
import type { ResolvedTaskData } from "@/lib/links/resolve";
import { unlinkDataAction } from "@/app/(work)/tasks/actions";
import { DataLinkPicker } from "./DataLinkPicker";

const STATUS_STYLE: Record<Task["status"], string> = {
  todo: "bg-foreground/10 text-foreground/60",
  doing: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  done: "bg-green-500/15 text-green-700 dark:text-green-300",
};
const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "A fazer",
  doing: "Fazendo",
  done: "Feito",
};

export function TaskCard({
  task,
  resolved,
  linkedBrandName,
  activeBrand,
}: {
  task: Task;
  resolved: ResolvedTaskData;
  linkedBrandName: string | undefined;
  activeBrand: Brand | undefined;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="border-foreground/10 flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[task.status]}`}
        >
          {STATUS_LABEL[task.status]}
        </span>
        <span className="text-sm">{task.title}</span>
      </div>

      {/* A "referencia de dado" no contexto do trabalho — o diferencial. */}
      {resolved === null ? (
        <DataLinkPicker taskId={task.id} activeBrand={activeBrand} />
      ) : (
        <div className="flex items-center gap-2">
          {resolved.ok ? (
            <span className="bg-foreground/[0.04] inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs">
              <span aria-hidden>🔗</span>
              <span className="font-medium">{linkedBrandName}</span>
              <span className="text-foreground/50">·</span>
              <span>{resolved.value.label}</span>
              <span className="font-semibold">{resolved.value.formatted}</span>
              <span className="rounded bg-amber-400/20 px-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                MOCK
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-700 dark:text-red-300">
              <span aria-hidden>⚠️</span>
              {resolved.error}
            </span>
          )}
          <button
            disabled={pending}
            onClick={() => startTransition(() => unlinkDataAction(task.id))}
            className="text-foreground/40 hover:text-foreground/70 text-xs disabled:opacity-50"
            aria-label="Remover vínculo de dado"
          >
            ✕
          </button>
        </div>
      )}
    </li>
  );
}
