import type { Brand } from "./taxonomy";
import { SEED_BRANDS } from "./taxonomy";

/**
 * Catálogo de marcas — store EM MEMÓRIA, mutável pelo Admin (CRUD). Módulo
 * simples (não `server-only`, como o mock de tarefas): a mutação só acontece
 * via server actions; os clients recebem as marcas por props do servidor.
 * Reseta no restart.
 */
const brands: Brand[] = SEED_BRANDS.map((b) => ({ ...b }));

export function listBrands(): Brand[] {
  return brands.map((b) => ({ ...b }));
}

export function getBrand(id: string): Brand | undefined {
  const b = brands.find((x) => x.id === id);
  return b ? { ...b } : undefined;
}

export function allBrandIds(): string[] {
  return brands.map((b) => b.id);
}

/** Gera um slug único a partir do nome. */
function slugify(name: string): string {
  const base =
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "marca";
  let id = base;
  let n = 2;
  while (brands.some((b) => b.id === id)) id = `${base}-${n++}`;
  return id;
}

export interface NewBrandInput {
  name: string;
  accent?: string;
}

export function createBrand(input: NewBrandInput): Brand | null {
  const name = input.name.trim();
  if (!name) return null;
  const brand: Brand = {
    id: slugify(name),
    name,
    accent: input.accent || "#5b5bd6",
  };
  brands.push(brand);
  return { ...brand };
}

export function updateBrand(
  id: string,
  patch: { name?: string; accent?: string },
): Brand | null {
  const b = brands.find((x) => x.id === id);
  if (!b) return null;
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (name) b.name = name;
  }
  if (patch.accent) b.accent = patch.accent;
  return { ...b };
}

export function deleteBrand(id: string): void {
  const idx = brands.findIndex((b) => b.id === id);
  if (idx !== -1) brands.splice(idx, 1);
}

/** Move a marca uma posição para cima (-1) ou para baixo (+1). */
export function moveBrand(id: string, dir: -1 | 1): void {
  const idx = brands.findIndex((b) => b.id === id);
  if (idx === -1) return;
  const to = idx + dir;
  if (to < 0 || to >= brands.length) return;
  const [b] = brands.splice(idx, 1);
  brands.splice(to, 0, b);
}
