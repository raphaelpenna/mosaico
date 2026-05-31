import type { AccessScope, MetricRef, MetricValue } from "@/types";
import type { DataSource } from "./types";

/**
 * ESQUELETO — encaixe do MILESTONE 2.
 *
 * Esta classe e o ponto exato onde o dado REAL da Azzas entra. Hoje todos os
 * metodos lancam "not implemented" de proposito: isso torna o seam VISIVEL e
 * TIPADO (em vez de um comentario solto) e prova que a UI fala so pelo port —
 * basta `DATA_SOURCE=mcp` para ver os chips falharem aqui, sem tocar na UI.
 *
 * Como implementar depois (duas opcoes, ambas async e server-only):
 *
 *  A) Cliente HTTP para os agentes MCP Azzas (recomendado — reaproveita a infra
 *     ja existente em vez de reconstruir o acesso a BigQuery):
 *       - base URL via process.env.MCP_BASE_URL
 *       - auth via header/token (NUNCA no codigo; sempre env var)
 *       - chamar a tool de consulta (ex `consultar_bq` / `get_business_rules`),
 *         mapear a resposta para MetricValue e validar com MetricValueSchema.parse()
 *
 *  B) Cliente BigQuery direto (@google-cloud/bigquery):
 *       - credencial via GOOGLE_SERVICE_ACCOUNT_JSON (env, nunca commitada)
 *       - aplicar o escopo (allowedBrandIds -> filtro REDE_LOJAS) NA query
 *       - usar as formulas canonicas (Venda Liquida = SUM(VALOR_PAGO_PROD), etc.)
 *
 * Em ambos: o `scope` deve virar filtro DENTRO da query (push-down), e a saida
 * passa pelo mesmo MetricValueSchema do mock. Assim o contrato nao muda.
 */
export class MCPDataSource implements DataSource {
  async resolveMetric(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ref: MetricRef,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _scope: AccessScope,
  ): Promise<MetricValue> {
    throw new Error(
      "MCPDataSource.resolveMetric: not implemented — milestone 2",
    );
  }
}
