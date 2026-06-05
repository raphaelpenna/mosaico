import { describe, it, expect } from "vitest";
import type { Doc } from "./docs";
import { searchDocs, orderDocs } from "./docSort";

function doc(over: Partial<Doc> = {}): Doc {
  return {
    id: "d1",
    title: "Documento",
    blocks: [],
    linkedDocIds: [],
    updatedAt: "2026-05-01T00:00:00.000Z",
    pinned: false,
    createdBy: "u-stub",
    ...over,
  };
}

describe("searchDocs", () => {
  it("filtra por título e por texto dos blocos (case-insensitive)", () => {
    const ds = [
      doc({ id: "a", title: "Guideline de inverno" }),
      doc({
        id: "b",
        title: "Calendário",
        blocks: [{ id: "x", type: "paragraph", text: "Lançamento de INVERNO" }],
      }),
      doc({ id: "c", title: "Outro" }),
    ];
    expect(searchDocs(ds, "inverno").map((d) => d.id)).toEqual(["a", "b"]);
    expect(searchDocs(ds, "  ").map((d) => d.id)).toEqual(["a", "b", "c"]); // vazio = tudo
  });
});

describe("orderDocs", () => {
  it("fixados primeiro; depois por recentes (updatedAt desc)", () => {
    const ds = [
      doc({ id: "velho", updatedAt: "2026-05-01T00:00:00.000Z" }),
      doc({ id: "novo", updatedAt: "2026-05-10T00:00:00.000Z" }),
      doc({ id: "fix", updatedAt: "2026-04-01T00:00:00.000Z", pinned: true }),
    ];
    expect(orderDocs(ds, "recent").map((d) => d.id)).toEqual([
      "fix",
      "novo",
      "velho",
    ]);
  });

  it("ordena A–Z respeitando os fixados no topo", () => {
    const ds = [
      doc({ id: "c", title: "Carla" }),
      doc({ id: "a", title: "Ana" }),
      doc({ id: "b", title: "Bruno", pinned: true }),
    ];
    expect(orderDocs(ds, "alpha").map((d) => d.id)).toEqual(["b", "a", "c"]);
  });
});
