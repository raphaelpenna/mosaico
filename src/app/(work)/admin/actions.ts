"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  createBrand,
  deleteBrand,
  moveBrand,
  updateBrand,
} from "@/lib/brands/store";

/**
 * Server actions do Admin. Toda mutação exige papel "admin" (verificado na
 * sessão do servidor) — o client nunca decide isso. Revalida a árvore inteira
 * porque as marcas aparecem na sidebar (layout) e nos dados das tarefas.
 */
async function assertAdmin(): Promise<boolean> {
  const { scope } = await getSession();
  return scope.role === "admin";
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export async function createBrandAction(formData: FormData): Promise<void> {
  if (!(await assertAdmin())) return;
  const name = String(formData.get("name") ?? "");
  if (!name.trim()) return;
  createBrand({ name });
  revalidatePath("/", "layout");
}

export async function updateBrandAction(
  id: string,
  patch: { name?: string; accent?: string },
): Promise<void> {
  if (!id || !(await assertAdmin())) return;
  const clean: { name?: string; accent?: string } = {};
  if (typeof patch.name === "string") clean.name = patch.name;
  if (typeof patch.accent === "string" && HEX.test(patch.accent))
    clean.accent = patch.accent;
  updateBrand(id, clean);
  revalidatePath("/", "layout");
}

export async function deleteBrandAction(id: string): Promise<void> {
  if (!id || !(await assertAdmin())) return;
  deleteBrand(id);
  revalidatePath("/", "layout");
}

export async function moveBrandAction(id: string, dir: -1 | 1): Promise<void> {
  if (!id || !(await assertAdmin())) return;
  moveBrand(id, dir === 1 ? 1 : -1);
  revalidatePath("/", "layout");
}
