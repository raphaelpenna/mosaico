import type { TaskPriority } from "@/types";
import { listPeople } from "@/lib/people";
import { listLabels } from "@/lib/labels";

/**
 * Parsing leve do quick-add: extrai metadados de tokens no titulo e devolve o
 * titulo limpo + os campos reconhecidos. Roda no servidor (dentro da action),
 * onde os catalogos de pessoas/labels existem.
 *
 * Sintaxe:
 *   !urgente | !alta | !media | !baixa     -> prioridade
 *   @nome                                  -> responsavel (prefixo do nome/id)
 *   #label                                 -> label (prefixo do nome/id)
 *   hoje | amanha | dd/mm                  -> prazo
 */
export interface ParsedQuickAdd {
  title: string;
  priority?: TaskPriority;
  assigneeId?: string;
  labelIds?: string[];
  dueDate?: string;
}

const PRIORITY_WORDS: Record<string, TaskPriority> = {
  urgente: "urgent",
  alta: "high",
  media: "medium",
  média: "medium",
  baixa: "low",
};

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function matchByPrefix<T extends { id: string; name: string }>(
  items: T[],
  token: string,
): T | undefined {
  const t = token.toLowerCase();
  return items.find(
    (i) =>
      i.id.toLowerCase() === t ||
      i.name.toLowerCase().startsWith(t) ||
      i.name
        .toLowerCase()
        .split(" ")
        .some((p) => p.startsWith(t)),
  );
}

export function parseQuickAdd(raw: string, today: Date): ParsedQuickAdd {
  const result: ParsedQuickAdd = { title: "" };
  const labelIds: string[] = [];
  const kept: string[] = [];

  for (const word of raw.split(/\s+/)) {
    if (!word) continue;

    if (word.startsWith("!")) {
      const p = PRIORITY_WORDS[word.slice(1).toLowerCase()];
      if (p) {
        result.priority = p;
        continue;
      }
    }
    if (word.startsWith("@") && word.length > 1) {
      const person = matchByPrefix(listPeople(), word.slice(1));
      if (person) {
        result.assigneeId = person.id;
        continue;
      }
    }
    if (word.startsWith("#") && word.length > 1) {
      const label = matchByPrefix(listLabels(), word.slice(1));
      if (label && !labelIds.includes(label.id)) {
        labelIds.push(label.id);
        continue;
      }
    }

    const lower = word.toLowerCase();
    if (lower === "hoje") {
      result.dueDate = iso(today);
      continue;
    }
    if (lower === "amanha" || lower === "amanhã") {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      result.dueDate = iso(d);
      continue;
    }
    const dm = lower.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (dm) {
      const day = Number(dm[1]);
      const month = Number(dm[2]);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        result.dueDate = `${today.getFullYear()}-${String(month).padStart(
          2,
          "0",
        )}-${String(day).padStart(2, "0")}`;
        continue;
      }
    }

    kept.push(word);
  }

  if (labelIds.length) result.labelIds = labelIds;
  result.title = kept.join(" ").trim();
  return result;
}
