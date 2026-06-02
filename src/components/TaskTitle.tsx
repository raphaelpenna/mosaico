"use client";

import { useState } from "react";
import { useTaskBoard } from "./task-board-context";

/**
 * Titulo da tarefa com edicao inline. Clicar entra em modo de edicao; Enter ou
 * blur salva (otimista, via contexto do board), Escape cancela. Titulo vazio ou
 * inalterado nao salva.
 */
export function TaskTitle({
  id,
  title,
  done,
}: {
  id: string;
  title: string;
  done: boolean;
}) {
  const { mutate } = useTaskBoard();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);

  function commit() {
    setEditing(false);
    const next = value.trim();
    if (!next || next === title) {
      setValue(title);
      return;
    }
    mutate(id, { title: next });
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            setValue(title);
            setEditing(false);
          }
        }}
        className="border-border-strong bg-bg -my-1 min-w-0 flex-1 rounded-md border px-2 py-1 text-sm outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setValue(title);
        setEditing(true);
      }}
      title="Clique para renomear"
      className={`hover:bg-surface-2 min-w-0 flex-1 cursor-text truncate rounded px-1 py-0.5 text-left text-sm transition-colors ${
        done ? "text-faint line-through" : "text-fg"
      }`}
    >
      {title}
    </button>
  );
}
