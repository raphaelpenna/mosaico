import "server-only";

import type { AccessScope, MetricValue, Task } from "@/types";
import { getDataSource } from "@/lib/data";
import { isBrandInScope } from "@/lib/brands/scope";

/**
 * A COLA — o mecanismo de "referencia de dado" que o Mosaico unicamente constroi.
 *
 * Liga o port de tarefa (commodity) ao port de dado (diferencial): pega o
 * dataLink de uma tarefa, revalida o escopo no servidor e resolve o valor pelo
 * DataSource. Este e o artefato DURAVEL do milestone — quando a tarefa virar um
 * objeto do Plane e o dado vier do MCP real, esta funcao continua a mesma.
 *
 * Roda so no servidor (RSC/server action): a fronteira server-only garante que
 * nenhuma credencial futura vaze para o browser.
 */
export type ResolvedTaskData =
  | { ok: true; value: MetricValue }
  | { ok: false; error: string }
  | null;

export async function resolveTaskData(
  task: Task,
  scope: AccessScope,
): Promise<ResolvedTaskData> {
  if (!task.dataLink) return null;

  // Defesa em profundidade: revalida o escopo aqui tambem, nao so na fonte.
  if (!isBrandInScope(scope, task.dataLink.brandId)) {
    return { ok: false, error: "Dado fora do escopo desta sessão." };
  }

  try {
    const value = await getDataSource().resolveMetric(task.dataLink, scope);
    return { ok: true, value };
  } catch (err) {
    // Ex: DATA_SOURCE=mcp -> "not implemented — milestone 2". Mostrar no card
    // em vez de derrubar a pagina prova o seam sem quebrar a UI.
    return { ok: false, error: err instanceof Error ? err.message : "Erro" };
  }
}
