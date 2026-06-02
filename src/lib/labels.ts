/**
 * Catalogo de labels — MOCK. Etiquetas tematicas para classificar tarefas.
 *
 * Config estatica no codigo; cores sao hex usadas como acento das chips. Quando
 * o core OSS de PM (Plane) entrar, isto mapeia para os labels do projeto.
 */
export interface Label {
  id: string;
  name: string;
  color: string;
}

export const LABELS: Label[] = [
  { id: "campanha", name: "Campanha", color: "#db2777" }, // MOCK
  { id: "produto", name: "Produto", color: "#2563eb" }, // MOCK
  { id: "loja", name: "Loja", color: "#16a34a" }, // MOCK
  { id: "marketing", name: "Marketing", color: "#d97706" }, // MOCK
  { id: "diretoria", name: "Diretoria", color: "#7c3aed" }, // MOCK
];

const BY_ID = new Map(LABELS.map((l) => [l.id, l]));

export function getLabel(id: string): Label | undefined {
  return BY_ID.get(id);
}

export function isLabel(id: string): boolean {
  return BY_ID.has(id);
}
