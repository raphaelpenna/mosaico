import "server-only";

import type { Session } from "@/types";
import { allBrandIds } from "@/lib/brands/store";

/**
 * STUB de autenticacao — na FORMA de um provider real.
 *
 * Hoje retorna uma sessao fixa. A forma (getSession() async, no servidor,
 * devolvendo user + escopo) e identica a do alvo: Auth.js (NextAuth) com
 * provider Microsoft Entra ID (Azure AD) — que e o IdP que a Azzas ja usa na
 * infra existente. Trocar este corpo por `auth()` do NextAuth nao muda nenhum
 * caller.
 *
 * Este stub e um ADMIN com acesso a todas as marcas (para o Admin v1 ser
 * usavel no demo). O isolamento por marca segue validado no servidor (scope) e
 * coberto por testes; um membro comum teria allowedBrandIds = subconjunto.
 */
export async function getSession(): Promise<Session> {
  // MOCK — usuario ficticio. Vira a identidade do Entra (claims do id_token).
  return {
    user: {
      id: "u-stub",
      name: "Colaborador Azzas",
      email: "colaborador@azzas.example",
    },
    scope: {
      userId: "u-stub",
      // Admin (stub): enxerga/gerencia TODAS as marcas do catálogo — assim
      // marcas criadas no Admin aparecem na hora. Um membro comum teria um
      // SUBCONJUNTO aqui (o isolamento por marca segue validado no servidor).
      allowedBrandIds: allBrandIds(),
      role: "admin",
    },
  };
}
