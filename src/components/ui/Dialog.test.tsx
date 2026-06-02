// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("renderiza com role dialog e foca o primeiro focável ao abrir", () => {
    render(
      <Dialog open onClose={vi.fn()} ariaLabel="Teste">
        <button>Dentro</button>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dentro" })).toHaveFocus();
  });

  it("Escape chama onClose", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog open onClose={onClose} ariaLabel="Teste">
        <button>Dentro</button>
      </Dialog>,
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("não renderiza nada quando fechado", () => {
    render(
      <Dialog open={false} onClose={vi.fn()} ariaLabel="Teste">
        <button>Dentro</button>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
