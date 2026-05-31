import { describe, it, expect } from "vitest";
import type { AccessScope, MetricRef } from "@/types";
import { MockDataSource } from "./mock";
import { MetricValueSchema } from "./schema";

const scope: AccessScope = {
  allowedBrandIds: ["farm", "animale"],
  role: "editor",
};

const ref: MetricRef = { brandId: "farm", metric: "venda_liquida" };

describe("MockDataSource", () => {
  const ds = new MockDataSource();

  it("rotula todo valor como mock e bate com o schema", async () => {
    const v = await ds.resolveMetric(ref, scope);
    expect(v.mock).toBe(true);
    expect(MetricValueSchema.safeParse(v).success).toBe(true);
    expect(v.formatted).not.toBe("");
    expect(v.label).toBe("Venda Líquida");
  });

  it("é determinístico (mesma ref -> mesmo valor)", async () => {
    const a = await ds.resolveMetric(ref, scope);
    const b = await ds.resolveMetric(ref, scope);
    expect(a.value).toBe(b.value);
  });

  it("formata percent e ratio de acordo com a unidade", async () => {
    const margem = await ds.resolveMetric(
      { brandId: "farm", metric: "margem" },
      scope,
    );
    expect(margem.unit).toBe("percent");
    expect(margem.formatted).toMatch(/%$/);

    const pa = await ds.resolveMetric({ brandId: "farm", metric: "pa" }, scope);
    expect(pa.unit).toBe("ratio");
  });

  it("recusa marca fora do escopo (segurança no servidor)", async () => {
    await expect(
      ds.resolveMetric({ brandId: "carol-bassi", metric: "pa" }, scope),
    ).rejects.toThrow(/escopo/i);
  });
});
