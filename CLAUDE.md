# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Camada custom (Next.js 16 / App Router / Vercel) do **Mosaico**, o substituto
in-house de Notion + ClickUp do Grupo Azzas. **Não é BI.** Os núcleos de
produtividade (docs/notas/projetos) virão de OSS self-hosted (AppFlowy/Plane);
este repo é um **gerenciador de tarefas escopado por marca**, com **dados MOCK**
(fictícios). **Não há conexão com bancos da Azzas nem MCP** — a taxonomia de
marca é config estática no código.

## Comandos

- `pnpm dev` — sobe em http://localhost:3000 (`/` redireciona p/ `/tasks`).
- `pnpm test` — vitest (`src/**/*.test.{ts,tsx}`). Padrão node; testes de
  componente (RTL) declaram `// @vitest-environment jsdom` no topo do arquivo.
- Um teste só: `pnpm vitest run src/lib/tasks/mock.test.ts` (ou `-t "nome"`).
- `pnpm test:e2e` — Playwright/Chromium (`e2e/*.spec.ts`); sobe o dev sozinho.
  Browsers: `pnpm exec playwright install chromium` (1ª vez).
- `pnpm typecheck` (tsc) · `pnpm lint` (eslint) · `pnpm build` (valida RSC/server-only).
- `pnpm format` / `pnpm format:check` (prettier).

Antes de commitar, espere `typecheck`, `lint`, `test` e `build` verdes.
pnpm vem via `corepack enable` (não está em `/usr/local/bin` global aqui).

## Arquitetura

A regra que organiza tudo: **a UI nunca fala com uma fonte de dados direta.**
Tudo passa por interfaces atrás de uma fronteira `server-only`.

- **`TaskSource`** (`src/lib/tasks`) — tarefas. `getTaskSource()` por
  `TASK_SOURCE`; hoje `MockTaskSource` (store **em memória**, reseta no restart).
  No futuro um cliente Plane. Trocar é mudança de um arquivo (`index.ts`), sem
  tocar na UI.
- **marcas** (`src/lib/brands`) — taxonomia estática (`taxonomy.ts`) + helpers de
  escopo de acesso (`scope.ts`). Só identidade de marca; nenhum número/dado vive
  aqui.

Fluxo de uma request: `src/app/(work)/tasks/page.tsx` (Server Component) →
`getSession()` → escopo → `getTaskSource().listTasks()` → componentes de
apresentação. Nenhuma fonte toca o client. Mutações via server actions em
`src/app/(work)/tasks/actions.ts`.

## Invariantes que NÃO podem quebrar

- **`server-only`**: `lib/tasks/index.ts` e `lib/auth/session.ts` importam
  `server-only`. Não os importe de Client Components — em client use
  `import type`. Em testes (node), importe as **classes concretas** (`./mock`),
  nunca os factories, senão `server-only` lança.
- **Escopo no servidor**: acesso por marca é validado contra a sessão no servidor
  (`lib/brands/scope.ts` — `assertBrandInScope`/`resolveScopedBrand`), nunca a
  partir de parâmetro do client. A marca ativa trafega em `?brand=` mas é
  re-resolvida contra o escopo no servidor.
- **Marca é catálogo mutável (Admin v1)**: a lista de marcas vive num store em
  memória (`lib/brands/store.ts`), semeado de `taxonomy.ts` e editável via Admin
  (CRUD por server actions, papel `admin`). Reseta no restart (mock, sem banco).
  Clients recebem as marcas por props do servidor — não importam o catálogo.
  _(Antes a marca era config estática; mudou no Admin v1.)_
- **Tudo MOCK e rotulado**: nenhum dado real da Azzas; tarefas semeadas são
  fictícias e marcadas `// MOCK`.
- **Segredos só em env**: `.env.example` tem só placeholders; `.env*` reais no
  `.gitignore` (exceto o próprio `.env.example`).

## Auth

Stub em `src/lib/auth/session.ts` na **forma Auth.js + Microsoft Entra ID** (IdP
da Azzas); `getSession()` async devolve `user` + `scope`. Proteção de rota em
`src/proxy.ts` (convenção Proxy do Next 16 — substitui `middleware.ts`).
