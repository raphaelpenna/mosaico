/**
 * Catálogo de CAMPOS CUSTOMIZADOS — store EM MEMÓRIA, mutável pelo Admin. Como
 * marcas/labels: módulo simples, mutação via server actions, clients recebem
 * por props/contexto. Um campo pode ser global (sem brandId) ou de uma marca.
 * Reseta no restart.
 */
export type FieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "url"
  | "checkbox"
  | "select"
  | "multiselect";

export interface FieldDef {
  id: string;
  name: string;
  type: FieldType;
  /** se ausente, o campo é global (vale para todas as marcas) */
  brandId?: string;
  /** opções para select/multiselect */
  options?: string[];
}

export const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  text: "Texto",
  number: "Número",
  currency: "Moeda (R$)",
  date: "Data",
  url: "URL",
  checkbox: "Caixa",
  select: "Seleção",
  multiselect: "Multisseleção",
};

const SEED_FIELDS: FieldDef[] = [
  { id: "colecao", name: "Coleção", type: "select", options: ["Inverno", "Verão", "Primavera", "Outono"] }, // prettier-ignore
  { id: "orcamento", name: "Orçamento", type: "currency" },
  { id: "referencia", name: "Referência", type: "url" },
];

const fields: FieldDef[] = SEED_FIELDS.map((f) => ({ ...f }));

export function listFields(): FieldDef[] {
  return fields.map((f) => ({
    ...f,
    options: f.options ? [...f.options] : undefined,
  }));
}

export function getField(id: string): FieldDef | undefined {
  const f = fields.find((x) => x.id === id);
  return f
    ? { ...f, options: f.options ? [...f.options] : undefined }
    : undefined;
}

/** Campos aplicáveis a uma marca: globais + os daquela marca. */
export function fieldsForBrand(brandId: string): FieldDef[] {
  return listFields().filter((f) => !f.brandId || f.brandId === brandId);
}

function slugify(name: string): string {
  const base =
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "campo";
  let id = base;
  let n = 2;
  while (fields.some((f) => f.id === id)) id = `${base}-${n++}`;
  return id;
}

export interface NewFieldInput {
  name: string;
  type: FieldType;
  brandId?: string;
  options?: string[];
}

export function createField(input: NewFieldInput): FieldDef | null {
  const name = input.name.trim();
  if (!name) return null;
  const def: FieldDef = {
    id: slugify(name),
    name,
    type: input.type,
    brandId: input.brandId || undefined,
    options:
      input.type === "select" || input.type === "multiselect"
        ? (input.options ?? []).filter(Boolean)
        : undefined,
  };
  fields.push(def);
  return { ...def };
}

export function updateField(
  id: string,
  patch: { name?: string; options?: string[] },
): FieldDef | null {
  const f = fields.find((x) => x.id === id);
  if (!f) return null;
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (name) f.name = name;
  }
  if (patch.options && (f.type === "select" || f.type === "multiselect")) {
    f.options = patch.options.filter(Boolean);
  }
  return { ...f, options: f.options ? [...f.options] : undefined };
}

export function deleteField(id: string): void {
  const idx = fields.findIndex((f) => f.id === id);
  if (idx !== -1) fields.splice(idx, 1);
}
