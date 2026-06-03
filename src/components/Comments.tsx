"use client";

import { useState, useTransition } from "react";
import type { Person, Task } from "@/types";
import { initials } from "@/lib/people";
import { addCommentAction } from "@/app/(work)/tasks/actions";
import { useTaskBoard } from "./task-board-context";
import { Button } from "./ui/Button";

/**
 * Comentários da tarefa (append-only). Autor e data vêm do servidor; o texto
 * suporta @menções (destacadas e resolvidas contra o catálogo de pessoas).
 * Timezone fixo (São Paulo) para a data ser determinística.
 */
const dtf = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

function matchPerson(people: Person[], token: string) {
  const t = token.toLowerCase();
  return people.find(
    (p) =>
      p.id.toLowerCase() === t ||
      p.name
        .toLowerCase()
        .split(" ")
        .some((part) => part.startsWith(t)),
  );
}

function renderText(people: Person[], text: string) {
  return text.split(/(@\w+)/g).map((part, i) => {
    if (part.startsWith("@")) {
      const person = matchPerson(people, part.slice(1));
      if (person)
        return (
          <span key={i} className="text-accent font-medium">
            @{person.name.split(" ")[0]}
          </span>
        );
    }
    return <span key={i}>{part}</span>;
  });
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="bg-surface-2 text-muted flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
      {initials(name)}
    </span>
  );
}

export function Comments({ task }: { task: Task }) {
  const { people } = useTaskBoard();
  const [text, setText] = useState("");
  const [, start] = useTransition();

  function submit() {
    const t = text.trim();
    if (!t) return;
    start(() => addCommentAction(task.id, t));
    setText("");
  }

  return (
    <div className="flex flex-col gap-3">
      {task.comments.length > 0 && (
        <ul className="flex flex-col gap-3">
          {task.comments.map((c) => {
            const author = people.find((p) => p.id === c.authorId);
            const name = author?.name ?? c.authorId;
            return (
              <li key={c.id} className="flex gap-2">
                <Avatar name={name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-fg text-sm font-medium">{name}</span>
                    <span className="text-faint text-xs">
                      {dtf.format(new Date(c.createdAt))}
                    </span>
                  </div>
                  <p className="text-fg text-sm whitespace-pre-wrap">
                    {renderText(people, c.text)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder="Comentar…  (@ para mencionar)"
          aria-label="Novo comentário"
          className="placeholder:text-faint border-border focus:border-border-strong flex-1 resize-y rounded-md border bg-transparent px-2.5 py-1.5 text-sm outline-none"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={submit}
          disabled={!text.trim()}
        >
          Comentar
        </Button>
      </div>
    </div>
  );
}
