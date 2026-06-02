import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { scopedBrands } from "@/lib/brands/scope";
import { BrandSelector } from "@/components/BrandSelector";
import { BrandTheme } from "@/components/BrandTheme";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

/**
 * Chrome compartilhado das superficies de trabalho: top bar fixa com a marca do
 * produto, o seletor de marca ativa (escopado pela sessao) e a identidade do
 * usuario. A sessao e resolvida no servidor; o seletor (client) le a marca ativa
 * da URL.
 */
export default async function WorkLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, scope } = await getSession();
  const brands = scopedBrands(scope);
  const defaultBrandId = brands[0]?.id ?? "";

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Suspense fallback={<div className="flex min-h-full flex-col" />}>
      <BrandTheme brands={brands} defaultBrandId={defaultBrandId}>
        <header className="bg-bg/80 border-border sticky top-0 z-10 border-b backdrop-blur-md">
          <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-4 px-5">
            <a
              href="/tasks"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <Logo className="text-fg h-5 w-5" />
              Mosaico
            </a>

            <div className="bg-border h-5 w-px" aria-hidden />

            <Suspense>
              <BrandSelector brands={brands} defaultBrandId={defaultBrandId} />
            </Suspense>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <span className="text-muted hidden text-xs sm:inline">
                {user.name}
              </span>
              <span
                title={`${user.name} · ${user.email}`}
                className="bg-surface-2 text-muted flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-medium transition-colors"
                style={{ borderColor: "var(--brand-accent)" }}
              >
                {initials}
              </span>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>
        <CommandPalette brands={brands} />
      </BrandTheme>
    </Suspense>
  );
}
