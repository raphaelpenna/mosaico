// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskTitle } from "./TaskTitle";
import { TaskBoardProvider, type TaskBoardCtx } from "./task-board-context";

function renderTitle() {
  const mutate = vi.fn();
  const ctx: TaskBoardCtx = {
    today: "2026-06-01",
    labels: [],
    mutate,
    remove: vi.fn(),
    selected: new Set(),
    toggleSelect: vi.fn(),
    selecting: false,
    openId: null,
    openTask: vi.fn(),
    closeTask: vi.fn(),
  };
  render(
    <TaskBoardProvider value={ctx}>
      <TaskTitle id="t1" title="Antigo" done={false} />
    </TaskBoardProvider>,
  );
  return { mutate, user: userEvent.setup() };
}

describe("TaskTitle (edição inline)", () => {
  it("entra em edição no clique e salva com Enter (mutate com novo título)", async () => {
    const { mutate, user } = renderTitle();
    await user.click(screen.getByRole("button", { name: "Antigo" }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Novo{Enter}");
    expect(mutate).toHaveBeenCalledWith("t1", { title: "Novo" });
  });

  it("Escape cancela sem salvar", async () => {
    const { mutate, user } = renderTitle();
    await user.click(screen.getByRole("button", { name: "Antigo" }));
    await user.type(screen.getByRole("textbox"), "lixo{Escape}");
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Antigo" })).toBeInTheDocument();
  });

  it("título inalterado não salva", async () => {
    const { mutate, user } = renderTitle();
    await user.click(screen.getByRole("button", { name: "Antigo" }));
    await user.keyboard("{Enter}");
    expect(mutate).not.toHaveBeenCalled();
  });
});
