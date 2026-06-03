import { describe, it, expect } from "vitest";
import type { Subtask, Task } from "@/types";
import { evalFormula } from "./formula";

function task(over: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "T",
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
const sub = (done: boolean): Subtask => ({ id: "s", title: "x", done });

describe("evalFormula", () => {
  const today = "2026-06-10";

  it("daysUntilDue: futuro, hoje, passado e sem prazo", () => {
    expect(evalFormula("daysUntilDue", task({ dueDate: "2026-06-15" }), today)).toBe("em 5d"); // prettier-ignore
    expect(evalFormula("daysUntilDue", task({ dueDate: "2026-06-10" }), today)).toBe("hoje"); // prettier-ignore
    expect(evalFormula("daysUntilDue", task({ dueDate: "2026-06-07" }), today)).toBe("3d atrás"); // prettier-ignore
    expect(evalFormula("daysUntilDue", task(), today)).toBe("");
  });

  it("subtaskProgress / subtaskPercent (rollup do checklist)", () => {
    const t = task({ subtasks: [sub(true), sub(true), sub(false), sub(false)] });
    expect(evalFormula("subtaskProgress", t, today)).toBe("2/4");
    expect(evalFormula("subtaskPercent", t, today)).toBe("50%");
    // sem subtarefas → vazio
    expect(evalFormula("subtaskProgress", task(), today)).toBe("");
    expect(evalFormula("subtaskPercent", task(), today)).toBe("");
  });

  it("contagens: comentários, docs vinculados, blocos", () => {
    const t = task({
      comments: [
        { id: "c1", authorId: "a", text: "x", createdAt: "2026-01-01" },
      ],
      linkedDocIds: ["d1", "d2"],
      blocks: [{ id: "b", type: "paragraph", text: "x" }],
    });
    expect(evalFormula("commentCount", t, today)).toBe("1");
    expect(evalFormula("linkedDocCount", t, today)).toBe("2");
    expect(evalFormula("blockCount", t, today)).toBe("1");
  });
});
