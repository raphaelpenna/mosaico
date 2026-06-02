import { describe, it, expect } from "vitest";
import type { Task } from "@/types";
import {
  applyPatch,
  boardReducer,
  buildGroups,
  filterTasks,
  sortTasks,
} from "./board";

function task(over: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "Tarefa",
    status: "todo",
    priority: "medium",
    labelIds: [],
    subtasks: [],
    blocks: [],
    brandId: "farm",
    createdBy: "u-stub",
    ...over,
  };
}

describe("applyPatch", () => {
  it("altera só as chaves presentes", () => {
    const t = task({ title: "A", priority: "low" });
    const r = applyPatch(t, { title: "B" });
    expect(r.title).toBe("B");
    expect(r.priority).toBe("low"); // intacto
  });

  it("null limpa dueDate/assigneeId; string define", () => {
    const t = task({ dueDate: "2026-06-10", assigneeId: "ana" });
    expect(applyPatch(t, { dueDate: null }).dueDate).toBeUndefined();
    expect(applyPatch(t, { assigneeId: null }).assigneeId).toBeUndefined();
    expect(applyPatch(t, { dueDate: "2026-07-01" }).dueDate).toBe("2026-07-01");
  });

  it("não muta o original", () => {
    const t = task({ title: "A" });
    applyPatch(t, { title: "B" });
    expect(t.title).toBe("A");
  });
});

describe("boardReducer", () => {
  const a = task({ id: "a" });
  const b = task({ id: "b" });
  const state = [a, b];

  it("patch atualiza só o alvo", () => {
    const r = boardReducer(state, {
      type: "patch",
      id: "a",
      patch: { status: "done" },
    });
    expect(r.find((t) => t.id === "a")?.status).toBe("done");
    expect(r.find((t) => t.id === "b")?.status).toBe("todo");
  });

  it("remove / add", () => {
    expect(boardReducer(state, { type: "remove", id: "a" })).toHaveLength(1);
    expect(
      boardReducer(state, { type: "add", task: task({ id: "c" }) }),
    ).toHaveLength(3);
  });

  it("bulkPatch / bulkRemove atingem o conjunto", () => {
    const bp = boardReducer(state, {
      type: "bulkPatch",
      ids: ["a", "b"],
      patch: { priority: "urgent" },
    });
    expect(bp.every((t) => t.priority === "urgent")).toBe(true);
    expect(
      boardReducer(state, { type: "bulkRemove", ids: ["a", "b"] }),
    ).toEqual([]);
  });
});

describe("sortTasks", () => {
  it("ordena por prioridade (urgente primeiro)", () => {
    const arr = [
      task({ priority: "low" }),
      task({ priority: "urgent" }),
      task({ priority: "medium" }),
    ];
    const sorted = [...arr].sort(sortTasks).map((t) => t.priority);
    expect(sorted).toEqual(["urgent", "medium", "low"]);
  });

  it("empate de prioridade vai pelo prazo mais cedo; sem prazo por último", () => {
    const arr = [
      task({ id: "x", priority: "high", dueDate: "2026-06-20" }),
      task({ id: "y", priority: "high", dueDate: "2026-06-05" }),
      task({ id: "z", priority: "high" }),
    ];
    expect([...arr].sort(sortTasks).map((t) => t.id)).toEqual(["y", "x", "z"]);
  });
});

describe("filterTasks", () => {
  const tasks = [
    task({
      id: "1",
      title: "Briefing campanha",
      priority: "urgent",
      assigneeId: "ana",
      labelIds: ["campanha"],
    }),
    task({
      id: "2",
      title: "Revisar mix",
      priority: "medium",
      labelIds: ["produto"],
    }),
    task({
      id: "3",
      title: "Vitrine loja",
      priority: "medium",
      assigneeId: "carla",
      labelIds: ["loja"],
    }),
  ];

  it("busca por título (case-insensitive)", () => {
    expect(filterTasks(tasks, { query: "briefing" }).map((t) => t.id)).toEqual([
      "1",
    ]);
  });
  it("filtra por prioridade", () => {
    expect(
      filterTasks(tasks, { priorities: new Set(["medium"]) }).map((t) => t.id),
    ).toEqual(["2", "3"]);
  });
  it("filtra por responsável e por 'sem responsável'", () => {
    expect(filterTasks(tasks, { assignee: "ana" }).map((t) => t.id)).toEqual([
      "1",
    ]);
    expect(filterTasks(tasks, { assignee: "__none" }).map((t) => t.id)).toEqual(
      ["2"],
    );
  });
  it("filtra por label", () => {
    expect(filterTasks(tasks, { label: "loja" }).map((t) => t.id)).toEqual([
      "3",
    ]);
  });
  it("combina critérios (E lógico)", () => {
    expect(
      filterTasks(tasks, {
        priorities: new Set(["medium"]),
        label: "produto",
      }).map((t) => t.id),
    ).toEqual(["2"]);
  });
  it("sem critérios devolve tudo", () => {
    expect(filterTasks(tasks, {})).toHaveLength(3);
  });
});

describe("buildGroups", () => {
  const tasks = [
    task({
      id: "1",
      status: "todo",
      priority: "urgent",
      assigneeId: "ana",
      brandId: "farm",
    }),
    task({ id: "2", status: "done", priority: "low", brandId: "animale" }),
    task({
      id: "3",
      status: "todo",
      priority: "medium",
      assigneeId: "ana",
      brandId: "farm",
    }),
  ];

  it("agrupa por status na ordem canônica e ordena dentro do grupo", () => {
    const g = buildGroups(tasks, "status");
    expect(g.map((x) => x.key)).toEqual(["todo", "doing", "done"]);
    const todo = g.find((x) => x.key === "todo")!;
    // urgente antes de medium
    expect(todo.items.map((t) => t.id)).toEqual(["1", "3"]);
  });

  it("agrupa por responsável incluindo 'sem responsável'", () => {
    const g = buildGroups(tasks, "assignee");
    const none = g.find((x) => x.key === "__none")!;
    expect(none.items.map((t) => t.id)).toEqual(["2"]);
    const ana = g.find((x) => x.key === "ana")!;
    expect(ana.items).toHaveLength(2);
  });

  it("agrupa por marca na ordem de brandIds", () => {
    const g = buildGroups(tasks, "brand", ["farm", "animale"]);
    expect(g.map((x) => x.key)).toEqual(["farm", "animale"]);
    expect(g[0].label).toBe("Farm");
    expect(g[1].label).toBe("Animale");
  });
});
