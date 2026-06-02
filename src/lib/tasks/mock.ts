import type { AccessScope, NewTaskInput, Task, TaskPatch } from "@/types";
import { assertBrandInScope } from "@/lib/brands/scope";
import type { TaskSource } from "./types";

// =============================================================================
// MOCK — store de tarefas EM MEMORIA, escopado por dono (scope.userId) E por
// marca (task.brandId). Reseta a cada restart do servidor (nao serve producao).
// A persistencia real vem com o nucleo OSS de PM (Plane) no milestone seguinte.
// Os titulos abaixo sao ficticios.
// =============================================================================

let seq = 0;
function nextId(prefix = "t"): string {
  seq += 1;
  return `${prefix}${seq}`;
}

// As tarefas semeadas pertencem ao usuario-stub (ver lib/auth/session) — assim
// o demo de um usuario as enxerga, e o isolamento por dono ja vale de fato.
const SEED_OWNER = "u-stub";

function seedTasks(): Task[] {
  // Espalhadas por marca, status, prioridade, responsavel e labels para o demo
  // mostrar tudo funcionando desde o primeiro load.
  const seed: Array<
    Omit<Task, "id" | "createdBy" | "subtasks" | "blocks" | "customFields">
  > = [
    {
      title: "Planejar reposição da loja flagship — inverno",
      status: "doing",
      priority: "high",
      dueDate: "2026-06-01",
      assigneeId: "u-stub",
      labelIds: ["loja", "produto"],
      brandId: "farm",
    }, // MOCK
    {
      title: "Briefing da campanha de inverno",
      status: "todo",
      priority: "urgent",
      dueDate: "2026-05-28",
      assigneeId: "ana",
      labelIds: ["campanha", "marketing"],
      brandId: "farm",
    }, // MOCK
    {
      title: "Revisar mix de produto da nova coleção",
      status: "todo",
      priority: "medium",
      dueDate: "2026-06-20",
      labelIds: ["produto"],
      brandId: "farm",
      description: "Avaliar cobertura de categorias e gaps de grade.",
    }, // MOCK
    {
      title: "Aprovar fotos do lookbook",
      status: "done",
      priority: "low",
      assigneeId: "bruno",
      labelIds: ["marketing"],
      brandId: "farm",
    }, // MOCK
    {
      title: "Alinhar vitrine das lojas de shopping",
      status: "doing",
      priority: "medium",
      assigneeId: "carla",
      labelIds: ["loja"],
      brandId: "animale",
    }, // MOCK
    {
      title: "Fechar grade de tamanhos do alfaiate",
      status: "todo",
      priority: "high",
      dueDate: "2026-06-05",
      assigneeId: "u-stub",
      labelIds: ["produto"],
      brandId: "animale",
    }, // MOCK
    {
      title: "Cronograma de produção cápsula festa",
      status: "todo",
      priority: "urgent",
      labelIds: ["produto", "diretoria"],
      brandId: "fabula",
    }, // MOCK
    {
      title: "Definir paleta de cores primavera",
      status: "done",
      priority: "medium",
      assigneeId: "diego",
      labelIds: ["produto"],
      brandId: "fabula",
    }, // MOCK
  ];
  return seed.map((t) => ({
    ...t,
    labelIds: [...t.labelIds],
    subtasks: [],
    blocks: [],
    customFields: {},
    id: nextId(),
    createdBy: SEED_OWNER,
  }));
}

// Estado modulo-level: vive enquanto o processo do servidor vive.
const tasks: Task[] = seedTasks();

/**
 * Tarefa acessivel para ESCRITA: do dono da sessao E com a marca no escopo.
 * Leitura ja e escopada por marca em listTasks; a escrita tem de ser tambem,
 * senao um id retido permitiria mutar tarefa de marca fora do escopo.
 */
function accessibleTask(id: string, scope: AccessScope): Task | undefined {
  const t = tasks.find((x) => x.id === id && x.createdBy === scope.userId);
  if (!t) return undefined;
  return scope.allowedBrandIds.includes(t.brandId) ? t : undefined;
}

