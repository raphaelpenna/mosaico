# ROADMAP — Mosaico (camada custom Azzas)

Caminho de "esqueleto funcional" → **estado da arte** para o gerenciador de
tarefas escopado por marca. Mantém os invariantes do [CLAUDE.md](CLAUDE.md): a UI
nunca fala com fonte de dado direta (tudo atrás de `TaskSource` / `server-only`),
escopo validado no servidor, marca como identidade estática, dados MOCK rotulados
até a troca pelo backend real.

**Legenda:** ✅ feito · 🟡 parcial · ⬜ a fazer

---

## Norte do produto — PRD v1.0 (evolução "Notion-like")

A partir de 2026-06, o produto evolui de gerenciador de tarefas para **gestão de
trabalho escopada por marca** (cada marca = workspace), no estilo Notion. As
Fases 1–7 abaixo seguem como base; o PRD reorganiza o que falta em **P0/P1/P2**.

> ⚠️ **Mudança de invariante:** o Admin v1 (P0) torna **marcas/labels/campos/
> status editáveis** — supersede o invariante "marca é identidade estática". A
> taxonomia/labels migrarão de config no código para um store mutável (mock)
> quando o Admin for implementado. Confirmar antes de mexer.

**P0 — Fundação** (destrava a evolução; tudo verificável no mock)

- 🟡 **Layout desktop de 3 zonas** — ✅ sidebar esquerda recolhível (marcas + visões) + centro em largura total (`Sidebar`, top bar só no mobile); ⬜ painel direito contextual (detalhe da tarefa em split view) e largura de leitura p/ documentos.
- ⬜ **Tarefa como página** — editor de blocos (texto rico, títulos, checklists, toggles, tabela, imagens) + **propriedades tipadas** (seleção/multi, número, moeda, data início-fim, URL, pessoa, relação). Quick-add mantido.
- ⬜ **Admin v1** — CRUD de marcas/workspaces, labels, campos customizados, status e prioridades (exige store mutável — ver invariante acima).

**P1 — Paridade de uso** (Notion no dia a dia)

- ⬜ Visões **Calendário** e **Tabela**; estado por visão (parcial: filtros/visão já persistem na URL).
- 🟡 Agrupamentos — status/prioridade/responsável/marca ✅; ⬜ por label, por prazo (Hoje/Semana/Mês/Atrasadas), por campo customizado, **aninhado + swimlanes**.
- 🟡 **Subtarefas/checklists** (básico ✅; falta progresso pai-filho), ⬜ **comentários + @menções**, ⬜ **templates de tarefa**, ⬜ capa/ícone.
- ⬜ Admin v2 — usuários e atribuição a marcas; preferências padrão.

**P2 — Profundidade & diferenciação**

- ⬜ **Base de conhecimento por marca + Minhas notas** (mesmo editor de blocos, link bidirecional tarefa↔documento).
- ⬜ Visões **Timeline/Gantt**, **Galeria**, **Carga de trabalho**.
- ⬜ **Fórmulas, rollups e relações**.
- ⬜ Integrações: **Slack** + **dados Azzas/BigQuery**.

**Fora de escopo (PRD):** SSO/provisionamento, RBAC granular, auditoria/versões,
tempo real, export/backup, SLA.

---

## Fase 1 — Starter (✅ concluída)

Base da arquitetura e a primeira superfície de trabalho.

- ✅ Port `TaskSource` atrás de fronteira `server-only` (swap de um arquivo).
- ✅ Taxonomia de marca estática + helpers de escopo (`scope.ts`).
- ✅ Tarefa **escopada por marca de verdade** (`brandId`), filtrada e validada no servidor.
- ✅ Workflow de status (`a fazer → fazendo → feito`) via server actions, sem JS no client.
- ✅ Criar / mudar status / remover; agrupamento por status + contadores + barra de progresso.
- ✅ Sistema de design inicial: tokens semânticos, dark mode, app shell (top bar + seletor de marca + usuário).
- ✅ Testes de unidade do port e do escopo (14 passando); typecheck/lint/build verdes.

---

## Fase 2 — Tarefa completa (UX core) ✅

Fazer o gerenciador **parecer e funcionar como produto maduro** ainda sobre o
mock — derisca a UX antes de plugar backend real. É aqui que mora a maior parte
do valor percebido. **Concluída** (port refatorado para uma mutação única
`updateTask(patch)`; libs `people`/`labels`; estado otimista via `useOptimistic`).

