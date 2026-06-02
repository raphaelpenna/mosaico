"use client";

import { useTaskBoard } from "./task-board-context";
import { Badge } from "./ui/Badge";

/** Chips de label (somente leitura) na linha da tarefa — catálogo via contexto. */
export function LabelChips({
  labelIds,
  className = "",
}: {
  labelIds: string[];
  className?: string;
}) {
  const { labels } = useTaskBoard();
  if (labelIds.length === 0) return null;
  return (
    <div className={`shrink-0 items-center gap-1 ${className}`}>
      {labelIds.map((id) => {
        const label = labels.find((l) => l.id === id);
        if (!label) return null;
        return (
          <Badge key={id} color={label.color}>
            {label.name}
          </Badge>
        );
      })}
    </div>
  );
}
