import type { Brand } from "@/lib/data/schema";

/**
 * Taxonomia de marca do Grupo Azzas.
 *
 * Os NOMES e os codigos `redeLojas` sao a taxonomia REAL extraida da infra
 * de dados Azzas (REDE_LOJAS no data warehouse). Isso deixa o encaixe com o
 * MCP/BigQuery real realista — a chave de marca ja e a chave verdadeira.
 *
 * O campo `bu` e um agrupamento PROVISORIO e NAO-CANONICO: a Azzas nao tem uma
 * hierarquia de BU formal nos dados (la o pivot e marca + regiao). Quando a
 * taxonomia oficial de BU chegar, basta editar este arquivo.
 *
 * NENHUM numero/metrica aqui — so identidade de marca. Valores ficticios vivem
 * no MockDataSource.
 */
export const BRANDS: Brand[] = [
  { id: "farm", name: "Farm", redeLojas: "2", bu: "Vestuário" },
  { id: "animale", name: "Animale", redeLojas: "1", bu: "Vestuário" },
  { id: "fabula", name: "Fábula", redeLojas: "5", bu: "Vestuário" },
  { id: "foxton", name: "Foxton", redeLojas: "7", bu: "Vestuário" },
  { id: "cris-barros", name: "Cris Barros", redeLojas: "9", bu: "Vestuário" },
  { id: "maria-filo", name: "Maria Filó", redeLojas: "15", bu: "Vestuário" },
  { id: "bynv", name: "BYNV", redeLojas: "16", bu: "Vestuário" },
  { id: "carol-bassi", name: "Carol Bassi", redeLojas: "30", bu: "Vestuário" },
  { id: "outlet", name: "OFF Premium (Outlet)", redeLojas: "6", bu: "Outras" },
];

const BY_ID = new Map(BRANDS.map((b) => [b.id, b]));

export function getBrand(id: string): Brand | undefined {
  return BY_ID.get(id);
}
