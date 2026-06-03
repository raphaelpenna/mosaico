/**
 * Tipos de dominio compartilhados do Mosaico.
 *
 * `Brand` (identidade de marca, taxonomia estatica) vem de lib/brands/taxonomy.
 * `Person`/`Label` (catalogos mock) vem de lib/people e lib/labels. Aqui ficam
 * os tipos de sessao, escopo de acesso e tarefa.
 */

export type { Brand } from "@/lib/brands/taxonomy";
export type { Person } from "@/lib/people";
export type { Label } from "@/lib/labels";
export type { FieldDef, FieldType } from "@/lib/fields";

/** Valor de um campo customizado: escalar (string) ou multisseleção (string[]). */
export type CustomFieldValue = string | string[];

/** Papel do usuario — stub; vira RBAC real (Entra app roles) depois. */
export type Role = "viewer" | "editor" | "admin";

/**
 * Escopo de acesso derivado da SESSAO no servidor. Toda chamada a um port
 * recebe o escopo e e validada contra ele no servidor — nunca confiar em
 * parametro vindo do client.
 */
export interface AccessScope {
  /** id do usuario dono da sessao — escopa as tarefas (commodity) por dono */
  userId: string;
  /** ids de marca que esta sessao pode ver/vincular */
  allowedBrandIds: string[];
  role: Role;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export interface Session {
  user: SessionUser;
  scope: AccessScope;
}

export type TaskStatus = "todo" | "doing" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

/** Item de checklist dentro de uma tarefa. */
export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

/** Bloco do corpo da tarefa (a "página"). */
export type BlockType =
  | "paragraph"
  | "heading"
  | "todo"
  | "bullet"
  | "quote"
  | "divider";

export interface Block {
  id: string;
  type: BlockType;
  text: string;
  /** heading: 1 ou 2 */
  level?: 1 | 2;
  /** todo: concluído */
  done?: boolean;
}

/** Comentário numa tarefa (autor + texto com @menções, carimbo do servidor). */
export interface Comment {
  id: string;
  authorId: string;
  text: string;
  /** ISO timestamp definido no servidor */
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** ícone (emoji) da tarefa */
  icon?: string;
  /** capa (cor hex) da tarefa */
  cover?: string;
  /** prazo no formato ISO "YYYY-MM-DD" (sem hora); ausente = sem prazo */
  dueDate?: string;
  /** id do responsavel (ver lib/people); ausente = nao atribuida */
  assigneeId?: string;
  /** ids de labels aplicadas (ver lib/labels) */
  labelIds: string[];
  /** checklist de subtarefas */
  subtasks: Subtask[];
  /** corpo da tarefa em blocos (a "página") */
  blocks: Block[];
  /** valores de campos customizados, keyed por id do campo (ver lib/fields) */
  customFields: Record<string, CustomFieldValue>;
  /** comentários (append-only; autor/data definidos no servidor) */
  comments: Comment[];
  /** descricao curta (legado; o corpo rico vive em `blocks`) */
  description?: string;
  /** marca a que a tarefa pertence — escopada/validada no servidor */
  brandId: string;
  createdBy: string;
}

export interface NewTaskInput {
  title: string;
  /** marca da tarefa — validada contra o escopo da sessao no servidor */
  brandId: string;
  /** prioridade inicial — default "medium" se omitida */
  priority?: TaskPriority;
  /** prazo inicial (ISO) — opcional (usado pelo quick-add) */
  dueDate?: string;
  /** responsavel inicial — opcional (usado pelo quick-add) */
  assigneeId?: string;
  /** labels iniciais — opcional (usado pelo quick-add) */
  labelIds?: string[];
}

/**
 * Patch parcial de uma tarefa. So as chaves presentes sao alteradas; `null` em
 * dueDate/assigneeId LIMPA o campo. Esta e a unica forma de mutar uma tarefa
 * (alem de create/delete) — granularidade vive nas server actions, nao no port.
 */
export interface TaskPatch {
  title?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  icon?: string;
  cover?: string;
  dueDate?: string | null;
  assigneeId?: string | null;
  labelIds?: string[];
  subtasks?: Subtask[];
  blocks?: Block[];
  customFields?: Record<string, CustomFieldValue>;
  description?: string;
}
