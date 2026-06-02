/**
 * Catalogo de pessoas — MOCK. Time ficticio para atribuicao de tarefas.
 *
 * Hoje config estatica no codigo (como a taxonomia de marca). Quando o Entra ID
 * entrar (ver lib/auth/session), a lista de pessoas vira do diretorio da Azzas.
 * Sem fronteira server-only: sao so nomes, usaveis no client tambem.
 */
export interface Person {
  id: string;
  name: string;
}

export const PEOPLE: Person[] = [
  { id: "u-stub", name: "Colaborador Azzas" }, // MOCK — o usuario da sessao
  { id: "ana", name: "Ana Souza" }, // MOCK
  { id: "bruno", name: "Bruno Lima" }, // MOCK
  { id: "carla", name: "Carla Dias" }, // MOCK
  { id: "diego", name: "Diego Reis" }, // MOCK
];

const BY_ID = new Map(PEOPLE.map((p) => [p.id, p]));

export function getPerson(id: string | undefined): Person | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function isPerson(id: string): boolean {
  return BY_ID.has(id);
}

/** Iniciais para avatar (ate 2). */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
