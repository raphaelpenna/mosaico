import "server-only";

import type { DataSource } from "./types";
import { MockDataSource } from "./mock";
import { MCPDataSource } from "./mcp";

export type { DataSource } from "./types";

/**
 * ============================================================================
 *  O "UM ARQUIVO" do swap Mock -> Real.
 * ============================================================================
 *
 * Toda a UI obtem dados via getDataSource(). Plugar o MCP/BigQuery real no
 * milestone 2 e so fazer `DATA_SOURCE=mcp` (ou trocar o default abaixo) — sem
 * tocar em nenhum componente.
 *
 * `import "server-only"` garante que este modulo (e qualquer credencial que o
 * MCPDataSource use no futuro) NUNCA seja incluido no bundle do browser.
 */
let instance: DataSource | null = null;

export function getDataSource(): DataSource {
  if (instance) return instance;
  const kind = process.env.DATA_SOURCE ?? "mock";
  switch (kind) {
    case "mcp":
      instance = new MCPDataSource();
      break;
    case "mock":
    default:
      instance = new MockDataSource();
      break;
  }
  return instance;
}
