/**
 * Tipos de dominio compartilhados do Mosaico.
 *
 * Os tipos de DADO (Brand, MetricRef, MetricValue) vem do schema Zod em
 * lib/data/schema — fonte unica da verdade. Aqui ficam os tipos de sessao,
 * escopo de acesso e tarefa.
 */

export type {
  Brand,
  MetricRef,
  MetricValue,
  MetricKey,
  MetricUnit,
} from "@/lib/data/schema";

/** Papel do usuario — stub; vira RBAC real (Entra app roles) depois. */
export type Role = "viewer" | "editor" | "admin";

/**
 * Escopo de acesso derivado da SESSAO no servidor. Toda chamada a um port
 * recebe o escopo e e validada contra ele no servidor — nunca confiar em
 * parametro vindo do client.
 */
export interface AccessScope {
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

/** A tarefa e o "host" descartavel; o `dataLink` e o diferencial duravel. */
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  /** referencia de dado Azzas vinculada a esta tarefa (opcional) */
  dataLink?: import("@/lib/data/schema").MetricRef;
  createdBy: string;
}

export interface NewTaskInput {
  title: string;
}
