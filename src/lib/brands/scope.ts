import type { AccessScope, Brand } from "@/types";
import { getBrand, listBrands } from "./store";

/**
 * Helpers de escopo de acesso por marca — desenhados para rodar NO SERVIDOR.
 *
 * Isolamento por marca/BU desde o dia 1: o usuario so enxerga e so vincula
 * dados das marcas que sua sessao permite. Como o escopo vem da sessao (server),
 * e nao de um parametro do client, isso e uma fronteira de seguranca real e nao
 * um filtro cosmetico de UI.
 */

/** Marcas que a sessao pode ver, na ordem da taxonomia. */
export function scopedBrands(scope: AccessScope): Brand[] {
  const allowed = new Set(scope.allowedBrandIds);
  return listBrands().filter((b) => allowed.has(b.id));
}

export function isBrandInScope(scope: AccessScope, brandId: string): boolean {
  return scope.allowedBrandIds.includes(brandId);
}

/**
 * Resolve um brandId pedido (ex vindo de ?brand= na URL) contra o escopo.
 * Retorna a Brand se permitida, senao undefined — nunca confia no parametro cru.
 */
export function resolveScopedBrand(
  scope: AccessScope,
  brandId: string | undefined,
): Brand | undefined {
  if (!brandId || !isBrandInScope(scope, brandId)) return undefined;
  return getBrand(brandId);
}

/** Garante que uma operacao em `brandId` esta dentro do escopo, ou lanca. */
export function assertBrandInScope(scope: AccessScope, brandId: string): void {
  if (!isBrandInScope(scope, brandId)) {
    throw new Error(
      `Acesso negado: marca "${brandId}" fora do escopo desta sessão.`,
    );
  }
}
