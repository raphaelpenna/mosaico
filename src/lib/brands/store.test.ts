import { describe, it, expect } from "vitest";
import {
  allBrandIds,
  createBrand,
  deleteBrand,
  getBrand,
  listBrands,
  moveBrand,
  updateBrand,
} from "./store";

describe("brand store (catálogo mutável)", () => {
  it("começa com o catálogo semente", () => {
    expect(getBrand("farm")?.name).toBe("Farm");
    expect(allBrandIds()).toContain("animale");
  });

  it("cria marca gerando slug a partir do nome", () => {
    const b = createBrand({ name: "Nova Marca" });
    expect(b?.id).toBe("nova-marca");
    expect(getBrand("nova-marca")?.name).toBe("Nova Marca");
  });

  it("garante slug único (colisão recebe sufixo)", () => {
    const a = createBrand({ name: "Dup" });
    const b = createBrand({ name: "Dup" });
    expect(a?.id).toBe("dup");
    expect(b?.id).toBe("dup-2");
  });

  it("atualiza nome e cor", () => {
    const c = createBrand({ name: "Editar", accent: "#111111" })!;
    updateBrand(c.id, { name: "Editada", accent: "#222222" });
    expect(getBrand(c.id)?.name).toBe("Editada");
    expect(getBrand(c.id)?.accent).toBe("#222222");
  });

  it("remove marca", () => {
    const c = createBrand({ name: "Apagar" })!;
    deleteBrand(c.id);
    expect(getBrand(c.id)).toBeUndefined();
  });

  it("move marca de posição", () => {
    const before = listBrands().map((b) => b.id);
    moveBrand(before[0], 1);
    const after = listBrands().map((b) => b.id);
    expect(after[0]).toBe(before[1]);
    expect(after[1]).toBe(before[0]);
  });

  it("listBrands devolve cópias (não vaza o estado interno)", () => {
    const list = listBrands();
    list[0].name = "HACK";
    expect(listBrands()[0].name).not.toBe("HACK");
  });
});
