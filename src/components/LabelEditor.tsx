"use client";

import { useTaskBoard } from "./task-board-context";

/** Editor de labels: chips alternaveis; clicar adiciona/remove (otimista). */
export function LabelEditor({
  id,
  labelIds,
}: {
  id: string;
  labelIds: string[];
}) {
  const { mutate, labels: catalog } = useTaskBoard();
  const set = new Set(labelIds);

  function toggle(labelId: string) {
    const next = set.has(labelId)
      ? labelIds.filter((x) => x !== labelId)
      : [...labelIds, labelId];
    mutate(id, { labelIds: next });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {catalog.map((label) => {
        const on = set.has(label.id);
        return (
          <button
            key={label.id}
            type="button"
            onClick={() => toggle(label.id)}
            aria-pressed={on}
            className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors"
            style={
              on
                ? {
                    borderColor: label.color,
                    backgroundColor: `color-mix(in oklab, ${label.color} 14%, transparent)`,
                  }
                : undefined
            }
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: label.color }}
            />
            <span className={on ? "text-fg" : "text-muted"}>{label.name}</span>
          </button>
        );
      })}
    </div>
  );
}
