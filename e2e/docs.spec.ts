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

test("backlink: doc mostra a tarefa que o vincula e o deep-link abre o painel", async ({
  page,
}) => {
  await page.goto("/docs?brand=farm", { waitUntil: "networkidle" });
  await page.getByText("Guideline de marca — inverno").click();
  // A tarefa flagship é semeada vinculada a este doc.
  await expect(page.getByText("Mencionado em")).toBeVisible();
  const link = page.getByRole("link", {
    name: /Planejar reposição da loja flagship/,
  });
  await expect(link).toBeVisible();
  await link.click();
  // Deep-link abre o painel da tarefa apontada.
  await expect(page).toHaveURL(/\/tasks\?brand=farm&task=/);
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("wiki: documentos relacionados e 'Mencionado em' bidirecional", async ({
  page,
}) => {
  await page.goto("/docs?brand=farm", { waitUntil: "networkidle" });
  await page.getByText("Guideline de marca — inverno").click();
  // Relação semeada: guideline → calendário.
  await expect(page.getByText("Documentos relacionados")).toBeVisible();
  const relChip = page
    .getByRole("button", { name: /Calendário de coleções 2026/ })
    .first();
  await expect(relChip).toBeVisible();
  await relChip.click();
  // Agora no calendário: mencionado pelo guideline (lado inverso).
  await expect(page.getByText("Mencionado em")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Guideline de marca/ }),
  ).toBeVisible();
});

test("vincula um documento à tarefa pelo painel (chip aparece)", async ({
  page,
}) => {
  await page.goto("/tasks?brand=farm", { waitUntil: "networkidle" });
  // Tarefa nova (título único) garante o picker cheio em qualquer reexecução
  // — o mock é compartilhado entre runs.
  const title = `Link doc e2e ${Date.now()}`;
  const input = page.getByPlaceholder(/Adicionar tarefa/);
  await input.fill(title);
  await input.press("Enter");
  const row = page.locator("li", { hasText: title }).first();
  await row.getByRole("button", { name: "Abrir detalhes" }).click();
  const panel = page.getByRole("dialog");
  await expect(panel.getByText("Documentos")).toBeVisible();
  await panel.getByRole("button", { name: "Vincular documento" }).click();
  await page
    .getByRole("option", { name: /Calendário de coleções 2026/ })
    .click();
  // Um chip-link para o doc vinculado aparece no painel.
  await expect(
    panel.getByRole("link", { name: /Calendário de coleções 2026/ }),
  ).toBeVisible();
});

test("busca filtra a lista de documentos", async ({ page }) => {
  await page.goto("/docs?brand=farm", { waitUntil: "networkidle" });
  await page
    .getByRole("textbox", { name: "Buscar documentos" })
    .fill("calendário");
  await expect(page.getByText("Calendário de coleções 2026")).toBeVisible();
  await expect(page.getByText("Guideline de marca — inverno")).toHaveCount(0);
  await page.getByRole("button", { name: "Limpar busca" }).click();
  await expect(page.getByText("Guideline de marca — inverno")).toBeVisible();
});

test("fixar um documento alterna o estado (round-trip no servidor)", async ({
  page,
}) => {
  await page.goto("/docs?brand=farm", { waitUntil: "networkidle" });
  // Doc novo (título único) — idempotente entre reexecuções.
  await page.getByRole("button", { name: "Novo documento" }).click();
  const title = `Org e2e ${Date.now()}`;
  const input = page.getByRole("textbox", { name: "Título do documento" });
  await input.fill(title);
  await input.blur();
  await page.getByRole("button", { name: "Documentos" }).click();

  const card = page.locator("li", { hasText: title }).first();
  await card.hover();
  await card.getByRole("button", { name: `Fixar ${title}` }).click();
  await expect(
    page.getByRole("button", { name: `Desafixar ${title}` }),
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
