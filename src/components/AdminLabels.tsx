"use client";

import { useRef, useState, useTransition } from "react";
import type { Label } from "@/types";
import {
  createLabelAction,
  deleteLabelAction,
  updateLabelAction,
} from "@/app/(work)/admin/actions";
import { Button } from "./ui/Button";

/** CRUD de labels (Admin v1). Análogo ao de marcas; sem reordenar. */
function LabelRow({ label }: { label: Label }) {
  const [name, setName] = useState(label.name);
  const [pending, start] = useTransition();

  return (
    <li
      className={`border-border bg-surface flex items-center gap-2 rounded-xl border px-3 py-2 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <label className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        <span className="sr-only">Cor da label {label.name}</span>
        <span
          className="h-3.5 w-3.5 rounded-full"
          style={{ backgroundColor: label.color }}
        />
        <input
          type="color"
          defaultValue={label.color}
          onChange={(e) =>
            start(() => updateLabelAction(label.id, { color: e.target.value }))
          }
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label={`Cor de ${label.name}`}
        />
      </label>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim() && name !== label.name)
            start(() => updateLabelAction(label.id, { name }));
        }}
        aria-label={`Nome da label ${label.name}`}
        className="focus:border-border-strong min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none"
      />

      <span className="text-faint shrink-0 font-mono text-xs">{label.id}</span>

      <button
        type="button"
        onClick={() => start(() => deleteLabelAction(label.id))}
        aria-label={`Remover ${label.name}`}
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

export function AdminLabels({ labels }: { labels: Label[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5">
        {labels.map((l) => (
          <LabelRow key={l.id} label={l} />
        ))}
      </ul>

      <form
        ref={formRef}
        action={async (formData) => {
          await createLabelAction(formData);
          formRef.current?.reset();
        }}
        className="border-border bg-surface flex items-center gap-2 rounded-xl border px-3 py-2"
      >
        <input
          name="name"
          required
          autoComplete="off"
          placeholder="Nova label…"
          aria-label="Nome da nova label"
          className="placeholder:text-faint min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <Button type="submit" variant="primary" size="sm">
          Adicionar label
        </Button>
      </form>
    </div>
  );
}
