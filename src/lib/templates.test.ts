import { describe, it, expect } from "vitest";
import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  templatesForBrand,
  updateTemplate,
} from "./templates";

describe("templates store", () => {
  it("começa com seeds (Nova campanha, com checklist)", () => {
    const t = getTemplate("nova-campanha");
    expect(t?.name).toBe("Nova campanha");
    expect(t?.subtaskTitles.length).toBeGreaterThan(0);
  });

  it("templatesForBrand inclui os globais", () => {
    expect(
      templatesForBrand("farm").some((x) => x.id === "nova-campanha"),
    ).toBe(true);
  });

  it("cria template com slug e payload", () => {
    const t = createTemplate({
      name: "Meu Tpl",
      priority: "high",
      labelIds: ["loja"],
      subtaskTitles: ["a", "b"],
    });
    expect(t?.id).toBe("meu-tpl");
    expect(getTemplate("meu-tpl")?.subtaskTitles).toEqual(["a", "b"]);
    expect(getTemplate("meu-tpl")?.priority).toBe("high");
  });

  it("atualiza nome e remove", () => {
    const t = createTemplate({ name: "Apagar" })!;
    updateTemplate(t.id, { name: "Editado" });
    expect(getTemplate(t.id)?.name).toBe("Editado");
    deleteTemplate(t.id);
    expect(getTemplate(t.id)).toBeUndefined();
  });

  it("listTemplates devolve cópias (não vaza estado)", () => {
    listTemplates()[0].subtaskTitles.push("HACK");
    expect(listTemplates()[0].subtaskTitles).not.toContain("HACK");
  });
});
