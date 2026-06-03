import { describe, it, expect } from "vitest";
import type { AccessScope } from "@/types";
import {
  createDoc,
  deleteDoc,
  getDoc,
  listDocs,
  updateDoc,
} from "./docs";

const owner: AccessScope = {
  userId: "u-stub",
  allowedBrandIds: ["farm", "animale"],
  role: "admin",
};
// Outra sessão: dono diferente E sem a marca farm no escopo.
const other: AccessScope = {
  userId: "u-other",
  allowedBrandIds: ["animale"],
  role: "member",
};

describe("docs store (base de conhecimento por marca)", () => {
  it("começa com o doc semente da Farm", () => {
    const docs = listDocs(owner, "farm");
    expect(docs.some((d) => d.title === "Guideline de marca — inverno")).toBe(
      true,
    );
  });

  it("cria um doc na marca e o lista", () => {
    const d = createDoc("animale", owner)!;
    expect(d.title).toBe("Sem título");
    expect(d.brandId).toBe("animale");
    expect(listDocs(owner, "animale").some((x) => x.id === d.id)).toBe(true);
  });

  it("não cria doc em marca fora do escopo", () => {
    expect(createDoc("farm", other)).toBeNull();
  });

  it("atualiza título, ícone e blocos", () => {
    const d = createDoc("farm", owner)!;
    updateDoc(
      d.id,
      {
        title: "Plano de mídia",
        icon: "📈",
        blocks: [{ id: "x1", type: "paragraph", text: "oi" }],
      },
      owner,
    );
    const got = getDoc(d.id, owner)!;
    expect(got.title).toBe("Plano de mídia");
    expect(got.icon).toBe("📈");
    expect(got.blocks).toHaveLength(1);
  });

  it("título vazio cai para 'Sem título'", () => {
    const d = createDoc("farm", owner)!;
    updateDoc(d.id, { title: "   " }, owner);
    expect(getDoc(d.id, owner)!.title).toBe("Sem título");
  });

  it("não vaza nem deixa editar doc de outro dono/marca", () => {
    const d = createDoc("farm", owner)!;
    // 'other' não é dono e não tem 'farm' no escopo.
    expect(getDoc(d.id, other)).toBeUndefined();
    expect(updateDoc(d.id, { title: "hack" }, other)).toBeNull();
    expect(getDoc(d.id, owner)!.title).not.toBe("hack");
  });

  it("isola mutações: editar o retorno não muda o store", () => {
    const d = createDoc("farm", owner)!;
    d.blocks.push({ id: "leak", type: "paragraph", text: "x" });
    expect(getDoc(d.id, owner)!.blocks).toHaveLength(0);
  });

  it("remove um doc", () => {
    const d = createDoc("farm", owner)!;
    deleteDoc(d.id, owner);
    expect(getDoc(d.id, owner)).toBeUndefined();
  });

  it("listagem retorna [] para marca fora do escopo", () => {
    expect(listDocs(other, "farm")).toEqual([]);
  });
});
