import type { AccessScope, MetricRef, NewTaskInput, Task } from "@/types";

/**
 * O PORT de tarefas — o COMMODITY.
 *
 * Gestao de tarefa/projeto nao e o diferencial da Azzas; vira de um nucleo OSS
 * (Plane) no futuro. Por isso fica atras de uma interface igual a do dado: hoje
 * MockTaskSource (em memoria), amanha um cliente do Plane. Trocar e mudanca de
 * um arquivo (ver index.ts), sem tocar na UI.
 *
 * Espelhar a estrategia do projeto — "comprar o commodity, construir o
 * diferencial" — direto na arquitetura: dois ports, e a cola entre eles
 * (lib/links/resolve) e o que o Mosaico unicamente constroi.
 */
export interface TaskSource {
  listTasks(scope: AccessScope): Promise<Task[]>;
  createTask(input: NewTaskInput, scope: AccessScope): Promise<Task>;
  /** Vincula uma referencia de dado a uma tarefa (valida o escopo da marca). */
  linkData(taskId: string, ref: MetricRef, scope: AccessScope): Promise<Task>;
  /** Remove o vinculo de dado de uma tarefa. */
  unlinkData(taskId: string, scope: AccessScope): Promise<Task>;
}
