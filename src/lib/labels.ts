/**
 * Catálogo de labels — store EM MEMÓRIA, mutável pelo Admin (CRUD). Como o de
 * marcas: módulo simples, mutação só via server actions; os clients recebem as
 * labels por contexto/props do servidor (não importam o catálogo). Reseta no
 * restart. Por ora as labels são globais (decisão aberta: global vs por marca).
 */
export interface Label {
  id: string;
  name: string;
  color: string;
}

const SEED_LABELS: Label[] = [
  { id: "campanha", name: "Campanha", color: "#db2777" },
  { id: "produto", name: "Produto", color: "#2563eb" },
  { id: "loja", name: "Loja", color: "#16a34a" },
  { id: "marketing", name: "Marketing", color: "#d97706" },
  { id: "diretoria", name: "Diretoria", color: "#7c3aed" },
];

const labels: Label[] = SEED_LABELS.map((l) => ({ ...l }));

export function listLabels(): Label[] {
  return labels.map((l) => ({ ...l }));
}

export function getLabel(id: string): Label | undefined {
  const l = labels.find((x) => x.id === id);
  return l ? { ...l } : undefined;
}

export function isLabel(id: string): boolean {
  return labels.some((l) => l.id === id);
}

function slugify(name: string): string {
  const base =
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "label";
  let id = base;
  let n = 2;
  while (labels.some((l) => l.id === id)) id = `${base}-${n++}`;
  return id;
}

export function createLabel(input: {
  name: string;
  color?: string;
}): Label | null {
  const name = input.name.trim();
  if (!name) return null;
  const label: Label = {
    id: slugify(name),
    name,
    color: input.color || "#6b7280",
  };
  labels.push(label);
  return { ...label };
}

export function updateLabel(
  id: string,
  patch: { name?: string; color?: string },
): Label | null {
  const l = labels.find((x) => x.id === id);
  if (!l) return null;
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (name) l.name = name;
  }
  if (patch.color) l.color = patch.color;
  return { ...l };
}

export function deleteLabel(id: string): void {
  const idx = labels.findIndex((l) => l.id === id);
  if (idx !== -1) labels.splice(idx, 1);
}
