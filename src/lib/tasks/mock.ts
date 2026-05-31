import type { AccessScope, MetricRef, NewTaskInput, Task } from "@/types";
import { assertBrandInScope } from "@/lib/brands/scope";
import type { TaskSource } from "./types";

// =============================================================================
// MOCK — store de tarefas EM MEMORIA.
// Reseta a cada restart do servidor e e por-instancia (nao serve producao). A
// persistencia real vem com o nucleo OSS de PM (Plane) no milestone seguinte.
// Os titulos abaixo sao ficticios.
// =============================================================================

let seq = 0;
function nextId(): string {
  seq += 1;
  return `t${seq}`;
}

function seedTasks(): Task[] {
  return [
    {
      id: nextId(),
      title: "Planejar reposição da loja flagship — inverno", // MOCK
      status: "doing",
      dataLink: { brandId: "farm", metric: "sell_through" },
      createdBy: "seed",
    },
    {
      id: nextId(),
      title: "Briefing da campanha de inverno", // MOCK
      status: "todo",
      dataLink: { brandId: "animale", metric: "venda_liquida" },
      createdBy: "seed",
    },
    {
      id: nextId(),
      title: "Revisar mix de produto da nova coleção", // MOCK
      status: "todo",
      createdBy: "seed",
    },
  ];
}

// Estado modulo-level: vive enquanto o processo do servidor vive.
const tasks: Task[] = seedTasks();

function find(taskId: string): Task {
  const t = tasks.find((x) => x.id === taskId);
  if (!t) throw new Error(`Tarefa nao encontrada: ${taskId}`);
  return t;
}

export class MockTaskSource implements TaskSource {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async listTasks(_scope: AccessScope): Promise<Task[]> {
    return tasks.map((t) => ({ ...t }));
  }

  async createTask(input: NewTaskInput, scope: AccessScope): Promise<Task> {
    const title = input.title.trim();
    if (!title) throw new Error("Título da tarefa vazio.");
    const task: Task = {
      id: nextId(),
      title,
      status: "todo",
      createdBy: scope.role, // stub — viraria o user id real
    };
    tasks.push(task);
    return { ...task };
  }

  async linkData(
    taskId: string,
    ref: MetricRef,
    scope: AccessScope,
  ): Promise<Task> {
    // Escopo da marca revalidado no servidor antes de vincular.
    assertBrandInScope(scope, ref.brandId);
    const task = find(taskId);
    task.dataLink = ref;
    return { ...task };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async unlinkData(taskId: string, _scope: AccessScope): Promise<Task> {
    const task = find(taskId);
    delete task.dataLink;
    return { ...task };
  }
}
