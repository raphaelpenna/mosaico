/**
 * Taxonomia de marca do Grupo Azzas.
 *
 * Identidade de marca estatica — apenas nomes/slugs. NAO ha fonte de dado por
 * tras: a taxonomia e config no codigo, nao vem de banco. O campo `bu` e um
 * agrupamento PROVISORIO e NAO-CANONICO; quando a taxonomia oficial de BU
 * chegar, basta editar este arquivo.
 */
export interface Brand {
  /** slug estavel usado como id interno e em URLs */
  id: string;
  /** nome de exibicao da marca */
  name: string;
  /** codigo de rede de lojas (taxonomia estatica) */
  redeLojas: string;
  /** agrupamento de BU — PROVISORIO, nao-canonico */
  bu: string;
  /** cor de assinatura da marca (hex) — usada como acento sutil na UI */
  accent: string;
}

export const BRANDS: Brand[] = [
  { id: "farm", name: "Farm", redeLojas: "2", bu: "Vestuário", accent: "#e8552d" }, // prettier-ignore
  { id: "animale", name: "Animale", redeLojas: "1", bu: "Vestuário", accent: "#8e1b2e" }, // prettier-ignore
  { id: "fabula", name: "Fábula", redeLojas: "5", bu: "Vestuário", accent: "#1fa67a" }, // prettier-ignore
  { id: "foxton", name: "Foxton", redeLojas: "7", bu: "Vestuário", accent: "#1e5a8a" }, // prettier-ignore
  { id: "cris-barros", name: "Cris Barros", redeLojas: "9", bu: "Vestuário", accent: "#6b5b95" }, // prettier-ignore
  { id: "maria-filo", name: "Maria Filó", redeLojas: "15", bu: "Vestuário", accent: "#c2407a" }, // prettier-ignore
  { id: "bynv", name: "BYNV", redeLojas: "16", bu: "Vestuário", accent: "#5b4b8a" }, // prettier-ignore
  { id: "carol-bassi", name: "Carol Bassi", redeLojas: "30", bu: "Vestuário", accent: "#9a7b4f" }, // prettier-ignore
  { id: "outlet", name: "OFF Premium (Outlet)", redeLojas: "6", bu: "Outras", accent: "#475569" }, // prettier-ignore
];

const BY_ID = new Map(BRANDS.map((b) => [b.id, b]));

export function getBrand(id: string): Brand | undefined {
  return BY_ID.get(id);
}
