// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Task } from "@/types";

// As server actions importam `server-only` (via getSession/getTaskSource), que
// não carrega fora do RSC — mockamos o módulo inteiro para testar só a UI.
vi.mock("@/app/(work)/tasks/actions", () => ({
  updateTaskAction: vi.fn(),
  deleteTaskAction: vi.fn(),
  recreateTaskAction: vi.fn(),
  bulkUpdateAction: vi.fn(),
  bulkDeleteAction: vi.fn(),
}));

// useSearchParams precisa do contexto do App Router (ausente fora do Next).
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

import { TaskBoard } from "./TaskBoard";

function task(over: Partial<Task>): Task {
  return {
    id: "t",
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

const tasks = [
  task({ id: "1", title: "Briefing de inverno" }),
  task({ id: "2", title: "Revisar mix de produto" }),
];

describe("TaskBoard", () => {
  it("renderiza as tarefas e a busca filtra a lista", async () => {
    const user = userEvent.setup();
    render(
      <TaskBoard
        tasks={tasks}
        today="2026-06-01"
        brands={[{ id: "farm", name: "Farm" }]}
      />,
    );

    expect(screen.getByText("Briefing de inverno")).toBeInTheDocument();
    expect(screen.getByText("Revisar mix de produto")).toBeInTheDocument();

    await user.type(
      screen.getByRole("textbox", { name: "Buscar tarefas" }),
      "briefing",
    );

    expect(screen.getByText("Briefing de inverno")).toBeInTheDocument();
    expect(
      screen.queryByText("Revisar mix de produto"),
    ).not.toBeInTheDocument();
  });

  it("estado vazio quando não há tarefas", () => {
    render(
      <TaskBoard
        tasks={[]}
        today="2026-06-01"
        brands={[{ id: "farm", name: "Farm" }]}
      />,
    );
    expect(screen.getByText("Nenhuma tarefa por aqui")).toBeInTheDocument();
  });
});
