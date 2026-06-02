import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Auditoria de acessibilidade automatizada (axe-core) nas superfícies-chave,
 * WCAG 2.0/2.1 níveis A e AA. Falha o build se surgir violação.
 */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test("a11y: lista de tarefas (Farm) sem violações WCAG A/AA", async ({
  page,
}) => {
  await page.goto("/tasks", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Tarefas" })).toBeVisible();
  const { violations } = await new AxeBuilder({ page })
    .withTags(TAGS)
    .analyze();
  expect(violations).toEqual([]);
});

test("a11y: tema escuro sem violações", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("mosaico-theme", "dark"));
  await page.goto("/tasks", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const { violations } = await new AxeBuilder({ page })
    .withTags(TAGS)
    .analyze();
  expect(violations).toEqual([]);
});

test("a11y: detalhe expandido (descrição/labels/checklist) sem violações", async ({
  page,
}) => {
  await page.goto("/tasks", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Expandir detalhes" }).first().click();
  await expect(page.getByText("Descrição")).toBeVisible();
  // Espera a animação de entrada (anim-fade ~120ms) terminar — opacity < 1
  // durante o fade reduz o contraste efetivo e dá falso positivo no axe.
  await page.waitForTimeout(300);
  const { violations } = await new AxeBuilder({ page })
    .withTags(TAGS)
    .analyze();
  expect(violations).toEqual([]);
});
