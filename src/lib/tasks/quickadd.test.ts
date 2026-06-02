import { describe, it, expect } from "vitest";
import { parseQuickAdd } from "./quickadd";

const today = new Date("2026-06-01T12:00:00");

describe("parseQuickAdd", () => {
  it("extrai prioridade e limpa o token do título", () => {
    const r = parseQuickAdd("Revisar mix !alta", today);
    expect(r.title).toBe("Revisar mix");
    expect(r.priority).toBe("high");
  });

  it("reconhece responsável por prefixo de nome", () => {
    const r = parseQuickAdd("Briefing @ana", today);
    expect(r.assigneeId).toBe("ana");
    expect(r.title).toBe("Briefing");
  });

  it("acumula labels por # e remove dos tokens", () => {
    const r = parseQuickAdd("Vitrine #loja #marketing", today);
    expect(r.labelIds).toEqual(["loja", "marketing"]);
    expect(r.title).toBe("Vitrine");
  });

  it("entende hoje, amanhã e dd/mm", () => {
    expect(parseQuickAdd("Tarefa hoje", today).dueDate).toBe("2026-06-01");
    expect(parseQuickAdd("Tarefa amanhã", today).dueDate).toBe("2026-06-02");
    expect(parseQuickAdd("Tarefa 15/07", today).dueDate).toBe("2026-07-15");
  });

  it("combina tudo e preserva o título restante", () => {
    const r = parseQuickAdd(
      "Campanha de inverno !urgente @bruno #campanha 10/06",
      today,
    );
    expect(r.title).toBe("Campanha de inverno");
    expect(r.priority).toBe("urgent");
    expect(r.assigneeId).toBe("bruno");
    expect(r.labelIds).toEqual(["campanha"]);
    expect(r.dueDate).toBe("2026-06-10");
  });

  it("texto sem tokens fica intacto", () => {
    const r = parseQuickAdd("Só um título normal", today);
    expect(r.title).toBe("Só um título normal");
    expect(r.priority).toBeUndefined();
  });
});
