"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createDoc, updateDoc, deleteDoc } from "@/lib/docs";
import { sanitizeBlocks } from "@/lib/blocks";
import type { Block } from "@/types";

/**
 * Server actions da base de conhecimento. Mesmo contrato das tarefas: pega a
 * sessão no servidor, deriva o escopo, e o store revalida (dono + marca). O
 * client passa só intenção; nunca o escopo.
 */

export async function createDocAction(brandId: string): Promise<string | null> {
  if (!brandId) return null;
  const { scope } = await getSession();
  const doc = createDoc(brandId, scope);
  if (!doc) return null;
  revalidatePath("/docs");
  return doc.id;
}

export async function updateDocTitleAction(
  id: string,
  title: string,
): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  updateDoc(id, { title: String(title) }, scope);
  revalidatePath("/docs");
}

export async function updateDocIconAction(
  id: string,
  icon: string,
): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  updateDoc(id, { icon: [...String(icon)].slice(0, 2).join("") }, scope);
  revalidatePath("/docs");
}

export async function updateDocBlocksAction(
  id: string,
  blocks: Block[],
): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  updateDoc(id, { blocks: sanitizeBlocks(blocks) }, scope);
  revalidatePath("/docs");
}

export async function deleteDocAction(id: string): Promise<void> {
  if (!id) return;
  const { scope } = await getSession();
  deleteDoc(id, scope);
  revalidatePath("/docs");
}
