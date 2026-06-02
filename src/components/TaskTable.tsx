"use client";

import type { CustomFieldValue, FieldDef, Task } from "@/types";
import { sortTasks } from "@/lib/tasks/board";
import { useTaskBoard } from "./task-board-context";
import { StatusButton } from "./StatusButton";
import { TaskTitle } from "./TaskTitle";
import { AssigneePicker } from "./AssigneePicker";
import { DuePicker } from "./DuePicker";
import { PriorityPicker } from "./PriorityPicker";
import { LabelChips } from "./LabelChips";

/**
 * Visão Tabela (base-de-dados): linhas = tarefas, colunas = propriedades —
 * incluindo os CAMPOS CUSTOMIZADOS globais. Campos núcleo são editáveis inline
 * (reusam os mesmos pickers); os customizados são leitura (editar no painel).
 */
function fieldValue(def: FieldDef, raw: CustomFieldValue | undefined): string {
  if (raw === undefined) return "";
  if (Array.isArray(raw)) return raw.join(", ");
  if (def.type === "checkbox") return raw === "1" ? "✓" : "";
  if (def.type === "currency" && raw) return `R$ ${raw}`;
  return raw;
}

const TH =
  "text-muted px-2 py-2 text-left text-xs font-semibold whitespace-nowrap";
const TD = "border-border border-t px-2 py-1.5 align-middle";

export function TaskTable({ tasks }: { tasks: Task[] }) {
  const { fields, openTask } = useTaskBoard();
  // Só campos globais viram coluna (consistentes entre marcas).
  const cols = fields.filter((f) => !f.brandId);
  const rows = [...tasks].sort(sortTasks);

  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface-2/50">
            <th className={TH} aria-label="Status" />
            <th className={`${TH} w-full min-w-56`} scope="col">
              Tarefa
            </th>
            <th className={TH} scope="col">
              Resp.
            </th>
            <th className={TH} scope="col">
              Prazo
            </th>
            <th className={TH} scope="col">
              Prioridade
            </th>
            <th className={TH} scope="col">
              Labels
            </th>
            {cols.map((f) => (
              <th key={f.id} className={TH} scope="col">
                {f.name}
              </th>
            ))}
            <th className={TH} aria-label="Abrir" />
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="hover:bg-surface-2/40 group">
              <td className={TD}>
                <StatusButton id={t.id} status={t.status} />
              </td>
              <td className={TD}>
                <TaskTitle
                  id={t.id}
                  title={t.title}
                  done={t.status === "done"}
                />
              </td>
              <td className={TD}>
                <AssigneePicker id={t.id} assigneeId={t.assigneeId} />
              </td>
              <td className={TD}>
                <DuePicker id={t.id} dueDate={t.dueDate} />
              </td>
              <td className={TD}>
                <PriorityPicker id={t.id} priority={t.priority} />
              </td>
              <td className={TD}>
                <LabelChips labelIds={t.labelIds} className="flex flex-wrap" />
              </td>
              {cols.map((f) => (
                <td key={f.id} className={`${TD} text-muted whitespace-nowrap`}>
                  {fieldValue(f, t.customFields[f.id]) || (
                    <span className="text-faint">—</span>
                  )}
                </td>
              ))}
              <td className={TD}>
                <button
                  type="button"
                  onClick={() => openTask(t.id)}
                  aria-label="Abrir detalhes"
                  className="text-faint hover:bg-surface-2 hover:text-fg flex h-6 w-6 items-center justify-center rounded-md transition-colors"
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                    <path
                      d="M6 4l4 4-4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
