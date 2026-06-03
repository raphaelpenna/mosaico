import { NextResponse, type NextRequest } from "next/server";

/**
 * STUB de proteção de rota (Proxy — a "middleware" do Next 16) na forma da
 * versão real.
 *
 * Hoje sempre deixa passar. Com Auth.js + Microsoft Entra, este é o ponto onde
 * a sessão é checada de forma otimista e o usuário não-autenticado é mandado
 * pro login. A forma (matcher cobrindo as rotas de trabalho, decisão no edge)
 * já está certa.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function proxy(_request: NextRequest) {
  // TODO(milestone-auth): validar sessão Entra e redirecionar se ausente.
  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*", "/docs/:path*", "/notes/:path*"],
};
