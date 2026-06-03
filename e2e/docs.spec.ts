import { test, expect } from "@playwright/test";

/**
 * Fluxos ponta-a-ponta da base de conhecimento (documentos por marca), no
 * navegador real, sobre o mock em memória. Os que criam usam estado próprio.
 */

test("lista o doc semente da marca Farm", async ({ page }) => {
  await page.goto("/docs?brand=farm", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Base de conhecimento" }),
  ).toBeVisible();
  await expect(page.getByText("Guideline de marca — inverno")).toBeVisible();
});

test("cria um documento, edita o título e ele aparece na lista", async ({
  page,
}) => {
  await page.goto("/docs?brand=animale", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Novo documento" }).click();

  // Abre o editor do doc recém-criado (seleção via ?doc= na URL).
  await expect(page).toHaveURL(/doc=/);
  const title = `Doc e2e ${Date.now()}`;
  const input = page.getByRole("textbox", { name: "Título do documento" });
  await input.fill(title);
  await input.blur();

  // Volta para a lista e encontra o título salvo.
  await page.getByRole("button", { name: "Documentos" }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});

test("escreve no corpo do documento com o editor de blocos", async ({
  page,
}) => {
  await page.goto("/docs?brand=farm", { waitUntil: "networkidle" });
  await page.getByText("Guideline de marca — inverno").click();
  const blocks = page.getByRole("textbox", { name: "Bloco de conteúdo" });
  await expect(blocks.first()).toBeVisible();
  await blocks.last().click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Linha nova do guideline");
  await expect(
    page.getByText("Linha nova do guideline", { exact: false }),
  ).toBeVisible();
});

test("navega para docs pela sidebar mantendo a marca ativa", async ({
  page,
}) => {
  await page.goto("/tasks?brand=animale", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Base de conhecimento" }).click();
  await expect(page).toHaveURL(/\/docs\?brand=animale/);
  await expect(
    page.getByRole("heading", { name: "Base de conhecimento" }),
  ).toBeVisible();
});

test("minhas notas: lista a nota semente e cria uma nova", async ({ page }) => {
  await page.goto("/notes", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Minhas notas" }),
  ).toBeVisible();
  await expect(page.getByText("Minhas anotações da semana")).toBeVisible();

  await page.getByRole("button", { name: "Nova nota" }).click();
  await expect(page).toHaveURL(/\/notes\?doc=/);
  const title = `Nota e2e ${Date.now()}`;
  const input = page.getByRole("textbox", { name: "Título do documento" });
  await input.fill(title);
  await input.blur();
  await page.getByRole("button", { name: "Notas" }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});