export class MockTaskSource implements TaskSource {
  async listTasks(scope: AccessScope, brandId?: string): Promise<Task[]> {
    // Se uma marca foi pedida, valida contra o escopo antes de filtrar — nunca
    // confia no parametro cru. Sem marca, devolve so as marcas em escopo (uma
    // tarefa de marca fora do escopo nunca vaza).
    if (brandId) assertBrandInScope(scope, brandId);
    const allowed = new Set(scope.allowedBrandIds);
    return tasks
      .filter((t) => t.createdBy === scope.userId)
      .filter((t) => (brandId ? t.brandId === brandId : allowed.has(t.brandId)))
      .map((t) => ({
        ...t,
        labelIds: [...t.labelIds],
        subtasks: [...t.subtasks],
        blocks: [...t.blocks],
        customFields: { ...t.customFields },
      }));
  }

  async createTask(input: NewTaskInput, scope: AccessScope): Promise<Task> {
    const title = input.title.trim();
    if (!title) throw new Error("Título da tarefa vazio.");
    // A marca da nova tarefa tem de estar no escopo da sessao.
    assertBrandInScope(scope, input.brandId);
    const task: Task = {
      id: nextId(),
      title,
      status: "todo",
      priority: input.priority ?? "medium",
      dueDate: input.dueDate,
      assigneeId: input.assigneeId,
      labelIds: input.labelIds ? [...input.labelIds] : [],
      subtasks: [],
      blocks: [],
      customFields: {},
      brandId: input.brandId,
      createdBy: scope.userId,
    };
    tasks.push(task);
    return {
      ...task,
      labelIds: [...task.labelIds],
      subtasks: [...task.subtasks],
      blocks: [...task.blocks],
      customFields: { ...task.customFields },
    };
  }

  async updateTask(
    id: string,
    patch: TaskPatch,
    scope: AccessScope,
  ): Promise<Task | null> {
    const task = accessibleTask(id, scope);
    if (!task) return null;

    if (patch.title !== undefined) {
      const clean = patch.title.trim();
      if (!clean) throw new Error("Título da tarefa vazio.");
      task.title = clean;
    }
    if (patch.status !== undefined) task.status = patch.status;
    if (patch.priority !== undefined) task.priority = patch.priority;
    if (patch.labelIds !== undefined) task.labelIds = [...patch.labelIds];
    if (patch.subtasks !== undefined) task.subtasks = [...patch.subtasks];
    if (patch.blocks !== undefined) task.blocks = [...patch.blocks];
    if (patch.customFields !== undefined)
      task.customFields = { ...patch.customFields };
    if (patch.description !== undefined) task.description = patch.description;

    // null LIMPA o campo; string define; undefined nao mexe.
    if (patch.dueDate !== undefined) {
      if (patch.dueDate) task.dueDate = patch.dueDate;
      else delete task.dueDate;
    }
    if (patch.assigneeId !== undefined) {
      if (patch.assigneeId) task.assigneeId = patch.assigneeId;
      else delete task.assigneeId;
    }

    return {
      ...task,
      labelIds: [...task.labelIds],
      subtasks: [...task.subtasks],
      blocks: [...task.blocks],
      customFields: { ...task.customFields },
    };
  }

  async deleteTask(id: string, scope: AccessScope): Promise<void> {
    const task = accessibleTask(id, scope);
    if (!task) return;
    const idx = tasks.indexOf(task);
    if (idx !== -1) tasks.splice(idx, 1);
  }

  async restoreTask(task: Task, scope: AccessScope): Promise<void> {
    // Undo do delete: reinsere preservando o id. So as proprias tarefas, marca
    // em escopo, e sem duplicar id.
    if (task.createdBy !== scope.userId) return;
    if (!scope.allowedBrandIds.includes(task.brandId)) return;
    if (tasks.some((t) => t.id === task.id)) return;
    tasks.push({
      ...task,
      labelIds: [...task.labelIds],
      subtasks: [...task.subtasks],
      blocks: [...task.blocks],
      customFields: { ...task.customFields },
    });
  }
}
