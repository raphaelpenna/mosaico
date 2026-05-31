import "server-only";

import type { Session } from "@/types";

/**
 * STUB de autenticacao — na FORMA de um provider real.
 *
 * Hoje retorna uma sessao fixa. A forma (getSession() async, no servidor,
 * devolvendo user + escopo) e identica a do alvo: Auth.js (NextAuth) com
 * provider Microsoft Entra ID (Azure AD) — que e o IdP que a Azzas ja usa na
 * infra existente. Trocar este corpo por `auth()` do NextAuth nao muda nenhum
 * caller.
 *
 * O escopo aqui da, de proposito, acesso so a um SUBCONJUNTO de marcas — assim
 * o isolamento por marca/BU fica visivel e testavel desde o dia 1 (o usuario
 * NAO ve Carol Bassi, Foxton, etc.).
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
      allowedBrandIds: ["farm", "animale", "fabula", "maria-filo"],
      role: "editor",
    },
  };
}
