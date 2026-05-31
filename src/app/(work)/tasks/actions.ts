"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { getTaskSource } from "@/lib/tasks";
import { MetricRefSchema } from "@/lib/data/schema";

/**
 * Server actions da superficie de tarefas.
 *
 * Toda mutacao: pega a sessao no servidor, deriva o escopo, e chama o port —
 * que revalida o escopo. O client nunca passa o escopo; so passa intencao.
 */

export async function createTaskAction(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "");
  if (!title.trim()) return;
  const { scope } = await getSession();
  await getTaskSource().createTask({ title }, scope);
  revalidatePath("/tasks");
}

export async function linkDataAction(
  taskId: string,
  brandId: string,
  metric: string,
): Promise<void> {
  // Valida o formato da referencia na fronteira (metrica precisa ser do enum).
  const ref = MetricRefSchema.parse({ brandId, metric });
  const { scope } = await getSession();
  await getTaskSource().linkData(taskId, ref, scope);
  revalidatePath("/tasks");
}

export async function unlinkDataAction(taskId: string): Promise<void> {
  const { scope } = await getSession();
  await getTaskSource().unlinkData(taskId, scope);
  revalidatePath("/tasks");
}
