import type { Task } from "@/types";
import type { FormulaKind } from "@/lib/fields";

/**
 * Avaliação de campos calculados (fórmula/rollup). PURA — sem React/DOM, sem
 * Date.now: "hoje" entra como ISO (resolvido no servidor, fuso da Azzas). Cada
 * kind devolve a STRING de exibição (read-only); "" quando não aplicável.
 */
function isoDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

export function evalFormula(
  kind: FormulaKind,
  task: Task,
  today: string,
): string {
  switch (kind) {
    case "daysUntilDue": {
      if (!task.dueDate) return "";
      const diff = isoDay(task.dueDate) - isoDay(today);
      if (diff === 0) return "hoje";
      return diff > 0 ? `em ${diff}d` : `${-diff}d atrás`;
    }
    case "subtaskProgress": {
      const total = task.subtasks.length;
      if (total === 0) return "";
      const done = task.subtasks.filter((s) => s.done).length;
      return `${done}/${total}`;
    }
    case "subtaskPercent": {
      const total = task.subtasks.length;
      if (total === 0) return "";
      const done = task.subtasks.filter((s) => s.done).length;
      return `${Math.round((done / total) * 100)}%`;
    }
    case "commentCount":
      return String(task.comments.length);
    case "linkedDocCount":
      return String(task.linkedDocIds.length);
    case "blockCount":
      return String(task.blocks.length);
  }
}
