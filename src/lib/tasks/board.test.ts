import { describe, it, expect } from "vitest";
import type { Task } from "@/types";
import {
  applyPatch,
  boardReducer,
  buildGroups,
  buildTimeline,
  buildWorkload,
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
    customFields: {},
    comments: [],
    linkedDocIds: [],
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
    const g = buildGroups(tasks, "assignee", {
      people: [{ id: "ana", name: "Ana" }],
    });
    const none = g.find((x) => x.key === "__none")!;
    expect(none.items.map((t) => t.id)).toEqual(["2"]);
    const ana = g.find((x) => x.key === "ana")!;
    expect(ana.items).toHaveLength(2);
  });

  it("agrupa por marca na ordem recebida, usando os nomes passados", () => {
    const g = buildGroups(tasks, "brand", {
      brands: [
        { id: "farm", name: "Farm" },
        { id: "animale", name: "Animale" },
      ],
    });
    expect(g.map((x) => x.key)).toEqual(["farm", "animale"]);
    expect(g[0].label).toBe("Farm");
    expect(g[1].label).toBe("Animale");
  });

  it("agrupa por label (multi-grupo) incluindo 'sem label'", () => {
    const ltasks = [
      task({ id: "a", labelIds: ["campanha", "produto"] }),
      task({ id: "b", labelIds: ["produto"] }),
      task({ id: "c", labelIds: [] }),
    ];
    const g = buildGroups(ltasks, "label", {
      labels: [
        { id: "campanha", name: "Campanha" },
        { id: "produto", name: "Produto" },
      ],
    });
    expect(g.find((x) => x.key === "campanha")!.items.map((t) => t.id)).toEqual(
      ["a"],
    );
    // "a" aparece em campanha E em produto (multi-grupo)
    expect(g.find((x) => x.key === "produto")!.items.map((t) => t.id)).toEqual([
      "a",
      "b",
    ]);
    expect(g.find((x) => x.key === "__none")!.items.map((t) => t.id)).toEqual([
      "c",
    ]);
  });

  it("agrupa por campo customizado (select) incluindo 'sem valor'", () => {
    const ftasks = [
      task({ id: "a", customFields: { colecao: "Inverno" } }),
      task({ id: "b", customFields: { colecao: "Verão" } }),
      task({ id: "c", customFields: {} }),
    ];
    const g = buildGroups(ftasks, "field:colecao", {
      fields: [
        {
          id: "colecao",
          name: "Coleção",
          type: "select" as const,
          options: ["Inverno", "Verão"],
        },
      ],
    });
    expect(g.find((x) => x.key === "Inverno")!.items.map((t) => t.id)).toEqual([
      "a",
    ]);
    expect(g.find((x) => x.key === "__none")!.items.map((t) => t.id)).toEqual([
      "c",
    ]);
  });

  it("agrupa por prazo em baldes relativos a hoje", () => {
    const today = "2026-06-10";
    const dtasks = [
      task({ id: "atr", dueDate: "2026-06-01" }),
      task({ id: "hoje", dueDate: "2026-06-10" }),
      task({ id: "sem" }),
      task({ id: "mes", dueDate: "2026-06-25" }),
    ];
    const g = buildGroups(dtasks, "due", { today });
    const byKey = (k: string) =>
      g.find((x) => x.key === k)!.items.map((t) => t.id);
    expect(byKey("overdue")).toEqual(["atr"]);
    expect(byKey("today")).toEqual(["hoje"]);
    expect(byKey("month")).toEqual(["mes"]);
    expect(byKey("nodate")).toEqual(["sem"]);
  });
});

describe("buildWorkload", () => {
  const people = [
    { id: "ana", name: "Ana" },
    { id: "bruno", name: "Bruno" },
  ];
  const today = "2026-06-10";

  it("agrega por responsável: total, status, atrasadas e prioridade (abertas)", () => {
    const ts = [
      task({ assigneeId: "ana", status: "todo", priority: "urgent", dueDate: "2026-06-01" }), // atrasada
      task({ assigneeId: "ana", status: "doing", priority: "high" }),
      task({ assigneeId: "ana", status: "done", priority: "low", dueDate: "2026-06-01" }), // feita não conta atraso/prio
    ];
    const [ana] = buildWorkload(ts, people, today);
    expect(ana.name).toBe("Ana");
    expect(ana.total).toBe(3);
    expect(ana.todo).toBe(1);
    expect(ana.doing).toBe(1);
    expect(ana.done).toBe(1);
    expect(ana.overdue).toBe(1);
    expect(ana.byPriority.urgent).toBe(1);
    expect(ana.byPriority.high).toBe(1);
    expect(ana.byPriority.low).toBe(0); // a low é feita, não entra
  });

  it("inclui 'Sem responsável' e ordena por abertas desc", () => {
    const ts = [
      task({ assigneeId: "ana", status: "todo" }),
      task({ assigneeId: "bruno", status: "todo" }),
      task({ assigneeId: "bruno", status: "doing" }),
      task({ status: "todo" }), // sem responsável
    ];
    const rows = buildWorkload(ts, people, today);
    // Bruno (2 abertas) antes de Ana e do "Sem responsável" (1 cada).
    expect(rows[0].name).toBe("Bruno");
    expect(rows.some((r) => r.assigneeId === null && r.name === "Sem responsável")).toBe(true);
  });
});

describe("buildTimeline", () => {
  it("separa tarefas sem prazo e marca atrasadas", () => {
    const today = "2026-06-10";
    const ts = [
      task({ id: "atr", dueDate: "2026-06-01", status: "todo" }),
      task({ id: "fut", dueDate: "2026-06-20", status: "todo" }),
      task({ id: "feita", dueDate: "2026-06-01", status: "done" }),
      task({ id: "sem" }),
    ];
    const tl = buildTimeline(ts, today);
    expect(tl.noDate.map((t) => t.id)).toEqual(["sem"]);
    expect(tl.bars.map((b) => b.task.id)).toEqual(["atr", "feita", "fut"]); // ordenadas por prazo
    expect(tl.bars.find((b) => b.task.id === "atr")!.overdue).toBe(true);
    expect(tl.bars.find((b) => b.task.id === "feita")!.overdue).toBe(false); // feita não atrasa
  });

  it("posiciona o prazo mais cedo à esquerda do mais tarde", () => {
    const tl = buildTimeline(
      [
        task({ id: "cedo", dueDate: "2026-06-05" }),
        task({ id: "tarde", dueDate: "2026-06-25" }),
      ],
      "2026-06-10",
    );
    const cedo = tl.bars.find((b) => b.task.id === "cedo")!;
    const tarde = tl.bars.find((b) => b.task.id === "tarde")!;
    expect(cedo.leftPct).toBeLessThan(tarde.leftPct);
    expect(tl.todayPct).toBeGreaterThan(0);
    expect(tl.todayPct).toBeLessThan(100);
    expect(tl.months.length).toBeGreaterThan(0);
  });

  it("sem nenhuma tarefa com prazo, devolve só noDate", () => {
    const tl = buildTimeline([task({ id: "a" }), task({ id: "b" })], "2026-06-10");
    expect(tl.bars).toEqual([]);
    expect(tl.noDate.map((t) => t.id)).toEqual(["a", "b"]);
  });
});