- ✅ **Edição inline de título** (clicar para renomear).
- ✅ **Prioridade** (baixa/média/alta/urgente) com indicador colorido e ordenação dentro do grupo.
- ✅ **Prazo (due date)** com tom por urgência (atrasado / hoje / no prazo).
- ✅ **Responsável (assignee)** — catálogo mock (`lib/people`), avatar + seletor na linha.
- ✅ **Labels/tags** por tarefa — catálogo mock (`lib/labels`), chips na linha + editor no detalhe.
- ✅ **Descrição curta + checklist** de subtarefas — no painel de detalhe expansível.
- ✅ **Busca, filtros e ordenação** — busca por título; filtros por prioridade, responsável e label; **agrupar por** status/prioridade/responsável/marca; ordenação por prioridade+prazo. **Filtros/visão persistidos na URL** (`?q=&priority=&assignee=&label=&group=&view=`) via `history.replaceState` — links compartilháveis, sem re-render do servidor.
- ✅ **Visão Kanban** (colunas por status) com alternância Lista/Quadro e **drag-and-drop** (arrastar entre colunas muda o status; DnD nativo HTML5, sem deps).
- ✅ **Visão "Todas as marcas"** (`?brand=all`) e **"Minhas tarefas"** (`?brand=mine`, atribuídas ao usuário entre marcas) — consolidadas, agrupando por marca.
- ✅ **Optimistic UI** (`useOptimistic`) — toda mutação reflete na hora.
- ✅ **Desfazer (undo)** — toast com "desfazer" no remover (individual e em lote).
- ✅ **Ações em lote** (seleção múltipla: marcar feito, prioridade, responsável, remover).
- ✅ **Quick add** com parsing (`!prioridade`, `@responsável`, `#label`, `hoje`/`amanhã`/`dd/mm`).
- ✅ **Atalhos de teclado** + **command palette** (⌘K; `c` novo, `v` alterna visão).
- ✅ **Skeletons** de carregamento (`loading.tsx`). 🟡 paginação/virtualização para listas grandes fica para quando o backend real entrar.

---

## Fase 3 — Sistema de design maduro & identidade ⬜

Elevar de "tokens + shell" para um **design system com primitivos acessíveis** e
identidade própria do Mosaico.

- 🟡 **Primitivos reutilizáveis** — **construídos no repo, sem dependências** (não shadcn/Radix): `ui/SelectMenu` (listbox acessível), `ui/Dialog` (modal com armadilha de foco), `ui/Button` (variantes primary/ghost/outline/danger) e `ui/Badge` (chip tingível) — adotados em Priority/Assignee, ⌘K, AddTask, barra de lote e LabelChips. Faltam Input/Tooltip/Toast formalizados.
- ⬜ **Tokens completos**: escala tipográfica, spacing, radii, elevação/sombra, **motion** (durations/easing).
- ✅ **Toggle de tema** (claro/escuro/sistema) com persistência (`localStorage` via `useSyncExternalStore`), dark mode por `data-theme` e script anti-flash no `RootLayout`.
- ✅ **Acentos por marca**: cada marca tem cor de assinatura (`accent` na taxonomia) tingindo wordmark + avatar via `--brand-accent`.
- ⬜ **Ícones consistentes** (lucide-react) substituindo os SVGs inline.
- ✅ **Identidade**: logomark de mosaico (azulejo inferior segue a marca ativa via `--brand-accent`), favicon (`app/icon.svg`) e OG image dinâmica (`app/opengraph-image.tsx` via `next/og`) + `metadataBase`.
- 🟡 **Microinterações** — entradas suaves (fade/pop/slide-up) em menus, dialog, toast, barra de lote e detalhe + **`prefers-reduced-motion`** respeitado globalmente. Falta View Transitions API entre rotas.
- ✅ **Responsivido / mobile** — linha da tarefa em **duas linhas no mobile** (título em cima, metadados embaixo) e uma linha no desktop; top bar e toolbar adaptam (wrap). Resta refino fino de formulários se necessário.
- ⬜ **Densidade** configurável (compacto/confortável).
- ⬜ **Storybook** / catálogo de componentes (DX + revisão visual).

---

## Fase 4 — Auth real + RBAC ⬜

Trocar o stub pela forma real **sem tocar nos callers** (a forma de `getSession()`
já é a do alvo).

- ⬜ **Auth.js (NextAuth)** com provider **Microsoft Entra ID** (IdP da Azzas) — substitui o corpo de `lib/auth/session.ts`.
- ⬜ Sessão real (cookies + JWT/DB session), refresh de token.
- ⬜ **Proteção de rota real** em `src/proxy.ts` (redirect para login do não-autenticado).
- ⬜ **RBAC real**: app roles do Entra → `viewer/editor/admin`, com enforcement nas server actions (não só na UI).
- ⬜ **Escopo de marca por claims/grupos** do Entra (hoje `allowedBrandIds` é hardcoded no stub).
- ⬜ **Auditoria** de ações (quem fez o quê, quando).
- ⬜ Headers de segurança (CSP, etc.) e revisão de CSRF nas actions; rate limiting (Vercel Firewall/WAF).

