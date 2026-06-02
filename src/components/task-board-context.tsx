"use client";

import { createContext, useContext } from "react";
import type { FieldDef, Label, TaskPatch } from "@/types";

/**
 * Contexto do board: ponto unico de mutacao para os controles de cada linha.
 * As mudancas sao OTIMISTAS (refletem na hora) e so depois confirmam no
 * servidor — o estado vive no TaskBoard via useOptimistic.
 */
export interface TaskBoardCtx {
  /** referencia de "hoje" (ISO) resolvida no servidor */
  today: string;
  /** catálogo de labels (do servidor) — clients não importam o store */
  labels: Label[];
  /** catálogo de campos customizados (do servidor) */
  fields: FieldDef[];
  /** aplica um patch parcial a uma tarefa (otimista + servidor) */
  mutate: (id: string, patch: TaskPatch) => void;
  /** remove uma tarefa (otimista + servidor) com toast de desfazer */
  remove: (id: string) => void;
  /** seleção múltipla (ações em lote) */
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  selecting: boolean;
  /** painel direito de detalhe (split view): id da tarefa aberta */
  openId: string | null;
  openTask: (id: string) => void;
  closeTask: () => void;
}

const Ctx = createContext<TaskBoardCtx | null>(null);

export function useTaskBoard(): TaskBoardCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTaskBoard fora de um TaskBoard.");
  return c;
}

export const TaskBoardProvider = Ctx.Provider;
