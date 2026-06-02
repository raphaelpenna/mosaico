# Mosaico — Camada de Integração Azzas

Camada custom (Next.js + Vercel) do **Mosaico**, o substituto in-house de
Notion + ClickUp do Grupo Azzas. O Mosaico **não é BI**: é gestão de projetos,
notas e second brain. Os núcleos de produtividade vêm de **OSS self-hosted**
(AppFlowy/Plane); este repositório constrói **só o diferencial** — trazer os
dados da Azzas (vendas, CRM, mídia) **para dentro do contexto do trabalho**.

> ⚠️ **Milestone 1 — starter.** Todos os números são **fictícios (MOCK)**.
> Nenhuma credencial, PII ou dado real da Azzas. O encaixe para o MCP/BigQuery
> real está pronto e documentado abaixo.

## O que tem aqui

Uma **fatia fina de produtividade**: uma lista de **tarefas** (estilo ClickUp)
onde cada tarefa pode ser **vinculada a uma marca + métrica**, e o dado aparece
no card — provando o conceito "dado no contexto do trabalho".

## Setup

Pré-requisitos: Node 20+, **pnpm** (`corepack enable` ativa).

```bash
pnpm install
cp .env.example .env.local   # placeholders; nada obrigatório no milestone 1
pnpm dev                     # http://localhost:3000  (redireciona p/ /tasks)
```

Scripts: `pnpm test` · `pnpm typecheck` · `pnpm lint` · `pnpm build` ·
`pnpm format`.

## Arquitetura — dois ports + uma cola

A estratégia do Mosaico ("comprar o commodity, construir o diferencial") está
codificada na arquitetura. A UI **nunca** fala com uma fonte de dados direta —
só com interfaces, atrás de uma fronteira `server-only`.

| Camada                   | Papel                         | Hoje             | Amanhã          | Onde                                                   |
| ------------------------ | ----------------------------- | ---------------- | --------------- | ------------------------------------------------------ |
| **`DataSource`**         | dado Azzas (**diferencial**)  | `MockDataSource` | `MCPDataSource` | [`src/lib/data`](src/lib/data)                         |
| **`TaskSource`**         | tarefas (**commodity**)       | `MockTaskSource` | cliente Plane   | [`src/lib/tasks`](src/lib/tasks)                       |
| **resolver de DataLink** | a cola que o Mosaico constrói | —                | (igual)         | [`src/lib/links/resolve.ts`](src/lib/links/resolve.ts) |

Regras de ouro:

- **Async-first + push-down.** Marca/escopo/período vão **para dentro** da
  consulta — nunca filtrados na UI. É isso que torna o swap viável.
- **`server-only`.** Os factories e o resolver importam `server-only`: nenhuma
  credencial futura entra no bundle do browser. Dados só em RSC/server actions.
- **Escopo no servidor.** O acesso por marca é validado contra a **sessão** no
  servidor, nunca a partir de parâmetro do client (ver [`src/lib/brands/scope.ts`](src/lib/brands/scope.ts)).
- **Validação na fronteira.** Toda saída passa pelos schemas Zod de
  [`src/lib/data/schema.ts`](src/lib/data/schema.ts) — a mesma garantia que o
  JSON real terá que satisfazer.

### Plugar o dado real (Milestone 2) — mudança de **um arquivo**

1. Implemente os métodos de [`src/lib/data/mcp.ts`](src/lib/data/mcp.ts)
   (`MCPDataSource`) — hoje eles lançam `not implemented — milestone 2`. Duas
   opções, ambas async e server-only:
   - **Cliente HTTP** para os agentes MCP Azzas já existentes (recomendado —
     reaproveita a infra, não reconstrói o acesso a BigQuery), via `MCP_BASE_URL`
     - token; **ou**
   - **BigQuery direto** (`@google-cloud/bigquery`) via `GOOGLE_SERVICE_ACCOUNT_JSON`,
     aplicando o escopo (`allowedBrandIds → REDE_LOJAS`) **na query**.
2. Defina `DATA_SOURCE=mcp` no `.env.local`. **Nenhum componente muda.**
3. O **contract test** ([`src/lib/data/contract.test.ts`](src/lib/data/contract.test.ts))
   já existe: adicione `MCPDataSource` ao array de implementações e ele garante
   conformidade com a interface + schemas.

### Prova do seam

Com `DATA_SOURCE=mcp`, os chips de dado mostram
`not implemented — milestone 2` (vindo do `MCPDataSource`) em vez de quebrar a
página — evidência de que a UI fala **só** pelo port.

## Auth & segurança

- Stub de sessão em [`src/lib/auth/session.ts`](src/lib/auth/session.ts) na
  **forma Auth.js + Microsoft Entra ID** (o IdP que a Azzas usa). Trocar o corpo
  por `auth()` do NextAuth não muda nenhum caller.
- Proteção de rota em [`src/proxy.ts`](src/proxy.ts) (convenção Proxy do Next 16).
- Segredos **sempre** em variáveis de ambiente (local e Vercel), nunca no código.
  `.env.example` só tem placeholders; `.env*` reais estão no `.gitignore`.

## Taxonomia de marca

[`src/lib/brands/taxonomy.ts`](src/lib/brands/taxonomy.ts) usa os **nomes e
códigos `REDE_LOJAS` reais** do Grupo Azzas (Farm=2, Animale=1, …) para deixar o
encaixe realista — só os **valores numéricos** são fictícios. O agrupamento `bu`
é **provisório/não-canônico** (a taxonomia oficial de BU substitui depois).

## Deploy (Vercel a partir do GitHub) — passos manuais

> Não automatizado neste milestone. Para conectar:

1. Crie um repositório no GitHub e faça `git push` da branch `main`.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório
   (framework detectado: Next.js).
3. Configure as variáveis de ambiente do `.env.example` no projeto Vercel.
4. `main` → produção; cada PR gera **preview deploy** automático.
