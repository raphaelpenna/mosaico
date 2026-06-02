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
  await page.goto("/tasks", { waitUntil: "networkidle" });
  // No desktop a navegação de marca é pela sidebar (links reais, sem corrida
  // de hidratação).
  await page.getByRole("link", { name: "Animale" }).click();
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
  // Há um ThemeToggle na sidebar (desktop) e outro no top bar mobile; usa o 1º.
  await page.getByRole("button", { name: /Tema:/ }).first().click();
  await page.getByRole("option", { name: optionName }).click();
  await expect(html).toHaveAttribute("data-theme", next);
});

test("'Minhas tarefas' mostra só as atribuídas ao usuário, entre marcas", async ({
  page,
}) => {
  await page.goto("/tasks?brand=mine", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Minhas tarefas" }),
  ).toBeVisible();
  // seed atribuída a u-stub aparece; uma de outra pessoa (ana) não.
  await expect(
    page.getByText("Planejar reposição da loja flagship — inverno"),
  ).toBeVisible();
  await expect(page.getByText("Briefing da campanha de inverno")).toHaveCount(
    0,
  );
});

test("filtros persistem na URL e sobrevivem ao reload", async ({ page }) => {
  await page.goto("/tasks?brand=farm", { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Buscar tarefas" }).fill("briefing");
  await expect(page).toHaveURL(/q=briefing/);
  await page.reload({ waitUntil: "networkidle" });
  await expect(
    page.getByRole("textbox", { name: "Buscar tarefas" }),
  ).toHaveValue("briefing");
  await expect(
    page.getByText("Revisar mix de produto da nova coleção"),
  ).toHaveCount(0);
});

test("painel de detalhe abre (propriedades) e fecha no Esc", async ({
  page,
}) => {
  await page.goto("/tasks?brand=farm", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Abrir detalhes" }).first().click();
  const panel = page.getByRole("dialog");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Prioridade")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("agrupar por label cria grupos por label", async ({ page }) => {
  await page.goto("/tasks?brand=farm", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page
    .getByRole("combobox", { name: "Agrupar por" })
    .selectOption("label");
  await expect(page.getByRole("heading", { name: "Produto" })).toBeVisible();
});

test("comentário: adicionar no painel e ver com @menção", async ({ page }) => {
  await page.goto("/tasks?brand=farm", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Abrir detalhes" }).first().click();
  const panel = page.getByRole("dialog");
  const text = `Revisar com @ana ${Date.now()}`;
  await panel.getByRole("textbox", { name: "Novo comentário" }).fill(text);
  await panel.getByRole("button", { name: "Comentar" }).click();
  await expect(panel.getByText(/Revisar com/)).toBeVisible();
  await expect(panel.getByText("@Ana")).toBeVisible();
});

test("visão Calendário renderiza a grade do mês", async ({ page }) => {
  await page.goto("/tasks?brand=farm", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Calendário" }).click();
  await expect(page.getByText("Dom", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hoje" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Próximo mês" })).toBeVisible();
});

test("visão Tabela mostra colunas, incluindo campo customizado", async ({
  page,
}) => {
  await page.goto("/tasks?brand=farm", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Tabela" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Tarefa" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Coleção" }),
  ).toBeVisible();
});

test("campo customizado: definir 'Coleção' no painel da tarefa", async ({
  page,
}) => {
  await page.goto("/tasks?brand=farm", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Abrir detalhes" }).first().click();
  const panel = page.getByRole("dialog");
  await expect(panel.getByText("Coleção")).toBeVisible();
  await panel.getByRole("button", { name: "Coleção" }).click();
  await page.getByRole("option", { name: "Inverno" }).click();
  await expect(panel.getByRole("button", { name: "Coleção" })).toContainText(
    "Inverno",
  );
});

test("admin: cria uma marca e ela aparece no catálogo", async ({ page }) => {
  await page.goto("/admin", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
  const name = `Marca ${Date.now()}`;
  await page.getByRole("textbox", { name: "Nome da nova marca" }).fill(name);
  await page.getByRole("button", { name: "Adicionar marca" }).click();
  await expect(page.getByLabel(`Nome da marca ${name}`)).toHaveValue(name);
});

test("editor de blocos: '# ' vira título e Enter cria novo bloco", async ({
  page,
}) => {
  await page.goto("/tasks?brand=farm", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Abrir detalhes" }).first().click();
  const panel = page.getByRole("dialog");
  const blocks = panel.getByRole("textbox", { name: "Bloco de conteúdo" });
  await blocks.first().click();
  await blocks.first().pressSequentially("# Plano de inverno");
  await expect(blocks.first()).toHaveValue("Plano de inverno");
  await page.keyboard.press("Enter");
  await expect(blocks).toHaveCount(2);
});

test("Kanban: arrastar um card para outra coluna muda o status", async ({
  page,
}) => {
  await page.goto("/tasks?brand=farm", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Quadro" }).click();
  const title = "Revisar mix de produto da nova coleção"; // começa em "A fazer"
  await expect(page.getByText(title)).toBeVisible();

  // DnD nativo do HTML5 não é dirigido de forma confiável pelo dragTo do
  // Playwright — disparamos os eventos com um DataTransfer compartilhado, que é
  // exatamente o que o navegador faz. Alvo: a coluna "Feito" (data-status).
  await page.evaluate((cardTitle) => {
    const source = [
      ...document.querySelectorAll<HTMLElement>('li[draggable="true"]'),
    ].find((li) => li.textContent?.includes(cardTitle));
    const target = document.querySelector<HTMLElement>('[data-status="done"]');
    if (!source || !target) throw new Error("DnD: source/target não achados");
    const dt = new DataTransfer();
    const fire = (el: HTMLElement, type: string) =>
      el.dispatchEvent(
        new DragEvent(type, { bubbles: true, dataTransfer: dt }),
      );
    fire(source, "dragstart");
    fire(target, "dragover");
    fire(target, "drop");
    fire(source, "dragend");
  }, title);

  // Após o drop na coluna "Feito", o título fica com line-through (status done).
  await expect(page.getByText(title)).toHaveCSS(
    "text-decoration-line",
    "line-through",
  );
});
