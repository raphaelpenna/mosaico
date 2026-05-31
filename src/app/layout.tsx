import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mosaico — Camada de Integração Azzas",
  description:
    "Camada de integração do Mosaico: dados Azzas no contexto do trabalho.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
