"use client";

import { useTransition } from "react";
import type { TemplateDef } from "@/lib/templates";
import { createFromTemplateAction } from "@/app/(work)/tasks/actions";
import { SelectMenu } from "./ui/SelectMenu";

/** Cria uma tarefa a partir de um template (preset). Catálogo vem por props. */
export function TemplatePicker({
  templates,
  brandId,
}: {
  templates: TemplateDef[];
  brandId: string;
}) {
  const [, start] = useTransition();
  if (templates.length === 0) return null;

  return (
    <SelectMenu
      ariaLabel="Usar template"
      value=""
      onChange={(id) => {
        if (id) start(() => createFromTemplateAction(id, brandId));
      }}
      align="end"
      options={templates.map((t) => ({ value: t.id, label: t.name }))}
      triggerClassName="border-border text-muted hover:bg-surface-2 flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium whitespace-nowrap"
      trigger={
        <>
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
            <path
              d="M3 2.5h7l3 3V13a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 13V3a.5.5 0 0 1 .5-.5ZM9.5 2.5V6h3.5M5.5 8.5h5M5.5 10.5h5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Template
        </>
      }
    />
  );
}
