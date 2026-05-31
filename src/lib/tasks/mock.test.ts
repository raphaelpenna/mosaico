import { describe, it, expect } from "vitest";
import type { AccessScope } from "@/types";
import { MockTaskSource } from "./mock";

const scope: AccessScope = {
  allowedBrandIds: ["farm", "animale"],
  role: "editor",
};

describe("MockTaskSource", () => {
  const ts = new MockTaskSource();

  it("começa com tarefas semeadas", async () => {
    const tasks = await ts.listTasks(scope);
    expect(tasks.length).toBeGreaterThanOrEqual(3);
  });

  it("cria tarefa com status inicial 'todo'", async () => {
    const t = await ts.createTask({ title: "Nova" }, scope);
    expect(t.title).toBe("Nova");
    expect(t.status).toBe("todo");
    expect(t.dataLink).toBeUndefined();
  });

  it("vincula dado de marca em escopo e depois desvincula", async () => {
    const t = await ts.createTask({ title: "Com dado" }, scope);
    const linked = await ts.linkData(
      t.id,
      { brandId: "farm", metric: "sell_through" },
      scope,
    );
    expect(linked.dataLink).toEqual({
      brandId: "farm",
      metric: "sell_through",
    });

    const unlinked = await ts.unlinkData(t.id, scope);
    expect(unlinked.dataLink).toBeUndefined();
  });

  it("recusa vincular marca fora do escopo", async () => {
    const t = await ts.createTask({ title: "Fora" }, scope);
    await expect(
      ts.linkData(t.id, { brandId: "carol-bassi", metric: "pa" }, scope),
    ).rejects.toThrow(/escopo/i);
  });
});
