import type { TaskPriority } from "@/types";

/**
 * Catálogo de TEMPLATES de tarefa — store EM MEMÓRIA, mutável pelo Admin. Um
 * template é um preset: ao usar, cria a tarefa já com prioridade, labels e
 * checklist preenchidos. Global ou por marca. Reseta no restart.
 */
export interface TemplateDef {
  id: string;
  name: string;
  /** se ausente, global (vale para todas as marcas) */
  brandId?: string;
  priority?: TaskPriority;
  labelIds: string[];
  /** títulos dos itens de checklist (viram subtasks) */
  subtaskTitles: string[];
}

const SEED_TEMPLATES: TemplateDef[] = [
  {
    id: "nova-campanha",
    name: "Nova campanha",
    priority: "high",
    labelIds: ["campanha", "marketing"],
    subtaskTitles: ["Briefing", "Aprovar peças", "Agendar publicação"],
  },
  {
    id: "plano-reposicao",
    name: "Plano de reposição",
    priority: "medium",
    labelIds: ["loja", "produto"],
    subtaskTitles: ["Levantar estoque", "Definir grade", "Enviar pedido"],
  },
];

const templates: TemplateDef[] = SEED_TEMPLATES.map((t) => ({
  ...t,
  labelIds: [...t.labelIds],
  subtaskTitles: [...t.subtaskTitles],
}));

function clone(t: TemplateDef): TemplateDef {
  return {
    ...t,
    labelIds: [...t.labelIds],
    subtaskTitles: [...t.subtaskTitles],
  };
}

export function listTemplates(): TemplateDef[] {
  return templates.map(clone);
}

export function getTemplate(id: string): TemplateDef | undefined {
  const t = templates.find((x) => x.id === id);
  return t ? clone(t) : undefined;
}

/** Templates aplicáveis a uma marca: globais + os daquela marca. */
export function templatesForBrand(brandId: string): TemplateDef[] {
  return listTemplates().filter((t) => !t.brandId || t.brandId === brandId);
}

function slugify(name: string): string {
  const base =
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "template";
  let id = base;
  let n = 2;
  while (templates.some((t) => t.id === id)) id = `${base}-${n++}`;
  return id;
}

export interface NewTemplateInput {
  name: string;
  brandId?: string;
  priority?: TaskPriority;
  labelIds?: string[];
  subtaskTitles?: string[];
}

export function createTemplate(input: NewTemplateInput): TemplateDef | null {
  const name = input.name.trim();
  if (!name) return null;
  const tpl: TemplateDef = {
    id: slugify(name),
    name,
    brandId: input.brandId || undefined,
    priority: input.priority,
    labelIds: input.labelIds ? [...input.labelIds] : [],
    subtaskTitles: input.subtaskTitles ? [...input.subtaskTitles] : [],
  };
  templates.push(tpl);
  return clone(tpl);
}

export function updateTemplate(
  id: string,
  patch: { name?: string },
): TemplateDef | null {
  const t = templates.find((x) => x.id === id);
  if (!t) return null;
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (name) t.name = name;
  }
  return clone(t);
}

export function deleteTemplate(id: string): void {
  const idx = templates.findIndex((t) => t.id === id);
  if (idx !== -1) templates.splice(idx, 1);
}
