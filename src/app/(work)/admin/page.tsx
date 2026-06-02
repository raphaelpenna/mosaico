import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listBrands } from "@/lib/brands/store";
import { AdminBrands } from "@/components/AdminBrands";

/**
 * Admin v1 — gestão de marcas/workspaces (CRUD). Acesso só para papel admin
 * (verificado no servidor). Labels/campos/status entram numa próxima leva.
 */
export default async function AdminPage() {
  const { scope } = await getSession();
  if (scope.role !== "admin") redirect("/tasks");

  const brands = listBrands();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-muted text-sm">
          Marcas / workspaces — criar, renomear, recolorir, reordenar e remover.
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">
          Marcas ({brands.length})
        </h2>
        <AdminBrands brands={brands} />
      </section>
    </div>
  );
}
