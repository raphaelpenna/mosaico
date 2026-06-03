"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  createBrand,
  deleteBrand,
  moveBrand,
  updateBrand,
} from "@/lib/brands/store";
import { createLabel, deleteLabel, updateLabel } from "@/lib/labels";
import {
  createField,
  deleteField,
  updateField,
  type FieldType,
} from "@/lib/fields";
import {
  createTemplate,
  deleteTemplate,
  updateTemplate,
} from "@/lib/templates";
import { isLabel } from "@/lib/labels";
import type { TaskPriority } from "@/types";

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

// ---- Labels ---------------------------------------------------------------

export async function createLabelAction(formData: FormData): Promise<void> {
  if (!(await assertAdmin())) return;
  const name = String(formData.get("name") ?? "");
  if (!name.trim()) return;
  createLabel({ name });
  revalidatePath("/", "layout");
}

export async function updateLabelAction(
  id: string,
  patch: { name?: string; color?: string },
): Promise<void> {
  if (!id || !(await assertAdmin())) return;
  const clean: { name?: string; color?: string } = {};
  if (typeof patch.name === "string") clean.name = patch.name;
  if (typeof patch.color === "string" && HEX.test(patch.color))
    clean.color = patch.color;
  updateLabel(id, clean);
  revalidatePath("/", "layout");
}

export async function deleteLabelAction(id: string): Promise<void> {
  if (!id || !(await assertAdmin())) return;
  deleteLabel(id);
  revalidatePath("/", "layout");
}

// ---- Campos customizados --------------------------------------------------

const FIELD_TYPES: readonly FieldType[] = [
  "text",
  "number",
  "currency",
  "date",
  "url",
  "checkbox",
  "select",
  "multiselect",
];

export async function createFieldAction(formData: FormData): Promise<void> {
  if (!(await assertAdmin())) return;
  const name = String(formData.get("name") ?? "");
  const type = String(formData.get("type") ?? "") as FieldType;
  const brandId = String(formData.get("brandId") ?? "");
  const optionsRaw = String(formData.get("options") ?? "");
  if (!name.trim() || !FIELD_TYPES.includes(type)) return;
  const options = optionsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  createField({ name, type, brandId: brandId || undefined, options });
  revalidatePath("/", "layout");
}

export async function updateFieldAction(
  id: string,
  patch: { name?: string },
): Promise<void> {
  if (!id || !(await assertAdmin())) return;
  if (typeof patch.name === "string") updateField(id, { name: patch.name });
  revalidatePath("/", "layout");
}

export async function deleteFieldAction(id: string): Promise<void> {
  if (!id || !(await assertAdmin())) return;
  deleteField(id);
  revalidatePath("/", "layout");
}

// ---- Templates de tarefa --------------------------------------------------

const PRIORITIES: readonly TaskPriority[] = ["low", "medium", "high", "urgent"];
const csv = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export async function createTemplateAction(formData: FormData): Promise<void> {
  if (!(await assertAdmin())) return;
  const name = String(formData.get("name") ?? "");
  if (!name.trim()) return;
  const brandId = String(formData.get("brandId") ?? "");
  const priority = String(formData.get("priority") ?? "") as TaskPriority;
  createTemplate({
    name,
    brandId: brandId || undefined,
    priority: PRIORITIES.includes(priority) ? priority : undefined,
    labelIds: csv(String(formData.get("labels") ?? "")).filter(isLabel),
    subtaskTitles: csv(String(formData.get("checklist") ?? "")),
  });
  revalidatePath("/", "layout");
}

export async function updateTemplateAction(
  id: string,
  patch: { name?: string },
): Promise<void> {
  if (!id || !(await assertAdmin())) return;
  if (typeof patch.name === "string") updateTemplate(id, { name: patch.name });
  revalidatePath("/", "layout");
}

export async function deleteTemplateAction(id: string): Promise<void> {
  if (!id || !(await assertAdmin())) return;
  deleteTemplate(id);
  revalidatePath("/", "layout");
}
