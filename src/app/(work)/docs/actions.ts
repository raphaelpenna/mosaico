"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createDoc, updateDoc, deleteDoc, setPinned } from "@/lib/docs";
import { sanitizeBlocks } from "@/lib/blocks";
import type { Block } from "@/types";

/**
 * Server actions da base de conhecimento. Mesmo contrato das tarefas: pega a
 * sessão no servidor, deriva o escopo, e o store revalida (dono + marca). O
 * client passa só intenção; nunca o escopo.
 */

// Um doc pode aparecer em /docs (marca) ou /notes (pessoal); editar/remover
// revalida ambas para a lista não ficar defasada.
function revalidateDocSurfaces() {
  revalidatePath("/docs");
  revalidatePath("/notes");
}

export async function createDocAction(brandId: string): Promise<string | null> {
  if (!brandId) return null;
  const { scope } = await getSession();
  const doc = createDoc(brandId, scope);
  if (!doc) return null;
  revalidatePath("/docs");
  return doc.id;
}

/** Cria uma nota pessoal (sem marca). */
export async function createNoteAction(): Promise<string | null> {
  const { scope } = await getSession();
  const doc = createDoc(null, scope);
  if (!doc) return null;
  revalidatePath("/notes");
  return doc.id;
}

export async function updateDocTitleAction(
  id: string,
  title: string,
): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  updateDoc(id, { title: String(title) }, scope);
  revalidateDocSurfaces();
}

export async function updateDocIconAction(
  id: string,
  icon: string,
): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  updateDoc(id, { icon: [...String(icon)].slice(0, 2).join("") }, scope);
  revalidateDocSurfaces();
}

export async function updateDocBlocksAction(
  id: string,
  blocks: Block[],
): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  updateDoc(id, { blocks: sanitizeBlocks(blocks) }, scope);
  revalidateDocSurfaces();
}

/** Relaciona documentos (wiki). O store valida coleção/escopo e exclui self. */
export async function updateDocLinksAction(
  id: string,
  linkedDocIds: string[],
): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  const ids = Array.isArray(linkedDocIds)
    ? linkedDocIds.filter((x) => typeof x === "string")
    : [];
  updateDoc(id, { linkedDocIds: ids }, scope);
  revalidateDocSurfaces();
}

export async function setDocPinnedAction(
  id: string,
  pinned: boolean,
): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  setPinned(id, Boolean(pinned), scope);
  revalidateDocSurfaces();
}

export async function deleteDocAction(id: string): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  deleteDoc(id, scope);
  revalidateDocSurfaces();
}
