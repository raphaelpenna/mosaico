import type { AccessScope, NewTaskInput, Task, TaskPatch } from "@/types";

/**
 * O PORT de tarefas.
 *
 * Gestao de tarefa/projeto fica atras de uma interface: hoje MockTaskSource
 * (em memoria), amanha um cliente do Plane. Trocar e mudanca de um arquivo
 * (ver index.ts), sem tocar na UI.
 *
 * Toda operacao recebe o `scope` (derivado da sessao no servidor) e e validada
 * contra ele — escopo por dono e por marca nunca vem de parametro do client.
 * Mutacao e uma so: `updateTask(id, patch)`. A granularidade ("mudar status",
 * "definir prazo", ...) mora nas server actions, nao no port.
 */
export interface TaskSource {
  /**
   * Tarefas do dono da sessao. Se `brandId` vier, filtra (e valida) por aquela
   * marca; sem `brandId`, devolve todas as marcas em escopo do dono.
   */
  listTasks(scope: AccessScope, brandId?: string): Promise<Task[]>;
  createTask(input: NewTaskInput, scope: AccessScope): Promise<Task>;
  /**
   * Aplica um patch parcial a uma tarefa do dono. Retorna a tarefa atualizada,
   * ou null se nao existir / for de outro dono.
   */
  updateTask(
    id: string,
    patch: TaskPatch,
    scope: AccessScope,
  ): Promise<Task | null>;
  /** Remove uma tarefa do dono. */
  deleteTask(id: string, scope: AccessScope): Promise<void>;
  /**
   * Reinsere uma tarefa removida PRESERVANDO o id (undo do delete). Valida dono
   * e marca; no-op se o id ja existir ou estiver fora do escopo.
   */
  restoreTask(task: Task, scope: AccessScope): Promise<void>;
}
