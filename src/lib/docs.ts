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
  /** docs relacionados (mesma coleção: mesma marca, ou ambas notas) — wiki */
  linkedDocIds: string[];
  /** ISO da última edição de conteúdo (ordenação "recentes") */
  updatedAt: string;
  /** fixado no topo da lista (organização) */
  pinned: boolean;
  createdBy: string;
}

let seq = 0;
const SEED_OWNER = "u-stub";

// Carimbo fixo das sementes (determinístico p/ ordenação "recentes" no demo).
const SEED_TS = "2026-05-01T12:00:00.000Z";

function seedDocs(): Doc[] {
  const seed: Array<
    Omit<Doc, "id" | "createdBy" | "linkedDocIds" | "updatedAt" | "pinned">
  > = [
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
      title: "Calendário de coleções 2026", // MOCK
      icon: "🗓️",
      brandId: "farm",
      blocks: [
        { id: "c1", type: "heading", level: 2, text: "Inverno" }, // MOCK
        { id: "c2", type: "paragraph", text: "Lançamento em maio." }, // MOCK
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
  const built = seed.map((d, i) => ({
    ...d,
    blocks: d.blocks.map((b) => ({ ...b })),
    linkedDocIds: [] as string[],
    // Carimbos escalonados para a ordenação "recentes" ter o que mostrar.
    updatedAt: new Date(Date.parse(SEED_TS) + i * 86400000).toISOString(),
    pinned: false,
    id: `d${++seq}`,
    createdBy: SEED_OWNER,
  }));
  // MOCK: relação wiki entre o guideline (d1) e o calendário (d2) da Farm.
  built[0].linkedDocIds = [built[1].id];
  return built;
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
  return {
    ...d,
    blocks: d.blocks.map((b) => ({ ...b })),
    linkedDocIds: [...d.linkedDocIds],
  };
}

function nowIso(): string {
  return new Date().toISOString();
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
    linkedDocIds: [],
    updatedAt: nowIso(),
    pinned: false,
    createdBy: scope.userId,
  };
  docs.push(doc);
  return clone(doc);
}

export function updateDoc(
  id: string,
  patch: {
    title?: string;
    icon?: string;
    blocks?: Block[];
    linkedDocIds?: string[];
  },
  scope: AccessScope,
): Doc | null {
  const d = accessible(id, scope);
  if (!d) return null;
  // Qualquer edição de conteúdo carimba updatedAt (ordenação "recentes").
  d.updatedAt = nowIso();
  if (patch.title !== undefined) d.title = patch.title.trim() || "Sem título";
  if (patch.icon !== undefined) {
    if (patch.icon) d.icon = patch.icon;
    else delete d.icon;
  }
  if (patch.blocks !== undefined) d.blocks = patch.blocks.map((b) => ({ ...b }));
  if (patch.linkedDocIds !== undefined) {
    // Só relaciona dentro da MESMA coleção (mesma marca, ou ambas notas) e
    // nunca a si mesmo — integridade no servidor, não confia no client.
    const sameCollection = (x: Doc) =>
      x.createdBy === scope.userId && x.brandId === d.brandId && x.id !== d.id;
    const valid = new Set(
      docs.filter(sameCollection).map((x) => x.id),
    );
    d.linkedDocIds = [...new Set(patch.linkedDocIds)].filter((x) =>
      valid.has(x),
    );
  }
  return clone(d);
}

/** Fixa/desfixa um doc no topo da lista — não conta como edição (não toca updatedAt). */
export function setPinned(
  id: string,
  pinned: boolean,
  scope: AccessScope,
): Doc | null {
  const d = accessible(id, scope);
  if (!d) return null;
  d.pinned = pinned;
  return clone(d);
}

export function deleteDoc(id: string, scope: AccessScope): void {
  const d = accessible(id, scope);
  if (!d) return;
  const idx = docs.indexOf(d);
  if (idx !== -1) docs.splice(idx, 1);
}
