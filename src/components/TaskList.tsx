import type { Brand } from "@/types";
import type { ResolvedTaskItem } from "@/app/(work)/tasks/page";
import { TaskCard } from "./TaskCard";

/**
 * Lista de tarefas (apresentacao). Recebe os itens JA resolvidos no servidor —
 * nenhuma fonte de dados toca o client.
 */
export function TaskList({
  items,
  activeBrand,
}: {
  items: ResolvedTaskItem[];
  activeBrand: Brand | undefined;
}) {
  if (items.length === 0) {
    return <p className="text-foreground/50 text-sm">Nenhuma tarefa ainda.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map(({ task, resolved, linkedBrandName }) => (
        <TaskCard
          key={task.id}
          task={task}
          resolved={resolved}
          linkedBrandName={linkedBrandName}
          activeBrand={activeBrand}
        />
      ))}
    </ul>
  );
}
