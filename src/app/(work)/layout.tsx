import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { scopedBrands } from "@/lib/brands/scope";
import { BrandSelector } from "@/components/BrandSelector";
import { BrandTheme } from "@/components/BrandTheme";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { Sidebar } from "@/components/Sidebar";

/**
 * Chrome de trabalho em 3 zonas (P0). Desktop: sidebar esquerda (marcas/visões)
 * + centro em largura total. Mobile: top bar com seletor de marca (a sidebar
 * fica oculta). A sessão é resolvida no servidor; a navegação ativa mora na URL.
 */
export default async function WorkLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, scope } = await getSession();
  const brands = scopedBrands(scope);
  const defaultBrandId = brands[0]?.id ?? "";

  return (
    <Suspense fallback={<div className="flex min-h-full flex-col" />}>
      <BrandTheme brands={brands} defaultBrandId={defaultBrandId}>
        <div className="flex min-h-full">
          <Sidebar
            className="hidden md:flex"
            brands={brands}
            defaultBrandId={defaultBrandId}
            userName={user.name}
            userEmail={user.email}
          />

          <div className="flex min-h-full min-w-0 flex-1 flex-col">
            {/* Top bar só no mobile (sidebar oculta abaixo de md) */}
            <header className="bg-bg/80 border-border sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-md md:hidden">
              <a
                href="/tasks"
                className="flex items-center gap-2 font-semibold tracking-tight"
              >
                <Logo className="text-fg h-5 w-5" />
                Mosaico
              </a>
              <div className="bg-border h-5 w-px" aria-hidden />
              <BrandSelector brands={brands} defaultBrandId={defaultBrandId} />
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </header>

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>

        <CommandPalette brands={brands} />
      </BrandTheme>
    </Suspense>
  );
}
