import { test, expect } from "@playwright/test";

/**
 * Fluxos ponta-a-ponta da superfície de tarefas, no navegador real. Testes
 * em série sobre o mock em memória (ver playwright.config). Os que mutam usam
 * títulos únicos para não depender do estado dos outros.
 */

test("carrega e mostra a marca padrão (Farm) com as tarefas semeadas", async ({
  page,
}) => {
  await page.goto("/tasks");
  await expect(page.getByRole("heading", { name: "Tarefas" })).toBeVisible();
  await expect(page.getByText("Trabalho da marca Farm.")).toBeVisible();
  await expect(page.getByText("Briefing da campanha de inverno")).toBeVisible();
});

test("quick-add cria tarefa com o título limpo dos tokens", async ({
  page,
}) => {
  await page.goto("/tasks");
  const title = `Tarefa e2e ${Date.now()}`;
  const input = page.getByPlaceholder(/Adicionar tarefa/);
  await input.fill(`${title} !urgente @ana #campanha`);
  await input.press("Enter");
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});

test("busca filtra a lista", async ({ page }) => {
  await page.goto("/tasks");
  await page.getByRole("textbox", { name: "Buscar tarefas" }).fill("briefing");
  await expect(page.getByText("Briefing da campanha de inverno")).toBeVisible();
  await expect(
    page.getByText("Revisar mix de produto da nova coleção"),
  ).toHaveCount(0);
});

test("trocar de marca muda o contexto", async ({ page }) => {
  await page.goto("/tasks");
  await page
    .getByRole("combobox", { name: "Marca ativa" })
    .selectOption("animale");
  await expect(page.getByText("Trabalho da marca Animale.")).toBeVisible();
});

test("⌘K abre a command palette e navega para uma marca", async ({ page }) => {
  await page.goto("/tasks", { waitUntil: "networkidle" });
  // Garante hidratação: o listener global de ⌘K só existe após montar no client.
  await expect(page.getByRole("heading", { name: "Tarefas" })).toBeVisible();
  await page.waitForTimeout(500);
  await page.keyboard.press("ControlOrMeta+k");
  await expect(page.getByRole("dialog", { name: "Comandos" })).toBeVisible();
  await page.getByPlaceholder("Digite um comando…").fill("Animale");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Trabalho da marca Animale.")).toBeVisible();
});

test("alternar tema muda o data-theme do <html>", async ({ page }) => {
  await page.goto("/tasks");
  const html = page.locator("html");
  const before = await html.getAttribute("data-theme");
  const next = before === "dark" ? "light" : "dark";
  const optionName = next === "dark" ? "Escuro" : "Claro";
  await page.getByRole("button", { name: /Tema:/ }).click();
  await page.getByRole("option", { name: optionName }).click();
  await expect(html).toHaveAttribute("data-theme", next);
});
