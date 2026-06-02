// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectMenu } from "./SelectMenu";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

function setup(onChange = vi.fn()) {
  render(
    <SelectMenu
      ariaLabel="Escolha"
      value="a"
      onChange={onChange}
      options={options}
      trigger="Pick"
    />,
  );
  return { onChange, user: userEvent.setup() };
}

describe("SelectMenu", () => {
  it("abre no clique e lista as opções (role listbox/option)", async () => {
    const { user } = setup();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Escolha" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("seleciona no clique e fecha (onChange recebe o value)", async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole("button", { name: "Escolha" }));
    await user.click(screen.getByRole("option", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledWith("b");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("navega por teclado: ArrowDown abre, ↓ move, Enter seleciona", async () => {
    const { user, onChange } = setup();
    screen.getByRole("button", { name: "Escolha" }).focus();
    await user.keyboard("{ArrowDown}"); // abre (ativo = selecionado "a")
    await user.keyboard("{ArrowDown}{Enter}"); // move para "b" e seleciona
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("Escape fecha sem selecionar", async () => {
    const { user, onChange } = setup();
    await user.click(screen.getByRole("button", { name: "Escolha" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("marca a opção atual como selecionada (aria-selected)", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Escolha" }));
    expect(screen.getByRole("option", { name: "Alpha" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
