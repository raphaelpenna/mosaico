import type { AccessScope, Block } from "@/types";

/**
 * Base de conhecimento — documentos por marca. Store EM MEMÓRIA (mock), escopado
 * por dono (createdBy) E por marca (mesma regra de acesso das tarefas). Corpo em
 * blocos, reusando o mesmo editor das tarefas. Reseta no restart.
 */
export interface Doc {
  id: string;
  brandId: string;
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
  ];
  return seed.map((d) => ({
    ...d,
    blocks: d.blocks.map((b) => ({ ...b })),
    id: `d${++seq}`,
    createdBy: SEED_OWNER,
  }));
}

const docs: Doc[] = seedDocs();

/** Doc do dono E com a marca no escopo (mesma regra de escrita das tarefas). */
function accessible(id: string, scope: AccessScope): Doc | undefined {
  const d = docs.find((x) => x.id === id && x.createdBy === scope.userId);
  if (!d) return undefined;
  return scope.allowedBrandIds.includes(d.brandId) ? d : undefined;
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

export function getDoc(id: string, scope: AccessScope): Doc | undefined {
  const d = accessible(id, scope);
  return d ? clone(d) : undefined;
}

export function createDoc(brandId: string, scope: AccessScope): Doc | null {
  if (!scope.allowedBrandIds.includes(brandId)) return null;
  const doc: Doc = {
    id: `d${++seq}`,
    brandId,
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
