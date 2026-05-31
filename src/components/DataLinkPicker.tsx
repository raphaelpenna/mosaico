"use client";

import { useTransition } from "react";
import type { Brand } from "@/types";
import { METRIC_CATALOG, METRIC_KEYS } from "@/lib/data/schema";
import { linkDataAction } from "@/app/(work)/tasks/actions";

/**
 * Vincula um dado a uma tarefa. So oferece metricas da MARCA ATIVA (selecionada
 * acima e lida do escopo no servidor). Sem marca ativa, instrui o usuario —
 * "filtra o que pode ser vinculado" pela marca em escopo.
 */
export function DataLinkPicker({
  taskId,
  activeBrand,
}: {
  taskId: string;
  activeBrand: Brand | undefined;
}) {
  const [pending, startTransition] = useTransition();

  if (!activeBrand) {
    return (
      <p className="text-foreground/50 text-xs">
        Selecione uma marca acima para vincular um dado.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-foreground/50 text-xs">
        Vincular {activeBrand.name}:
      </span>
      {METRIC_KEYS.map((metric) => (
        <button
          key={metric}
          disabled={pending}
          onClick={() =>
            startTransition(() =>
              linkDataAction(taskId, activeBrand.id, metric),
            )
          }
          className="border-foreground/15 hover:bg-foreground/5 rounded-full border px-2 py-0.5 text-xs disabled:opacity-50"
        >
          {METRIC_CATALOG[metric].label}
        </button>
      ))}
    </div>
  );
}
