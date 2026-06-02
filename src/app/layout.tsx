import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // URL base para OG/canônicos: env explícita > URL da Vercel > localhost.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"),
  ),
  title: {
    default: "Mosaico",
    template: "%s · Mosaico",
  },
  description:
    "Mosaico — gerenciador de tarefas escopado por marca do Grupo Azzas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className="bg-bg text-fg flex min-h-full flex-col">
        {/* Aplica o tema salvo antes do paint — sem flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem('mosaico-theme')||'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.dataset.theme=d?'dark':'light';e.style.colorScheme=d?'dark':'light';}catch(_){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
