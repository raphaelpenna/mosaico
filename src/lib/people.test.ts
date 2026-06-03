import { describe, it, expect } from "vitest";
import {
  createPerson,
  deletePerson,
  getPerson,
  initials,
  isPerson,
  listPeople,
  updatePerson,
} from "./people";

describe("people store (catálogo mutável)", () => {
  it("começa com seeds e o usuário-stub", () => {
    expect(getPerson("u-stub")?.name).toBe("Colaborador Azzas");
    expect(isPerson("ana")).toBe(true);
  });

  it("cria usuário gerando slug do nome", () => {
    const p = createPerson({ name: "Fulano Silva" });
    expect(p?.id).toBe("fulano-silva");
    expect(getPerson("fulano-silva")?.name).toBe("Fulano Silva");
  });

  it("atualiza nome e remove", () => {
    const p = createPerson({ name: "Apagar" })!;
    updatePerson(p.id, { name: "Editado" });
    expect(getPerson(p.id)?.name).toBe("Editado");
    deletePerson(p.id);
    expect(getPerson(p.id)).toBeUndefined();
  });

  it("listPeople devolve cópias", () => {
    listPeople()[0].name = "HACK";
    expect(listPeople()[0].name).not.toBe("HACK");
  });

  it("initials é puro (até 2)", () => {
    expect(initials("Ana Souza")).toBe("AS");
    expect(initials("Madonna")).toBe("M");
  });
});
