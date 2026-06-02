"use client";

import { useRef, useState, useTransition } from "react";
import type { Brand, FieldDef } from "@/types";
import { FIELD_TYPE_LABEL } from "@/lib/fields";
import {
  createFieldAction,
  deleteFieldAction,
  updateFieldAction,
} from "@/app/(work)/admin/actions";
import { Button } from "./ui/Button";

/**
 * CRUD de campos customizados (Admin v1). Cria com nome + tipo + escopo (global
 * ou marca) + opções (para seleção). Renomear no blur; remover na hora. Edição
 * de opções/tipo após criado fica para depois.
 */
function FieldRow({ def, brandName }: { def: FieldDef; brandName?: string }) {
  const [name, setName] = useState(def.name);
  const [pending, start] = useTransition();

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
          if (name.trim() && name !== def.name)
            start(() => updateFieldAction(def.id, { name }));
        }}
        aria-label={`Nome do campo ${def.name}`}
        className="focus:border-border-strong min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none"
      />
      <span className="bg-surface-2 text-muted shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium">
        {FIELD_TYPE_LABEL[def.type]}
      </span>
      <span className="text-faint shrink-0 text-xs">
        {brandName ?? "Global"}
      </span>
      {def.options && def.options.length > 0 && (
        <span className="text-faint hidden max-w-40 truncate text-xs sm:inline">
          {def.options.join(", ")}
        </span>
      )}
      <button
        type="button"
        onClick={() => start(() => deleteFieldAction(def.id))}
        aria-label={`Remover ${def.name}`}
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

export function AdminFields({
  fields,
  brands,
}: {
  fields: FieldDef[];
  brands: Brand[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const byId = new Map(brands.map((b) => [b.id, b.name]));

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5">
        {fields.map((f) => (
          <FieldRow
            key={f.id}
            def={f}
            brandName={f.brandId ? byId.get(f.brandId) : undefined}
          />
        ))}
      </ul>

      <form
        ref={formRef}
        action={async (formData) => {
          await createFieldAction(formData);
          formRef.current?.reset();
        }}
        className="border-border bg-surface flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2"
      >
        <input
          name="name"
          required
          autoComplete="off"
          placeholder="Novo campo…"
          aria-label="Nome do novo campo"
          className="placeholder:text-faint min-w-32 flex-1 bg-transparent text-sm outline-none"
        />
        <select
          name="type"
          aria-label="Tipo do campo"
          defaultValue="text"
          className="border-border text-muted rounded-md border bg-transparent px-2 py-1 text-sm"
        >
          {Object.entries(FIELD_TYPE_LABEL).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="brandId"
          aria-label="Escopo do campo"
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
        <input
          name="options"
          autoComplete="off"
          placeholder="opções: a, b, c"
          aria-label="Opções (seleção)"
          className="placeholder:text-faint border-border min-w-32 rounded-md border bg-transparent px-2 py-1 text-sm outline-none"
        />
        <Button type="submit" variant="primary" size="sm">
          Adicionar campo
        </Button>
      </form>
    </div>
  );
}
