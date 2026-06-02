"use client";

import { useEffect, useRef } from "react";
import { createTaskAction } from "@/app/(work)/tasks/actions";
import { Button } from "./ui/Button";

/**
 * Form de criar tarefa, com quick-add: o texto aceita tokens que viram
 * metadados no servidor (parseQuickAdd) — !prioridade, @responsável, #label e
 * datas (hoje/amanhã/dd/mm). Escuta "mosaico:focus-add" (atalho do ⌘K / tecla c).
 */
export function AddTask({ brandId }: { brandId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    window.addEventListener("mosaico:focus-add", focus);
    return () => window.removeEventListener("mosaico:focus-add", focus);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <form
        ref={formRef}
        action={async (formData) => {
          await createTaskAction(formData);
          formRef.current?.reset();
        }}
        className="border-border bg-surface focus-within:border-border-strong flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm transition-colors"
      >
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="text-faint h-4 w-4 shrink-0"
        >
          <path
            d="M10 4v12M4 10h12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <input type="hidden" name="brandId" value={brandId} />
        <input
          ref={inputRef}
          name="title"
          required
          autoComplete="off"
          placeholder="Adicionar tarefa…  (tente: !urgente @ana #campanha amanhã)"
          className="placeholder:text-faint min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <Button type="submit" variant="primary">
          Adicionar
        </Button>
      </form>
      <p className="text-faint px-1 text-xs">
        Dica: <code className="text-muted">!alta</code>,{" "}
        <code className="text-muted">@nome</code>,{" "}
        <code className="text-muted">#label</code>,{" "}
        <code className="text-muted">hoje</code> /{" "}
        <code className="text-muted">amanhã</code> /{" "}
        <code className="text-muted">dd/mm</code> viram metadados.
      </p>
    </div>
  );
}
