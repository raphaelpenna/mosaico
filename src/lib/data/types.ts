import type { AccessScope, MetricRef, MetricValue } from "@/types";

/**
 * O PORT de dados — o diferencial do Mosaico.
 *
 * Cuida SO de DADO VIVO da Azzas (metricas). Identidade de marca e config
 * estatica e mora em lib/brands — manter aqui acoplaria o seletor a
 * disponibilidade da fonte (e derrubaria a pagina quando a fonte ainda nao
 * esta implementada). A UI nunca fala com uma fonte direta; fala so por esta
 * interface.
 *
 * Hoje a impl e MockDataSource; amanha e MCPDataSource (cliente HTTP para os
 * agentes MCP Azzas) ou um cliente BigQuery direto. Trocar e mudanca de UM
 * arquivo (ver index.ts) PORQUE a interface e async-first e empurra escopo e
 * filtro para dentro da fonte — nunca filtra na UI.
 */
export interface DataSource {
  /**
   * Resolve uma referencia de dado (marca + metrica + periodo) em um valor.
   * Deve validar o escopo no servidor e validar a saida contra o schema Zod.
   */
  resolveMetric(ref: MetricRef, scope: AccessScope): Promise<MetricValue>;
}
