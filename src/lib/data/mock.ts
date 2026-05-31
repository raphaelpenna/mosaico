import type { AccessScope, MetricRef, MetricValue } from "@/types";
import { assertBrandInScope } from "@/lib/brands/scope";
import { getBrand } from "@/lib/brands/taxonomy";
import type { DataSource } from "./types";
import {
  METRIC_CATALOG,
  MetricValueSchema,
  type MetricKey,
  type MetricUnit,
} from "./schema";

// =============================================================================
// MOCK — TODOS OS NUMEROS ABAIXO SAO FICTICIOS.
// Nenhum valor real de venda/margem da Azzas. So para dar cara de produto ao
// starter. Quando o MCP/BigQuery real entrar, esta classe e descartada.
// =============================================================================

/** Hash deterministico (FNV-1a-ish) para gerar valores estaveis por marca+metrica. */
function seed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Gera um numero ficticio plausivel dentro de uma faixa, deterministico. */
function fakeValue(brandId: string, metric: MetricKey): number {
  const h = seed(`${brandId}:${metric}`);
  const frac = (h % 1000) / 1000; // 0..1 estavel
  switch (metric) {
    case "venda_liquida":
      return Math.round((300_000 + frac * 2_700_000) / 1000) * 1000; // R$300k–3M
    case "ticket_medio":
      return Math.round(150 + frac * 500); // R$150–650
    case "pa":
      return Math.round((1.2 + frac * 2.3) * 100) / 100; // 1.2–3.5
    case "margem":
      return Math.round((35 + frac * 27) * 10) / 10; // 35–62%
    case "sell_through":
      return Math.round((30 + frac * 55) * 10) / 10; // 30–85%
  }
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

function format(value: number, unit: MetricUnit): string {
  switch (unit) {
    case "BRL":
      return brl.format(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    case "ratio":
      return value.toFixed(2);
  }
}

export class MockDataSource implements DataSource {
  async resolveMetric(
    ref: MetricRef,
    scope: AccessScope,
  ): Promise<MetricValue> {
    // Escopo revalidado no servidor — a UI nao e fonte de verdade.
    assertBrandInScope(scope, ref.brandId);
    if (!getBrand(ref.brandId)) {
      throw new Error(`Marca desconhecida: "${ref.brandId}".`);
    }

    const { label, unit } = METRIC_CATALOG[ref.metric];
    const value = fakeValue(ref.brandId, ref.metric); // MOCK — dados ficticios
    const candidate: MetricValue = {
      ref,
      value,
      unit,
      label,
      formatted: format(value, unit),
      mock: true,
    };

    // Valida a saida contra o schema na fronteira — mesma garantia que o
    // futuro MCPDataSource tera que satisfazer.
    return MetricValueSchema.parse(candidate);
  }
}
