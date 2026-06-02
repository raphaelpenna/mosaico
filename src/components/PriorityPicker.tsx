"use client";

import type { TaskPriority } from "@/types";
import { PRIORITY_META } from "@/lib/tasks/board";
import { useTaskBoard } from "./task-board-context";
import { SelectMenu } from "./ui/SelectMenu";

function Dot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

/** Seletor de prioridade — dropdown acessível com ponto colorido por nível. */
export function PriorityPicker({
  id,
  priority,
}: {
  id: string;
  priority: TaskPriority;
}) {
  const { mutate } = useTaskBoard();
  const meta =
    PRIORITY_META.find((p) => p.value === priority) ?? PRIORITY_META[2];

  return (
    <SelectMenu
      ariaLabel={`Prioridade: ${meta.label}`}
      value={priority}
      onChange={(v) => mutate(id, { priority: v as TaskPriority })}
      options={PRIORITY_META.map((p) => ({
        value: p.value,
        label: p.label,
        node: (
          <span className="flex items-center gap-2">
            <Dot color={p.color} />
            {p.label}
          </span>
        ),
      }))}
      triggerClassName="text-muted hover:bg-surface-2 flex shrink-0 items-center gap-1.5 rounded-md py-1 pr-2 pl-2 text-xs font-medium transition-colors"
      trigger={
        <>
          <Dot color={meta.color} />
          {meta.label}
        </>
      }
    />
  );
}
