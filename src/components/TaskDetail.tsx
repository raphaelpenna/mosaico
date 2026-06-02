"use client";

import { useState } from "react";
import type { Task } from "@/types";
import { useTaskBoard } from "./task-board-context";
import { LabelEditor } from "./LabelEditor";
import { Subtasks } from "./Subtasks";

/**
 * Painel de detalhe (expansivel) de uma tarefa: descricao, labels e checklist.
 * Tudo salva otimista via contexto do board.
 */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-faint text-xs font-semibold tracking-wide uppercase">
      {children}
    </span>
  );
}

export function TaskDetail({ task }: { task: Task }) {
  const { mutate } = useTaskBoard();
  const [desc, setDesc] = useState(task.description ?? "");

  return (
    <div className="border-border anim-fade ml-9 flex flex-col gap-4 border-t px-3 py-3">
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Descrição</FieldLabel>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={() => {
            if (desc !== (task.description ?? "")) {
              mutate(task.id, { description: desc });
            }
          }}
          rows={2}
          placeholder="Adicionar descrição…"
          className="placeholder:text-faint border-border focus:border-border-strong resize-y rounded-md border bg-transparent px-2.5 py-1.5 text-sm outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Labels</FieldLabel>
        <LabelEditor id={task.id} labelIds={task.labelIds} />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel>Checklist</FieldLabel>
        <Subtasks id={task.id} subtasks={task.subtasks} />
      </div>
    </div>
  );
}
