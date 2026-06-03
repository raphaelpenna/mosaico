/**
 * Catálogo de pessoas — store EM MEMÓRIA, mutável pelo Admin (CRUD). Como
 * marcas/labels/campos: módulo simples; mutação via server actions; os clients
 * recebem as pessoas por contexto/props do servidor. Reseta no restart.
 *
 * Quando o Entra ID entrar (ver lib/auth/session), isto vira o diretório real
 * da Azzas. `initials` é puro (usado em avatares no client).
 */
export interface Person {
  id: string;
  name: string;
}

const SEED_PEOPLE: Person[] = [
  { id: "u-stub", name: "Colaborador Azzas" }, // MOCK — o usuario da sessao
  { id: "ana", name: "Ana Souza" }, // MOCK
  { id: "bruno", name: "Bruno Lima" }, // MOCK
  { id: "carla", name: "Carla Dias" }, // MOCK
  { id: "diego", name: "Diego Reis" }, // MOCK
];

const people: Person[] = SEED_PEOPLE.map((p) => ({ ...p }));

export function listPeople(): Person[] {
  return people.map((p) => ({ ...p }));
}

export function getPerson(id: string | undefined): Person | undefined {
  if (!id) return undefined;
  const p = people.find((x) => x.id === id);
  return p ? { ...p } : undefined;
}

export function isPerson(id: string): boolean {
  return people.some((p) => p.id === id);
}

/** Iniciais para avatar (ate 2) — puro. */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function slugify(name: string): string {
  const base =
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "pessoa";
  let id = base;
  let n = 2;
  while (people.some((p) => p.id === id)) id = `${base}-${n++}`;
  return id;
}

export function createPerson(input: { name: string }): Person | null {
  const name = input.name.trim();
  if (!name) return null;
  const person: Person = { id: slugify(name), name };
  people.push(person);
  return { ...person };
}

export function updatePerson(
  id: string,
  patch: { name?: string },
): Person | null {
  const p = people.find((x) => x.id === id);
  if (!p) return null;
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (name) p.name = name;
  }
  return { ...p };
}

export function deletePerson(id: string): void {
  const idx = people.findIndex((p) => p.id === id);
  if (idx !== -1) people.splice(idx, 1);
}
