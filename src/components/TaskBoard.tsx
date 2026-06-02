"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import type {
  FieldDef,
  Label,
  Task,
  TaskPatch,
  TaskPriority,
  TaskStatus,
} from "@/types";
import { PEOPLE } from "@/lib/people";
import {
  PRIORITY_META,
  STATUS_GROUPS,
  boardReducer,
  buildGroups,
  filterTasks,
  sortTasks,
  type GroupBy,
} from "@/lib/tasks/board";
import { TaskCard } from "./TaskCard";
import { TaskTable } from "./TaskTable";
import { CalendarView } from "./CalendarView";
import { TaskPanel } from "./TaskPanel";
import { TaskBoardProvider, useTaskBoard } from "./task-board-context";
import { Button } from "./ui/Button";
import {
  bulkDeleteAction,
  bulkUpdateAction,
  deleteTaskAction,
  recreateTaskAction,
  updateTaskAction,
} from "@/app/(work)/tasks/actions";

// ---- componente ------------------------------------------------------------

export function TaskBoard({
  tasks,
  today,
  groupByBrand = false,
  brands = [],
  labels = [],
  fields = [],
}: {
  tasks: Task[];
  today: string;
  groupByBrand?: boolean;
  brands?: { id: string; name: string }[];
  labels?: Label[];
  fields?: FieldDef[];
}) {
  const [optimistic, apply] = useOptimistic(tasks, boardReducer);

  // Estado inicial dos filtros/visão vem da URL (links compartilháveis / reload).
  const params = useSearchParams();
  const defaultGroup: GroupBy = groupByBrand ? "brand" : "status";
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [priorityFilter, setPriorityFilter] = useState<Set<TaskPriority>>(
    () =>
      new Set(
        (params.get("priority") ?? "")
          .split(",")
          .filter(Boolean) as TaskPriority[],
      ),
  );
  const [assigneeFilter, setAssigneeFilter] = useState(
    () => params.get("assignee") ?? "",
  );
  const [labelFilter, setLabelFilter] = useState(
    () => params.get("label") ?? "",
  );
  const [groupBy, setGroupBy] = useState<GroupBy>(
    () => (params.get("group") as GroupBy) || defaultGroup,
  );
  const [view, setView] = useState<"list" | "board" | "table" | "calendar">(
    () => {
      const v = params.get("view");
      return v === "board" || v === "table" || v === "calendar" ? v : "list";
    },
  );

  // Sincroniza filtros/visão na URL SEM re-render do servidor (history, não
  // router) — assim o link é compartilhável mas a página (RSC) não re-roda a
  // cada tecla. `brand` é preservado (ele sim controla os dados no servidor).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const set = (k: string, v: string, keep: boolean) =>
      keep ? p.set(k, v) : p.delete(k);
    set("q", query, query.trim() !== "");
    set("priority", [...priorityFilter].join(","), priorityFilter.size > 0);
    set("assignee", assigneeFilter, assigneeFilter !== "");
    set("label", labelFilter, labelFilter !== "");
    set("group", groupBy, groupBy !== defaultGroup);
    set("view", view, view !== "list");
    const qs = p.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `${window.location.pathname}?${qs}` : window.location.pathname,
    );
  }, [
    query,
    priorityFilter,
    assigneeFilter,
    labelFilter,
    groupBy,
    view,
    defaultGroup,
  ]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(
    null,
  );
  const [openId, setOpenId] = useState<string | null>(null);

  // ---- mutações otimistas --------------------------------------------------
  function mutate(id: string, patch: TaskPatch) {
    startTransition(async () => {
      apply({ type: "patch", id, patch });
      await updateTaskAction(id, patch);
    });
  }
  function remove(id: string) {
    const snap = optimistic.find((t) => t.id === id);
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    startTransition(async () => {
      apply({ type: "remove", id });
      await deleteTaskAction(id);
    });
    if (snap) setToast({ msg: "Tarefa removida", undo: () => restore(snap) });
  }
  function restore(task: Task) {
    setToast(null);
    startTransition(async () => {
      apply({ type: "add", task });
      await recreateTaskAction(task);
    });
  }

  // ---- ações em lote -------------------------------------------------------
  const selectedIds = useMemo(() => [...selected], [selected]);
  function bulkMutate(patch: TaskPatch) {
    const ids = selectedIds;
    if (!ids.length) return;
    startTransition(async () => {
      apply({ type: "bulkPatch", ids, patch });
      await bulkUpdateAction(ids, patch);
    });
    setSelected(new Set());
  }
  function bulkRemove() {
    const ids = selectedIds;
    if (!ids.length) return;
    const snaps = optimistic.filter((t) => ids.includes(t.id));
    startTransition(async () => {
      apply({ type: "bulkRemove", ids });
      await bulkDeleteAction(ids);
    });
    setSelected(new Set());
    setToast({
      msg: `${ids.length} tarefa(s) removida(s)`,
      undo: () => {
        setToast(null);
        startTransition(async () => {
          for (const s of snaps) apply({ type: "add", task: s });
          await Promise.all(snaps.map((s) => recreateTaskAction(s)));
        });
      },
    });
  }
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  // ---- toast auto-dismiss --------------------------------------------------
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  // ---- comandos do ⌘K (eventos) -------------------------------------------
  useEffect(() => {
    const onToggleView = () =>
      setView((v) =>
        v === "list"
          ? "board"
          : v === "board"
            ? "table"
            : v === "table"
              ? "calendar"
              : "list",
      );
    const onClear = () => {
      setQuery("");
      setPriorityFilter(new Set());
      setAssigneeFilter("");
      setLabelFilter("");
    };
    window.addEventListener("mosaico:toggle-view", onToggleView);
    window.addEventListener("mosaico:clear-filters", onClear);
    return () => {
      window.removeEventListener("mosaico:toggle-view", onToggleView);
      window.removeEventListener("mosaico:clear-filters", onClear);
    };
  }, []);

  // ---- filtragem -----------------------------------------------------------
  const filtered = useMemo(
    () =>
      filterTasks(optimistic, {
        query,
        priorities: priorityFilter,
        assignee: assigneeFilter,
        label: labelFilter,
      }),
    [optimistic, query, priorityFilter, assigneeFilter, labelFilter],
  );

  const filtering =
    query.trim() !== "" ||
    priorityFilter.size > 0 ||
    assigneeFilter !== "" ||
    labelFilter !== "";

  const ctx = {
    today,
    labels,
    fields,
    mutate,
    remove,
    selected,
    toggleSelect,
    selecting: selected.size > 0,
    openId,
    openTask: (id: string) => setOpenId(id),
    closeTask: () => setOpenId(null),
  };

  const openTask = openId ? optimistic.find((t) => t.id === openId) : null;

  const groupByOptions: { value: GroupBy; label: string }[] = [
    { value: "status", label: "Status" },
    { value: "priority", label: "Prioridade" },
    { value: "assignee", label: "Responsável" },
    { value: "label", label: "Label" },
    { value: "due", label: "Prazo" },
    ...(groupByBrand ? [{ value: "brand" as GroupBy, label: "Marca" }] : []),
  ];

  if (tasks.length === 0) {
    return (
      <div className="border-border text-muted flex flex-col items-center gap-1 rounded-xl border border-dashed px-6 py-12 text-center">
        <p className="text-fg text-sm font-medium">Nenhuma tarefa por aqui</p>
        <p className="text-sm">
          {groupByBrand
            ? "Nenhuma tarefa nas marcas em escopo."
            : "Adicione a primeira tarefa desta marca no campo acima."}
        </p>
      </div>
    );
  }

  const groups = buildGroups(filtered, groupBy, {
    brands,
    labels,
    today,
  }).filter((g) => g.items.length > 0);

  return (
    <TaskBoardProvider value={ctx}>
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="border-border bg-surface focus-within:border-border-strong flex min-w-44 flex-1 items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors">
            <svg viewBox="0 0 16 16" className="text-faint h-4 w-4" aria-hidden>
              <path
                d="M7 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM14 14l-3.5-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tarefas…"
              className="placeholder:text-faint min-w-0 flex-1 bg-transparent text-sm outline-none"
              aria-label="Buscar tarefas"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-faint hover:text-fg text-xs"
                aria-label="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          <Select
            value={assigneeFilter}
            onChange={setAssigneeFilter}
            ariaLabel="Filtrar por responsável"
          >
            <option value="">Todos</option>
            <option value="__none">Sem responsável</option>
            {PEOPLE.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <Select
            value={labelFilter}
            onChange={setLabelFilter}
            ariaLabel="Filtrar por label"
          >
            <option value="">Todas as labels</option>
            {labels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>

          <Select
            value={groupBy}
            onChange={(v) => setGroupBy(v as GroupBy)}
            ariaLabel="Agrupar por"
          >
            {groupByOptions.map((o) => (
              <option key={o.value} value={o.value}>
                Agrupar: {o.label}
              </option>
            ))}
          </Select>

          {/* Toggle de visão */}
          <div className="border-border flex items-center rounded-lg border p-0.5">
            <ViewButton
              on={view === "list"}
              onClick={() => setView("list")}
              label="Lista"
            />
            <ViewButton
              on={view === "board"}
              onClick={() => setView("board")}
              label="Quadro"
            />
            <ViewButton
              on={view === "table"}
              onClick={() => setView("table")}
              label="Tabela"
            />
            <ViewButton
              on={view === "calendar"}
              onClick={() => setView("calendar")}
              label="Calendário"
            />
          </div>
        </div>

        {/* Chips de prioridade */}
        <div className="flex flex-wrap items-center gap-1">
          {PRIORITY_META.map((p) => {
            const on = priorityFilter.has(p.value);
            return (
              <button
                key={p.value}
                type="button"
                onClick={() =>
                  setPriorityFilter((prev) => {
                    const n = new Set(prev);
                    if (n.has(p.value)) n.delete(p.value);
                    else n.add(p.value);
                    return n;
                  })
                }
                aria-pressed={on}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  on
                    ? "border-border-strong bg-surface-2 text-fg"
                    : "border-border text-muted hover:bg-surface-2"
                }`}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                {p.label}
              </button>
            );
          })}
          {filtering && (
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("mosaico:clear-filters"))
              }
              className="text-muted hover:text-fg ml-1 text-xs underline"
            >
              limpar filtros
            </button>
          )}
        </div>

        {/* Conteúdo */}
        {filtered.length === 0 ? (
          <p className="text-muted py-8 text-center text-sm">
            Nenhuma tarefa corresponde aos filtros.
          </p>
        ) : view === "board" ? (
          <BoardView tasks={filtered} />
        ) : view === "table" ? (
          <TaskTable tasks={filtered} />
        ) : view === "calendar" ? (
          <CalendarView tasks={filtered} />
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((g) => (
              <section key={g.key} className="flex flex-col gap-2">
                <header className="flex items-center gap-2 px-1">
                  <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">
                    {g.label}
                  </h2>
                  <span className="text-faint text-xs tabular-nums">
                    {g.items.length}
                  </span>
                </header>
                <ul className="flex flex-col gap-1.5">
                  {g.items.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {filtering && (
          <p className="text-faint text-xs">
            {filtered.length} de {tasks.length} tarefas
          </p>
        )}
      </div>

      {/* Barra de ações em lote */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-20 flex justify-center px-4">
          <div className="bg-surface border-border anim-slide-up flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 shadow-lg">
            <span className="text-fg text-sm font-medium">
              {selected.size} selecionada(s)
            </span>
            <span className="bg-border h-5 w-px" aria-hidden />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => bulkMutate({ status: "done" })}
            >
              Marcar feito
            </Button>
            <Select
              value=""
              onChange={(v) => v && bulkMutate({ priority: v as TaskPriority })}
              ariaLabel="Definir prioridade das selecionadas"
            >
              <option value="">Prioridade…</option>
              {PRIORITY_META.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
            <Select
              value=""
              onChange={(v) =>
                v && bulkMutate({ assigneeId: v === "__none" ? null : v })
              }
              ariaLabel="Atribuir as selecionadas"
            >
              <option value="">Responsável…</option>
              <option value="__none">Ninguém</option>
              {PEOPLE.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Button variant="danger" size="sm" onClick={bulkRemove}>
              Remover
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Toast / undo */}
      {toast && (
        <div
          className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4"
          role="status"
          aria-live="polite"
        >
          <div className="bg-fg text-bg anim-slide-up flex items-center gap-3 rounded-lg px-3 py-2 text-sm shadow-lg">
            <span>{toast.msg}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={toast.undo}
                className="font-semibold underline"
              >
                Desfazer
              </button>
            )}
          </div>
        </div>
      )}
      {openTask && <TaskPanel task={openTask} />}
    </TaskBoardProvider>
  );
}

// ---- sub-componentes -------------------------------------------------------

function Select({
  value,
  onChange,
  ariaLabel,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="border-border text-muted hover:bg-surface-2 cursor-pointer appearance-none rounded-lg border py-1.5 pr-7 pl-2.5 text-sm transition-colors"
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="text-faint pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2"
      >
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function ViewButton({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
        on ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Visão de quadro: colunas por status (rolagem horizontal). Arrastar um card
 * para outra coluna muda o status (HTML5 DnD nativo, sem dependência). A coluna
 * destacada indica o alvo do drop.
 */
function BoardView({ tasks }: { tasks: Task[] }) {
  const { mutate } = useTaskBoard();
  const [over, setOver] = useState<TaskStatus | null>(null);

  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
      {STATUS_GROUPS.map((g) => {
        const items = tasks.filter((t) => t.status === g.key).sort(sortTasks);
        return (
          <section key={g.key} className="flex w-80 shrink-0 flex-col gap-2">
            <header className="flex items-center gap-2 px-1">
              <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">
                {g.label}
              </h2>
              <span className="text-faint text-xs tabular-nums">
                {items.length}
              </span>
            </header>
            <ul
              data-status={g.key}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (over !== g.key) setOver(g.key);
              }}
              onDragLeave={(e) => {
                // só limpa se saiu de fato da coluna (não ao passar por filhos)
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOver((o) => (o === g.key ? null : o));
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                setOver(null);
                if (id) mutate(id, { status: g.key });
              }}
              className={`flex min-h-16 flex-col gap-1.5 rounded-xl p-1.5 transition-colors ${
                over === g.key
                  ? "bg-accent-soft ring-accent/40 ring-1"
                  : "bg-surface-2/40"
              }`}
            >
              {items.map((task) => (
                <TaskCard key={task.id} task={task} draggable />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
