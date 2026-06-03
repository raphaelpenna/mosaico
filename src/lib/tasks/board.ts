import type {
  FieldDef,
  Task,
  TaskPatch,
  TaskPriority,
  TaskStatus,
} from "@/types";

/**
 * Logica PURA do board — sem React, sem DOM. Vive aqui (e nao dentro do
 * componente) para ser testavel no ambiente node e reusada pela UI: o estado
 * otimista, a ordenacao, o filtro e o agrupamento.
 */

// ---- metadados de prioridade ----------------------------------------------

export const PRIORITY_META: {
  value: TaskPriority;
  label: string;
  color: string;
}[] = [
  { value: "urgent", label: "Urgente", color: "var(--prio-urgent)" },
  { value: "high", label: "Alta", color: "var(--prio-high)" },
  { value: "medium", label: "Média", color: "var(--prio-medium)" },
  { value: "low", label: "Baixa", color: "var(--prio-low)" },
];

export const STATUS_GROUPS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "A fazer" },
  { key: "doing", label: "Fazendo" },
  { key: "done", label: "Feito" },
];

const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ---- estado otimista -------------------------------------------------------

export type BoardAction =
  | { type: "patch"; id: string; patch: TaskPatch }
  | { type: "remove"; id: string }
  | { type: "add"; task: Task }
  | { type: "bulkPatch"; ids: string[]; patch: TaskPatch }
  | { type: "bulkRemove"; ids: string[] };

/** Aplica um patch a uma tarefa (espelha a semantica do port: null limpa). */
export function applyPatch(t: Task, patch: TaskPatch): Task {
  const next: Task = { ...t };
  if (patch.title !== undefined) next.title = patch.title;
  if (patch.icon !== undefined) next.icon = patch.icon || undefined;
  if (patch.cover !== undefined) next.cover = patch.cover || undefined;
  if (patch.status !== undefined) next.status = patch.status;
  if (patch.priority !== undefined) next.priority = patch.priority;
  if (patch.labelIds !== undefined) next.labelIds = patch.labelIds;
  if (patch.subtasks !== undefined) next.subtasks = patch.subtasks;
  if (patch.blocks !== undefined) next.blocks = patch.blocks;
  if (patch.customFields !== undefined) next.customFields = patch.customFields;
  if (patch.description !== undefined) next.description = patch.description;
  if (patch.dueDate !== undefined) next.dueDate = patch.dueDate ?? undefined;
  if (patch.assigneeId !== undefined)
    next.assigneeId = patch.assigneeId ?? undefined;
  return next;
}

export function boardReducer(state: Task[], a: BoardAction): Task[] {
  switch (a.type) {
    case "patch":
      return state.map((t) => (t.id === a.id ? applyPatch(t, a.patch) : t));
    case "remove":
      return state.filter((t) => t.id !== a.id);
    case "add":
      return [...state, a.task];
    case "bulkPatch":
      return state.map((t) =>
        a.ids.includes(t.id) ? applyPatch(t, a.patch) : t,
      );
    case "bulkRemove":
      return state.filter((t) => !a.ids.includes(t.id));
  }
}

// ---- ordenação / filtro / agrupamento -------------------------------------

/** Ordena por prioridade (urgente primeiro); empate vai pelo prazo mais cedo. */
export function sortTasks(a: Task, b: Task): number {
  const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (p !== 0) return p;
  if (a.dueDate && b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return 0;
}

export interface FilterCriteria {
  query?: string;
  priorities?: Set<TaskPriority>;
  /** "" = todos; "__none" = sem responsável; senão id da pessoa */
  assignee?: string;
  /** "" = todas; senão id da label */
  label?: string;
}

export function filterTasks(tasks: Task[], c: FilterCriteria): Task[] {
  const q = (c.query ?? "").trim().toLowerCase();
  const priorities = c.priorities;
  const assignee = c.assignee ?? "";
  const label = c.label ?? "";
  return tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q)) return false;
    if (priorities && priorities.size && !priorities.has(t.priority))
      return false;
    if (assignee) {
      if (assignee === "__none" && t.assigneeId) return false;
      if (assignee !== "__none" && t.assigneeId !== assignee) return false;
    }
    if (label && !t.labelIds.includes(label)) return false;
    return true;
  });
}

