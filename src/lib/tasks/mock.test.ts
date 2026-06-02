import { describe, it, expect } from "vitest";
import type { AccessScope } from "@/types";
import { MockTaskSource } from "./mock";

// userId "u-stub" = dono das tarefas semeadas (ver mock.ts) — assim o teste
// enxerga o seed. Tarefas criadas no teste tambem pertencem a este usuario.
const scope: AccessScope = {
  userId: "u-stub",
  allowedBrandIds: ["farm", "animale", "fabula"],
  role: "editor",
};

const otherUser: AccessScope = {
  userId: "u-other",
  allowedBrandIds: ["farm", "animale"],
  role: "editor",
};

describe("MockTaskSource", () => {
  const ts = new MockTaskSource();

  it("começa com tarefas semeadas", async () => {
    const tasks = await ts.listTasks(scope);
    expect(tasks.length).toBeGreaterThanOrEqual(3);
  });

  it("filtra por marca quando uma marca em escopo é pedida", async () => {
    const farm = await ts.listTasks(scope, "farm");
    expect(farm.length).toBeGreaterThan(0);
    expect(farm.every((t) => t.brandId === "farm")).toBe(true);
  });

  it("não vaza tarefa de marca fora do escopo (sem marca pedida)", async () => {
    const all = await ts.listTasks(scope);
    expect(all.every((t) => scope.allowedBrandIds.includes(t.brandId))).toBe(
      true,
    );
  });

  it("recusa listar marca fora do escopo (não confia no client)", async () => {
    await expect(ts.listTasks(scope, "carol-bassi")).rejects.toThrow(/escopo/i);
  });

  it("cria tarefa com defaults (todo, medium, sem labels/subtasks)", async () => {
    const t = await ts.createTask({ title: "Nova", brandId: "farm" }, scope);
    expect(t.status).toBe("todo");
    expect(t.priority).toBe("medium");
    expect(t.labelIds).toEqual([]);
    expect(t.subtasks).toEqual([]);
    expect(t.brandId).toBe("farm");
  });

  it("respeita campos iniciais do quick-add (prioridade/prazo/responsável/labels)", async () => {
    const t = await ts.createTask(
      {
        title: "Rica",
        brandId: "farm",
        priority: "urgent",
        dueDate: "2026-07-01",
        assigneeId: "ana",
        labelIds: ["campanha"],
      },
      scope,
    );
    expect(t.priority).toBe("urgent");
    expect(t.dueDate).toBe("2026-07-01");
    expect(t.assigneeId).toBe("ana");
    expect(t.labelIds).toEqual(["campanha"]);
  });

  it("recusa criar tarefa em marca fora do escopo", async () => {
    await expect(
      ts.createTask({ title: "X", brandId: "carol-bassi" }, scope),
    ).rejects.toThrow(/escopo/i);
  });

  it("updateTask aplica patch parcial (status, prioridade, título)", async () => {
    const t = await ts.createTask({ title: "Patch", brandId: "farm" }, scope);
    const r = await ts.updateTask(
      t.id,
      { status: "done", priority: "high", title: "Patch!" },
      scope,
    );
    expect(r?.status).toBe("done");
    expect(r?.priority).toBe("high");
    expect(r?.title).toBe("Patch!");
  });

  it("updateTask limpa prazo/responsável com null e mexe só nas chaves presentes", async () => {
    const t = await ts.createTask(
      {
        title: "Limpar",
        brandId: "farm",
        dueDate: "2026-06-10",
        assigneeId: "ana",
      },
      scope,
    );
    const r = await ts.updateTask(t.id, { dueDate: null }, scope);
    expect(r?.dueDate).toBeUndefined();
    expect(r?.assigneeId).toBe("ana"); // não tocado
    const r2 = await ts.updateTask(t.id, { assigneeId: null }, scope);
    expect(r2?.assigneeId).toBeUndefined();
  });

  it("updateTask em tarefa de outro dono retorna null", async () => {
    const t = await ts.createTask({ title: "Minha", brandId: "farm" }, scope);
    expect(await ts.updateTask(t.id, { status: "done" }, otherUser)).toBeNull();
  });

  it("não deixa mutar/remover tarefa de marca fora do escopo (escrita escopada)", async () => {
    const t = await ts.createTask(
      { title: "Escopo", brandId: "fabula" },
      scope,
    );
    // mesma sessão (dono), mas com escopo que não inclui "fabula"
    const narrow: AccessScope = { ...scope, allowedBrandIds: ["farm"] };
    expect(await ts.updateTask(t.id, { status: "done" }, narrow)).toBeNull();
    await ts.deleteTask(t.id, narrow);
    // continua existindo para o escopo amplo
    expect(
      (await ts.listTasks(scope, "fabula")).some((x) => x.id === t.id),
    ).toBe(true);
  });

  it("restoreTask reinsere preservando o id (undo do delete)", async () => {
    const t = await ts.createTask({ title: "Voltar", brandId: "farm" }, scope);
    const snap = (await ts.listTasks(scope, "farm")).find(
      (x) => x.id === t.id,
    )!;
    await ts.deleteTask(t.id, scope);
    expect((await ts.listTasks(scope, "farm")).some((x) => x.id === t.id)).toBe(
      false,
    );
    await ts.restoreTask(snap, scope);
    const back = (await ts.listTasks(scope, "farm")).find((x) => x.id === t.id);
    expect(back?.id).toBe(t.id);
    expect(back?.title).toBe("Voltar");
  });

  it("remove uma tarefa do dono", async () => {
    const t = await ts.createTask({ title: "Apagar", brandId: "farm" }, scope);
    await ts.deleteTask(t.id, scope);
    const farm = await ts.listTasks(scope, "farm");
    expect(farm.find((x) => x.id === t.id)).toBeUndefined();
  });

  it("isola tarefas por dono — outro usuário não vê as tarefas alheias", async () => {
    expect(await ts.listTasks(otherUser)).toEqual([]);
  });
});
