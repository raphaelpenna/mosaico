"use client";

import { useRef, useState, useTransition } from "react";
import type { Brand } from "@/types";
import type { TemplateDef } from "@/lib/templates";
import { PRIORITY_META } from "@/lib/tasks/board";
import {
  createTemplateAction,
  deleteTemplateAction,
  updateTemplateAction,
} from "@/app/(work)/admin/actions";
import { Button } from "./ui/Button";

/** CRUD de templates de tarefa (Admin v1). */
function Row({ tpl, brandName }: { tpl: TemplateDef; brandName?: string }) {
  const [name, setName] = useState(tpl.name);
  const [pending, start] = useTransition();
  const summary = [
    tpl.priority && PRIORITY_META.find((p) => p.value === tpl.priority)?.label,
    tpl.labelIds.length ? `${tpl.labelIds.length} label(s)` : null,
    tpl.subtaskTitles.length ? `${tpl.subtaskTitles.length} item(ns)` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li
      className={`border-border bg-surface flex items-center gap-2 rounded-xl border px-3 py-2 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim() && name !== tpl.name)
            start(() => updateTemplateAction(tpl.id, { name }));
        }}
        aria-label={`Nome do template ${tpl.name}`}
        className="focus:border-border-strong min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none"
      />
      <span className="text-faint hidden truncate text-xs sm:inline">
        {summary}
      </span>
      <span className="text-faint shrink-0 text-xs">
        {brandName ?? "Global"}
      </span>
      <button
        type="button"
        onClick={() => start(() => deleteTemplateAction(tpl.id))}
        aria-label={`Remover ${tpl.name}`}
        className="text-faint hover:bg-surface-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:text-[var(--danger)]"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
          <path
            d="M4 4l8 8M12 4l-8 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </li>
  );
}

export function AdminTemplates({
  templates,
  brands,
}: {
  templates: TemplateDef[];
  brands: Brand[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const byId = new Map(brands.map((b) => [b.id, b.name]));

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5">
        {templates.map((t) => (
          <Row
            key={t.id}
            tpl={t}
            brandName={t.brandId ? byId.get(t.brandId) : undefined}
          />
        ))}
      </ul>

      <form
        ref={formRef}
        action={async (formData) => {
          await createTemplateAction(formData);
          formRef.current?.reset();
        }}
        className="border-border bg-surface flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2"
      >
        <input
          name="name"
          required
          autoComplete="off"
          placeholder="Novo template…"
          aria-label="Nome do novo template"
          className="placeholder:text-faint min-w-32 flex-1 bg-transparent text-sm outline-none"
        />
        <select
          name="brandId"
          aria-label="Escopo do template"
          defaultValue=""
          className="border-border text-muted rounded-md border bg-transparent px-2 py-1 text-sm"
        >
          <option value="">Global</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          name="priority"
          aria-label="Prioridade do template"
          defaultValue="medium"
          className="border-border text-muted rounded-md border bg-transparent px-2 py-1 text-sm"
        >
          {PRIORITY_META.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          name="labels"
          autoComplete="off"
          placeholder="labels: campanha, loja"
          aria-label="Labels (ids separados por vírgula)"
          className="placeholder:text-faint border-border min-w-32 rounded-md border bg-transparent px-2 py-1 text-sm outline-none"
        />
        <input
          name="checklist"
          autoComplete="off"
          placeholder="checklist: Briefing, Aprovar"
          aria-label="Checklist (itens separados por vírgula)"
          className="placeholder:text-faint border-border min-w-32 flex-1 rounded-md border bg-transparent px-2 py-1 text-sm outline-none"
        />
        <Button type="submit" variant="primary" size="sm">
          Adicionar template
        </Button>
      </form>
    </div>
  );
}
