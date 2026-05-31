import { describe, it, expect } from "vitest";
import type { AccessScope, MetricRef } from "@/types";
import type { DataSource } from "./types";
import { MetricValueSchema } from "./schema";
import { MockDataSource } from "./mock";

/**
 * CONTRACT TEST do port de dados.
 *
 * Qualquer impl de DataSource tem que satisfazer este conjunto. Hoje so o
 * MockDataSource entra; quando o MCPDataSource for implementado no milestone 2,
 * basta adiciona-lo ao array abaixo — se ele nao conformar (formato fora do
 * schema, escopo nao aplicado), o teste falha. Garantia muito mais forte que
 * "alguns testes do adapter".
 */
const IMPLEMENTATIONS: Array<[string, () => DataSource]> = [
  ["MockDataSource", () => new MockDataSource()],
  // ["MCPDataSource", () => new MCPDataSource()],  // milestone 2
];

const scope: AccessScope = {
  allowedBrandIds: ["farm", "animale", "fabula"],
  role: "editor",
};

describe.each(IMPLEMENTATIONS)("DataSource contract: %s", (_name, make) => {
  const ds = make();

  it("resolveMetric: saída bate com MetricValueSchema e ecoa a ref", async () => {
    const ref: MetricRef = { brandId: "farm", metric: "ticket_medio" };
    const v = await ds.resolveMetric(ref, scope);
    expect(MetricValueSchema.safeParse(v).success).toBe(true);
    expect(v.ref).toEqual(ref);
  });

  it("resolveMetric: rejeita marca fora do escopo", async () => {
    await expect(
      ds.resolveMetric({ brandId: "foxton", metric: "pa" }, scope),
    ).rejects.toBeInstanceOf(Error);
  });
});