---

## Fase 5 — Persistência real (port → Plane) ⬜

Trocar o `MockTaskSource` em memória pelo backend OSS real — **mudança de um
arquivo** (`lib/tasks/index.ts`), UI intacta.

- ⬜ **`PlaneTaskSource implements TaskSource`** selecionado por `TASK_SOURCE`.
- ⬜ Mapear o domínio (tarefa, status, prioridade, prazo, assignee, `brandId`) pro modelo do Plane (issues/projects).
- ⬜ **Marca → workspace/projeto** do Plane (formalizar a relação).
- ⬜ **Erro/retry/timeout** no client do backend; estados de erro na UI.
- ⬜ **Cache por tag** (Next `use cache` / `cacheTag` / `cacheLife`) e invalidação granular em vez de `revalidatePath` amplo.
- ⬜ **Sync/webhooks** do Plane para refletir mudanças externas.
- ⬜ Estratégia de migração/seed e ambiente de staging.

---

## Fase 6 — Colaboração & tempo real ⬜

De single-user para uso de time.

- ⬜ **Multi-usuário**: atribuição real, "minhas tarefas", presença.
- ⬜ **Comentários** e **feed de atividade** por tarefa.
- ⬜ **Tempo real** (atualizações ao vivo — websockets/SSE ou via Plane).
- ⬜ **Notificações** (in-app + e-mail/Teams) para atribuição, prazo, menção.
- ⬜ **Menções** (@) e integração leve com o ecossistema Azzas.

---

## Fase 7 — Produção-grade (cross-cutting) ⬜

Transversal a todas as fases; é o que separa "funciona" de "estado da arte".

- ✅ **Acessibilidade AA**: **axe-core automatizado** (`e2e/a11y.spec.ts`: lista, tema escuro e detalhe expandido — **zero violações WCAG 2.0/2.1 A/AA**, no job `e2e` do CI). Primitivos com teclado/ARIA (listbox no `SelectMenu` + `aria-controls`, armadilha de foco no `Dialog`, toast `role=status`), `prefers-reduced-motion`, e **contraste corrigido** (`--faint` → ~4.7:1; chips/labels com texto neutro + ponto colorido; tons de prazo e `danger` com tokens AA `--due-*`/`--danger`; avatares escurecidos).
- ⬜ **i18n**: centralizar strings (next-intl), formatação de data/número por locale — hoje pt-BR cravado na UI.
- ✅ **Testes**: **lógica pura** (`board`, `quickadd`, `mock`/escopo) + **componente** (RTL + jsdom: `SelectMenu`, `Dialog`, `TaskTitle`, `TaskBoard`) — **52 testes** — + **e2e Playwright/Chromium** (`e2e/tasks.spec.ts`): carregar, quick-add, busca, troca de marca, ⌘K e toggle de tema. 🟡 resta cobertura de `axe`.
- 🟡 **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`) — job `verify` (typecheck · lint · test · build) + job `e2e` (Playwright/Chromium) em PR/push. Faltam **preview por PR** na Vercel e **rolling releases**.
- ⬜ **Observabilidade**: error tracking (Sentry), **Web Vitals/Speed Insights**, analytics de produto.
- ⬜ **Performance**: PPR/Cache Components, budget de bundle, lazy-load, Lighthouse CI.
- ⬜ **Feature flags** (Vercel Flags) para rollout gradual.
- ⬜ **Docs/DX**: ADRs das decisões grandes (Entra, Plane), README/onboarding atualizados.

---

## Definição de "estado da arte" (checklist de saída)

- [ ] Tarefa com prioridade, prazo, responsável, labels e múltiplas visões (Lista/Kanban/Todas as marcas).
- [ ] Interações instantâneas (optimistic), com undo e atalhos de teclado.
- [ ] Design system com primitivos acessíveis, tema claro/escuro e identidade própria.
- [ ] Auth Entra ID real + RBAC com enforcement no servidor.
- [ ] Backend real (Plane) atrás do port, com cache granular e tratamento de erro.
- [ ] AA de acessibilidade, i18n, e2e verde, CI/CD com preview e observabilidade.

---

### Próximo passo recomendado

Fases 1 e 2 concluídas. Seguir para a **Fase 3** (sistema de design maduro:
primitivos acessíveis via shadcn/Radix, tokens completos, tema claro/escuro,
mobile) — ainda 100% sobre o mock — ou pular para a **Fase 4** (auth Entra ID)
quando a base de UI estiver estável.