export type GroupBy =
  | "status"
  | "priority"
  | "assignee"
  | "brand"
  | "label"
  | "due"
  | `field:${string}`;

export interface TaskGroup {
  key: string;
  label: string;
  items: Task[];
}

interface GroupCtx {
  brands?: { id: string; name: string }[];
  labels?: { id: string; name: string }[];
  people?: { id: string; name: string }[];
  fields?: FieldDef[];
  today?: string;
}

const DUE_BUCKETS = [
  { key: "overdue", label: "Atrasadas" },
  { key: "today", label: "Hoje" },
  { key: "week", label: "Próximos 7 dias" },
  { key: "month", label: "Este mês" },
  { key: "later", label: "Mais tarde" },
  { key: "nodate", label: "Sem data" },
];

/** Em qual balde de prazo a tarefa cai, relativo a `today` (ISO). */
function dueBucket(due: string | undefined, today: string): string {
  if (!due) return "nodate";
  if (due < today) return "overdue";
  if (due === today) return "today";
  const d = new Date(`${due}T00:00:00`);
  const t = new Date(`${today}T00:00:00`);
  const days = Math.round((d.getTime() - t.getTime()) / 86_400_000);
  if (days <= 7) return "week";
  if (d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth())
    return "month";
  return "later";
}

/**
 * Agrupa e ordena dentro de cada grupo. `keysOf` devolve as chaves de uma
 * tarefa — normalmente uma, mas em "label" pode ser várias (a tarefa aparece em
 * cada label).
 */
export function buildGroups(
  tasks: Task[],
  groupBy: GroupBy,
  ctx: GroupCtx = {},
): TaskGroup[] {
  let groups: { key: string; label: string }[];
  let keysOf: (t: Task) => string[];
  if (groupBy.startsWith("field:")) {
    const fid = groupBy.slice(6);
    const def = (ctx.fields ?? []).find((f) => f.id === fid);
    groups = [
      ...(def?.options ?? []).map((o) => ({ key: o, label: o })),
      { key: "__none", label: "Sem valor" },
    ];
    keysOf = (t) => {
      const v = t.customFields[fid];
      if (Array.isArray(v)) return v.length ? v : ["__none"];
      return v ? [v] : ["__none"];
    };
  } else if (groupBy === "priority") {
    groups = PRIORITY_META.map((p) => ({ key: p.value, label: p.label }));
    keysOf = (t) => [t.priority];
  } else if (groupBy === "assignee") {
    groups = [
      ...(ctx.people ?? []).map((p) => ({ key: p.id, label: p.name })),
      { key: "__none", label: "Sem responsável" },
    ];
    keysOf = (t) => [t.assigneeId ?? "__none"];
  } else if (groupBy === "brand") {
    groups = (ctx.brands ?? []).map((b) => ({ key: b.id, label: b.name }));
    keysOf = (t) => [t.brandId];
  } else if (groupBy === "label") {
    groups = [
      ...(ctx.labels ?? []).map((l) => ({ key: l.id, label: l.name })),
      { key: "__none", label: "Sem label" },
    ];
    keysOf = (t) => (t.labelIds.length ? t.labelIds : ["__none"]);
  } else if (groupBy === "due") {
    const today = ctx.today ?? "";
    groups = DUE_BUCKETS;
    keysOf = (t) => [dueBucket(t.dueDate, today)];
  } else {
    groups = STATUS_GROUPS;
    keysOf = (t) => [t.status];
  }
  return groups.map((g) => ({
    ...g,
    items: tasks.filter((t) => keysOf(t).includes(g.key)).sort(sortTasks),
  }));
}
