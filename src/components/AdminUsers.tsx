"use client";

import { useRef, useState, useTransition } from "react";
import type { Person } from "@/types";
import { initials } from "@/lib/people";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "@/app/(work)/admin/actions";
import { Button } from "./ui/Button";

/** CRUD de usuários (Admin v2). Atribuição a marcas/papel vem com a auth real. */
function Row({ person }: { person: Person }) {
  const [name, setName] = useState(person.name);
  const [pending, start] = useTransition();

  return (
    <li
      className={`border-border bg-surface flex items-center gap-2 rounded-xl border px-3 py-2 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <span className="bg-surface-2 text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium">
        {initials(name)}
      </span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim() && name !== person.name)
            start(() => updateUserAction(person.id, { name }));
        }}
        aria-label={`Nome de ${person.name}`}
        className="focus:border-border-strong min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none"
      />
      <span className="text-faint shrink-0 font-mono text-xs">{person.id}</span>
      <button
        type="button"
        onClick={() => start(() => deleteUserAction(person.id))}
        aria-label={`Remover ${person.name}`}
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

export function AdminUsers({ people }: { people: Person[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5">
        {people.map((p) => (
          <Row key={p.id} person={p} />
        ))}
      </ul>

      <form
        ref={formRef}
        action={async (formData) => {
          await createUserAction(formData);
          formRef.current?.reset();
        }}
        className="border-border bg-surface flex items-center gap-2 rounded-xl border px-3 py-2"
      >
        <input
          name="name"
          required
          autoComplete="off"
          placeholder="Novo usuário…"
          aria-label="Nome do novo usuário"
          className="placeholder:text-faint min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <Button type="submit" variant="primary" size="sm">
          Adicionar usuário
        </Button>
      </form>
    </div>
  );
}
