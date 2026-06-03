import type { AccessScope, Block } from "@/types";

/**
 * Documentos em blocos. Store EM MEMÓRIA (mock), reusando o editor das tarefas.
 * Dois sabores, mesma estrutura:
 *  - base de conhecimento da marca (`brandId` setado) — escopo dono + marca;
 *  - nota pessoal (`brandId` ausente) — escopo só por dono.
 * Reseta no restart.
 */
export interface Doc {
  id: string;
  /** ausente = nota pessoal (escopo só por dono). */
  brandId?: string;
  title: string;
  icon?: string;
  blocks: Block[];
  createdBy: string;
}

let seq = 0;
const SEED_OWNER = "u-stub";

function seedDocs(): Doc[] {
  const seed: Array<Omit<Doc, "id" | "createdBy">> = [
    {
      title: "Guideline de marca — inverno",
      icon: "📘",
      brandId: "farm",
      blocks: [
        { id: "d1", type: "heading", level: 1, text: "Tom de voz" }, // MOCK
        { id: "d2", type: "paragraph", text: "Leve, colorido e otimista." }, // MOCK
        { id: "d3", type: "bullet", text: "Sempre citar a coleção" }, // MOCK
      ],
    },
    {
      title: "Minhas anotações da semana", // MOCK — nota pessoal (sem marca)
      icon: "📝",
      blocks: [
        { id: "n1", type: "todo", done: false, text: "Revisar briefings" }, // MOCK
        { id: "n2", type: "todo", done: true, text: "Alinhar com o time" }, // MOCK
      ],
    },
  ];
  return seed.map((d) => ({
    ...d,
    blocks: d.blocks.map((b) => ({ ...b })),
    id: `d${++seq}`,
    createdBy: SEED_OWNER,
  }));
}

const docs: Doc[] = seedDocs();

/**
 * Doc do dono; se for de marca, a marca também tem de estar no escopo (mesma
 * regra de escrita das tarefas). Nota pessoal (sem marca) basta ser do dono.
 */
function accessible(id: string, scope: AccessScope): Doc | undefined {
  const d = docs.find((x) => x.id === id && x.createdBy === scope.userId);
  if (!d) return undefined;
  if (d.brandId && !scope.allowedBrandIds.includes(d.brandId)) return undefined;
  return d;
}

function clone(d: Doc): Doc {
  return { ...d, blocks: d.blocks.map((b) => ({ ...b })) };
}

export function listDocs(scope: AccessScope, brandId: string): Doc[] {
  if (!scope.allowedBrandIds.includes(brandId)) return [];
  return docs
    .filter((d) => d.createdBy === scope.userId && d.brandId === brandId)
    .map(clone);
}

/** Notas pessoais do dono (sem marca). */
export function listNotes(scope: AccessScope): Doc[] {
  return docs
    .filter((d) => d.createdBy === scope.userId && !d.brandId)
    .map(clone);
}

/** Referência leve a um doc (id/título/ícone/marca) — para vincular/exibir. */
export interface DocRef {
  id: string;
  title: string;
  icon?: string;
  brandId?: string;
}

/**
 * Catálogo leve de docs de marca em escopo, para o picker de vínculos da tarefa
 * (a UI filtra pela marca da tarefa). Notas pessoais não entram — vínculo é só
 * tarefa↔doc de marca.
 */
export function listDocRefs(scope: AccessScope): DocRef[] {
  return docs
    .filter(
      (d) =>
        d.createdBy === scope.userId &&
        d.brandId &&
        scope.allowedBrandIds.includes(d.brandId),
    )
    .map((d) => ({ id: d.id, title: d.title, icon: d.icon, brandId: d.brandId }));
}

export function getDoc(id: string, scope: AccessScope): Doc | undefined {
  const d = accessible(id, scope);
  return d ? clone(d) : undefined;
}

/** Cria um doc de marca (`brandId` setado) ou uma nota pessoal (`brandId` null). */
export function createDoc(
  brandId: string | null,
  scope: AccessScope,
): Doc | null {
  if (brandId && !scope.allowedBrandIds.includes(brandId)) return null;
  const doc: Doc = {
    id: `d${++seq}`,
    ...(brandId ? { brandId } : {}),
    title: "Sem título",
    blocks: [],
    createdBy: scope.userId,
  };
  docs.push(doc);
  return clone(doc);
}

export function updateDoc(
  id: string,
  patch: { title?: string; icon?: string; blocks?: Block[] },
  scope: AccessScope,
): Doc | null {
  const d = accessible(id, scope);
  if (!d) return null;
  if (patch.title !== undefined) d.title = patch.title.trim() || "Sem título";
  if (patch.icon !== undefined) {
    if (patch.icon) d.icon = patch.icon;
    else delete d.icon;
  }
  if (patch.blocks !== undefined) d.blocks = patch.blocks.map((b) => ({ ...b }));
  return clone(d);
}

export function deleteDoc(id: string, scope: AccessScope): void {
  const d = accessible(id, scope);
  if (!d) return;
  const idx = docs.indexOf(d);
  if (idx !== -1) docs.splice(idx, 1);
}
