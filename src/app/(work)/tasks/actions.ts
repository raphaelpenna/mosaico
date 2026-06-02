"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { getTaskSource } from "@/lib/tasks";
import { parseQuickAdd } from "@/lib/tasks/quickadd";
import { isPerson } from "@/lib/people";
import { isLabel } from "@/lib/labels";
import type {
  Block,
  BlockType,
  CustomFieldValue,
  Subtask,
  Task,
  TaskPatch,
  TaskPriority,
  TaskStatus,
} from "@/types";

/**
 * Server actions da superficie de tarefas.
 *
 * Toda mutacao: pega a sessao no servidor, deriva o escopo, e chama o port —
 * que revalida o escopo (dono + marca). O client nunca passa o escopo; so passa
 * intencao. A granularidade ("mudar status", "definir prazo", ...) mora no
 * client (board), que monta um TaskPatch e chama `updateTaskAction`. Aqui o
 * patch e sanitizado antes de ir ao port.
 */

const VALID_STATUS: readonly TaskStatus[] = ["todo", "doing", "done"];
const VALID_PRIORITY: readonly TaskPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_BLOCK: readonly BlockType[] = [
  "paragraph",
  "heading",
  "todo",
  "bullet",
  "quote",
  "divider",
];

/** Aceita so chaves conhecidas e valores validos — nunca confia no client. */
function sanitize(patch: TaskPatch): TaskPatch {
  const p: TaskPatch = {};
  if (typeof patch.title === "string" && patch.title.trim())
    p.title = patch.title;
  if (patch.status && VALID_STATUS.includes(patch.status))
    p.status = patch.status;
  if (patch.priority && VALID_PRIORITY.includes(patch.priority))
    p.priority = patch.priority;
  if (patch.dueDate === null) p.dueDate = null;
  else if (typeof patch.dueDate === "string" && ISO_DATE.test(patch.dueDate))
    p.dueDate = patch.dueDate;
  if (patch.assigneeId === null) p.assigneeId = null;
  else if (typeof patch.assigneeId === "string" && isPerson(patch.assigneeId))
    p.assigneeId = patch.assigneeId;
  if (Array.isArray(patch.labelIds))
    p.labelIds = patch.labelIds.filter(isLabel);
  if (Array.isArray(patch.blocks))
    p.blocks = patch.blocks
      .filter((b) => b && VALID_BLOCK.includes(b.type))
      .map(
        (b): Block => ({
          id: String(b.id),
          type: b.type,
          text: typeof b.text === "string" ? b.text : "",
          ...(b.type === "heading" ? { level: b.level === 2 ? 2 : 1 } : {}),
          ...(b.type === "todo" ? { done: Boolean(b.done) } : {}),
        }),
      );
  if (typeof patch.description === "string") p.description = patch.description;
  if (Array.isArray(patch.subtasks))
    p.subtasks = patch.subtasks
      .filter((s) => s && typeof s.title === "string" && s.title.trim())
      .map(
        (s): Subtask => ({
          id: String(s.id),
          title: String(s.title).trim(),
          done: Boolean(s.done),
        }),
      );
  if (patch.customFields && typeof patch.customFields === "object") {
    const cf: Record<string, CustomFieldValue> = {};
    for (const [k, v] of Object.entries(patch.customFields)) {
      if (typeof v === "string") cf[k] = v;
      else if (Array.isArray(v))
        cf[k] = v.filter((x) => typeof x === "string").map(String);
    }
    p.customFields = cf;
  }
  return p;
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const raw = String(formData.get("title") ?? "");
  const brandId = String(formData.get("brandId") ?? "");
  if (!raw.trim() || !brandId) return;
  // Quick-add: extrai prioridade/responsavel/labels/prazo do texto.
  const parsed = parseQuickAdd(raw, new Date());
  const title = parsed.title.trim();
  // So tokens, sem titulo de verdade (ex.: "!urgente @ana") — nao cria.
  if (!title) return;
  const { scope } = await getSession();
  await getTaskSource().createTask(
    {
      title,
      brandId,
      priority: parsed.priority,
      dueDate: parsed.dueDate,
      assigneeId: parsed.assigneeId,
      labelIds: parsed.labelIds,
    },
    scope,
  );
  revalidatePath("/tasks");
}

export async function updateTaskAction(
  id: string,
  patch: TaskPatch,
): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  await getTaskSource().updateTask(id, sanitize(patch), scope);
  revalidatePath("/tasks");
}

export async function deleteTaskAction(id: string): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  await getTaskSource().deleteTask(id, scope);
  revalidatePath("/tasks");
}

/** Recria uma tarefa removida (undo do delete) PRESERVANDO o id e os campos. */
export async function recreateTaskAction(task: Task): Promise<void> {
  if (!task?.id || !task?.brandId) return;
  const { scope } = await getSession();
  await getTaskSource().restoreTask(task, scope);
  revalidatePath("/tasks");
}

// ---- Acoes em lote (seleção múltipla) -------------------------------------

export async function bulkUpdateAction(
  ids: string[],
  patch: TaskPatch,
): Promise<void> {
  if (!ids?.length) return;
  const { scope } = await getSession();
  const source = getTaskSource();
  const clean = sanitize(patch);
  await Promise.all(ids.map((id) => source.updateTask(id, clean, scope)));
  revalidatePath("/tasks");
}

export async function bulkDeleteAction(ids: string[]): Promise<void> {
  if (!ids?.length) return;
  const { scope } = await getSession();
  const source = getTaskSource();
  await Promise.all(ids.map((id) => source.deleteTask(id, scope)));
  revalidatePath("/tasks");
}
