# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Camada custom (Next.js 16 / App Router / Vercel) do **Mosaico**, o substituto
in-house de Notion + ClickUp do Grupo Azzas. **Não é BI.** Os núcleos de
produtividade (docs/notas/projetos) virão de OSS self-hosted (AppFlowy/Plane);
este repo constrói **só o diferencial**: trazer dados da Azzas para dentro do
contexto do trabalho. Milestone 1 = starter com **dados MOCK** (fictícios) e o
encaixe pronto para o MCP/BigQuery real.

## Comandos

- `pnpm dev` — sobe em http://localhost:3000 (`/` redireciona p/ `/tasks`).
- `pnpm test` — vitest (roda só `src/**/*.test.ts`, ambiente node).
- Um teste só: `pnpm vitest run src/lib/data/contract.test.ts` (ou `-t "nome"`).
- `pnpm typecheck` (tsc) · `pnpm lint` (eslint) · `pnpm build` (valida RSC/server-only).
- `pnpm format` / `pnpm format:check` (prettier).

Antes de commitar, espere `typecheck`, `lint`, `test` e `build` verdes.
pnpm vem via `corepack enable` (não está em `/usr/local/bin` global aqui).

## Arquitetura — dois ports + uma cola

A regra que organiza tudo: **a UI nunca fala com uma fonte de dados direta.**
Tudo passa por interfaces atrás de uma fronteira `server-only`. A estrutura
codifica a estratégia "comprar o commodity, construir o diferencial":

- **`DataSource`** (`src/lib/data`) — o **diferencial**: dado vivo da Azzas
  (apenas `resolveMetric`). `getDataSource()` (factory por `DATA_SOURCE`) escolhe
  `MockDataSource` (hoje) ou `MCPDataSource` (skeleton que lança
  `not implemented — milestone 2`). **Trocar mock→real é mudar este um arquivo.**
  `schema.ts` (Zod) é a fonte única da verdade do formato; toda saída é validada
  na borda.
- **`TaskSource`** (`src/lib/tasks`) — o **commodity**: tarefas. `getTaskSource()`
  por `TASK_SOURCE`; hoje `MockTaskSource` (store **em memória**, reseta no
  restart). No futuro um cliente Plane.
- **resolver de DataLink** (`src/lib/links/resolve.ts`) — **a cola que o Mosaico
  constrói** e o artefato durável: liga uma tarefa (host) a uma `MetricRef`,
  revalida o escopo e resolve o valor. Quando a tarefa virar objeto do Plane e o
  dado vier do MCP, esta função não muda.

Fluxo de uma request: `src/app/(work)/tasks/page.tsx` (Server Component) →
`getSession()` → escopo → `getTaskSource().listTasks()` + `resolveTaskData()` por
tarefa → passa itens **já resolvidos** para componentes de apresentação. Nenhuma
fonte toca o client. Mutações via server actions em `src/app/(work)/tasks/actions.ts`.

## Invariantes que NÃO podem quebrar

- **`server-only`**: `lib/data/index.ts`, `lib/tasks/index.ts`, `lib/links/resolve.ts`
  e `lib/auth/session.ts` importam `server-only`. Não os importe de Client
  Components — em client use `import type`. Em testes (node), importe as **classes
  concretas** (`./mock`), nunca os factories, senão `server-only` lança.
- **Escopo no servidor**: acesso por marca é validado contra a sessão no servidor
  (`lib/brands/scope.ts` — `assertBrandInScope`/`resolveScopedBrand`), nunca a
  partir de parâmetro do client. A marca ativa trafega em `?brand=` mas é
  re-resolvida contra o escopo no servidor.
- **Identidade de marca ≠ dado**: a lista de marcas vem da taxonomia estática
  (`lib/brands/taxonomy.ts`, nomes/`REDE_LOJAS` reais), **não** do `DataSource` —
  por isso a página não quebra quando a fonte ainda não está implementada.
- **Tudo MOCK e rotulado**: nenhum número real da Azzas; valores fictícios são
  marcados `// MOCK` e o tipo `MetricValue` tem `mock: true`. Banner "MOCK" na UI.
- **Segredos só em env**: `.env.example` tem só placeholders; `.env*` reais no
  `.gitignore` (exceto o próprio `.env.example`).

## Plugar o dado real (Milestone 2)

Implementar `MCPDataSource` em `src/lib/data/mcp.ts` (ver as duas opções
documentadas lá: cliente HTTP para os agentes MCP Azzas, recomendado, ou BigQuery
direto), empurrando o escopo **para dentro da query**, validando a saída com
`MetricValueSchema`, e adicionando `MCPDataSource` ao array do contract test
(`src/lib/data/contract.test.ts`). Depois `DATA_SOURCE=mcp` — nenhum componente muda.

## Auth

Stub em `src/lib/auth/session.ts` na **forma Auth.js + Microsoft Entra ID** (IdP
da Azzas); `getSession()` async devolve `user` + `scope`. Proteção de rota em
`src/proxy.ts` (convenção Proxy do Next 16 — substitui `middleware.ts`).
