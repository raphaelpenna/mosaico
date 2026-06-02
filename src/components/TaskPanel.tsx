"use client";

import { useEffect } from "react";
import type { Task, TaskStatus } from "@/types";
import { useTaskBoard } from "./task-board-context";
import { SelectMenu } from "./ui/SelectMenu";
import { Button } from "./ui/Button";
import { TaskTitle } from "./TaskTitle";
import { AssigneePicker } from "./AssigneePicker";
import { DuePicker } from "./DuePicker";
import { PriorityPicker } from "./PriorityPicker";
import { LabelEditor } from "./LabelEditor";
import { Subtasks } from "./Subtasks";
import { BlockEditor } from "./BlockEditor";
import { CustomFields } from "./CustomFields";
import { Comments } from "./Comments";

/**
 * Painel direito (split view / slide-over) com o detalhe da tarefa — a base da
 * "tarefa como página" do PRD. Reúne propriedades (status, responsável, prazo,
 * prioridade), labels, descrição e checklist. Esc ou clique no backdrop fecham.
 */
const STATUS_OPTS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "todo", label: "A fazer", color: "var(--todo)" },
  { value: "doing", label: "Fazendo", color: "var(--doing)" },
  { value: "done", label: "Feito", color: "var(--done)" },
];

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted w-24 shrink-0 text-xs font-medium">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-faint text-xs font-semibold tracking-wide uppercase">
      {children}
    </span>
  );
}

export function TaskPanel({ task }: { task: Task }) {
  const { mutate, remove, closeTask } = useTaskBoard();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTask();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeTask]);

  const status =
    STATUS_OPTS.find((s) => s.value === task.status) ?? STATUS_OPTS[0];

  return (
    <>
      {/* Backdrop só no mobile (no desktop é split view ao lado). */}
      <div
        className="fixed inset-0 z-40 bg-black/30 sm:hidden"
        onClick={closeTask}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhe: ${task.title}`}
        className="bg-surface border-border anim-panel fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l shadow-xl sm:w-[420px]"
      >
        {/* Header */}
        <div className="border-border flex items-center gap-2 border-b px-3 py-2.5">
          <SelectMenu
            ariaLabel={`Status: ${status.label}`}
            value={task.status}
            onChange={(v) => mutate(task.id, { status: v as TaskStatus })}
            align="start"
            options={STATUS_OPTS.map((s) => ({
              value: s.value,
              label: s.label,
              node: (
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.label}
                </span>
              ),
            }))}
            triggerClassName="hover:bg-surface-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
            trigger={
              <>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                {status.label}
              </>
            }
          />
          <button
            type="button"
            onClick={closeTask}
            aria-label="Fechar detalhe"
            className="text-faint hover:bg-surface-2 hover:text-fg ml-auto flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
              <path
                d="M4 4l8 8M12 4l-8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Corpo */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
          <div className="text-lg font-semibold">
            <TaskTitle
              id={task.id}
              title={task.title}
              done={status.value === "done"}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <Row label="Responsável">
              <AssigneePicker id={task.id} assigneeId={task.assigneeId} />
            </Row>
            <Row label="Prazo">
              <DuePicker id={task.id} dueDate={task.dueDate} />
            </Row>
            <Row label="Prioridade">
              <PriorityPicker id={task.id} priority={task.priority} />
            </Row>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Labels</FieldLabel>
            <LabelEditor id={task.id} labelIds={task.labelIds} />
          </div>

          <CustomFields task={task} />

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Conteúdo</FieldLabel>
            <BlockEditor id={task.id} blocks={task.blocks} />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Checklist</FieldLabel>
            <Subtasks id={task.id} subtasks={task.subtasks} />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Comentários</FieldLabel>
            <Comments task={task} />
          </div>
        </div>

        {/* Ações */}
        <div className="border-border flex border-t px-4 py-2.5">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              closeTask();
              remove(task.id);
            }}
          >
            Remover tarefa
          </Button>
        </div>
      </aside>
    </>
  );
}
