/**
 * Identidade de marca do Grupo Azzas.
 *
 * A partir do Admin v1, a taxonomia deixou de ser config FIXA no código: o
 * catálogo vivo (mutável) está em `store.ts`; aqui ficam só o TIPO `Brand` e a
 * SEMENTE inicial. Continua sem banco real — o store é em memória (mock),
 * reseta no restart, como o de tarefas.
 */
export interface Brand {
  /** slug estavel usado como id interno e em URLs */
  id: string;
  /** nome de exibicao da marca */
  name: string;
  /** cor de assinatura da marca (hex) — usada como acento sutil na UI */
  accent: string;
  /** codigo de rede de lojas (taxonomia estatica) — opcional p/ marcas criadas */
  redeLojas?: string;
  /** agrupamento de BU — PROVISORIO, nao-canonico; opcional */
  bu?: string;
}

/** Semente do catálogo de marcas (estado inicial do store). */
export const SEED_BRANDS: Brand[] = [
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
