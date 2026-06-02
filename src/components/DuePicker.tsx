"use client";

import { useTaskBoard } from "./task-board-context";

/**
 * Seletor de prazo. Exibe a data com tom por urgencia (atrasado / hoje / no
 * prazo) e sobrepoe um <input type="date"> nativo (acessivel). A referencia de
 * "hoje" vem do contexto (resolvida no servidor) para bater no SSR e no client.
 */
const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
});

function format(iso: string): string {
  // Meio-dia local evita que fuso jogue a data para o dia anterior.
  return fmt.format(new Date(`${iso}T12:00:00`));
}

export function DuePicker({ id, dueDate }: { id: string; dueDate?: string }) {
  const { mutate, today } = useTaskBoard();

  // ISO YYYY-MM-DD compara lexicograficamente = cronologicamente.
  const tone = !dueDate
    ? "none"
    : dueDate < today
      ? "overdue"
      : dueDate === today
        ? "today"
        : "future";

  const toneClass =
    tone === "overdue"
      ? "text-[var(--due-overdue)]"
      : tone === "today"
        ? "text-[var(--due-today)]"
        : tone === "future"
          ? "text-muted"
          : "text-faint";

  return (
    <label
      className={`hover:bg-surface-2 relative flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs transition-colors ${toneClass}`}
      title={dueDate ? "Alterar prazo" : "Definir prazo"}
    >
      <span className="sr-only">Prazo</span>
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path
          d="M5 1.5V3m6-1.5V3M2.5 6.5h11M3 3.5h10a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="tabular-nums">
        {dueDate ? format(dueDate) : "Prazo"}
      </span>
      <input
        type="date"
        value={dueDate ?? ""}
        onChange={(e) => mutate(id, { dueDate: e.target.value || null })}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Prazo"
      />
    </label>
  );
}
