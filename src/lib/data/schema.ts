import { z } from "zod";

/**
 * Fronteira tipada do port de dados.
 *
 * Estes schemas Zod sao a UNICA fonte da verdade para o formato dos dados Azzas.
 * O MockDataSource de hoje E o MCPDataSource/BigQuery de amanha precisam produzir
 * objetos que passem por `parse()` aqui. Validar na fronteira e o que garante que
 * trocar a fonte (mock -> MCP) nao quebra a UI silenciosamente: se o JSON real vier
 * com outro formato, o erro estoura na borda, nao no meio da pagina.
 */

export const METRIC_KEYS = [
  "venda_liquida",
  "ticket_medio",
  "pa",
  "margem",
  "sell_through",
] as const;

export const MetricKeySchema = z.enum(METRIC_KEYS);
export type MetricKey = z.infer<typeof MetricKeySchema>;

export const MetricUnitSchema = z.enum(["BRL", "percent", "ratio"]);
export type MetricUnit = z.infer<typeof MetricUnitSchema>;

/**
 * Catalogo canonico de metricas de varejo (nomes reais do negocio Azzas).
 * Os VALORES sao gerados pelo mock e sao 100% ficticios — ver MockDataSource.
 */
export const METRIC_CATALOG: Record<
  MetricKey,
  { label: string; unit: MetricUnit }
> = {
  venda_liquida: { label: "Venda Líquida", unit: "BRL" },
  ticket_medio: { label: "Ticket Médio", unit: "BRL" },
  pa: { label: "PA (Peças/Atendimento)", unit: "ratio" },
  margem: { label: "Margem (MACO)", unit: "percent" },
  sell_through: { label: "Sell-through", unit: "percent" },
};

export const BrandSchema = z.object({
  /** slug estavel usado como id interno e em URLs */
  id: z.string(),
  /** nome de exibicao da marca */
  name: z.string(),
  /** codigo REDE_LOJAS real do data warehouse (taxonomia real, ver lib/brands) */
  redeLojas: z.string(),
  /** agrupamento de BU — PROVISORIO, nao-canonico (ver lib/brands/taxonomy) */
  bu: z.string(),
});
export type Brand = z.infer<typeof BrandSchema>;

export const MetricRefSchema = z.object({
  brandId: z.string(),
  metric: MetricKeySchema,
  /** periodo opcional, ex "2026-05" ou "last_30d" (empurrado para a query no futuro) */
  period: z.string().optional(),
});
export type MetricRef = z.infer<typeof MetricRefSchema>;

export const MetricValueSchema = z.object({
  ref: MetricRefSchema,
  value: z.number(),
  unit: MetricUnitSchema,
  label: z.string(),
  /** string ja formatada para exibicao (ex "R$ 1,2 mi") */
  formatted: z.string(),
  /** SEMPRE true neste milestone — marca o dado como ficticio na fronteira de tipo */
  mock: z.literal(true),
});
export type MetricValue = z.infer<typeof MetricValueSchema>;
