"use client";

import { useRef } from "react";
import { createTaskAction } from "@/app/(work)/tasks/actions";

/**
 * Form de criar tarefa. Posta direto na server action — sem fetch manual,
 * sem estado de dados no client.
 */
export function AddTask() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createTaskAction(formData);
        formRef.current?.reset();
      }}
      className="flex gap-2"
    >
      <input
        name="title"
        required
        placeholder="Nova tarefa…"
        className="border-foreground/15 bg-background flex-1 rounded-md border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="bg-foreground text-background rounded-md px-4 py-2 text-sm font-medium"
      >
        Adicionar
      </button>
    </form>
  );
}
