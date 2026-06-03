import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listBrands } from "@/lib/brands/store";
import { listLabels } from "@/lib/labels";
import { listFields } from "@/lib/fields";
import { listTemplates } from "@/lib/templates";
import { listPeople } from "@/lib/people";
import { AdminBrands } from "@/components/AdminBrands";
import { AdminLabels } from "@/components/AdminLabels";
import { AdminFields } from "@/components/AdminFields";
import { AdminTemplates } from "@/components/AdminTemplates";
import { AdminUsers } from "@/components/AdminUsers";

/**
 * Admin v1 — gestão de marcas/workspaces (CRUD). Acesso só para papel admin
 * (verificado no servidor). Labels/campos/status entram numa próxima leva.
 */
export default async function AdminPage() {
  const { scope } = await getSession();
  if (scope.role !== "admin") redirect("/tasks");

  const brands = listBrands();
  const labels = listLabels();
  const fields = listFields();
  const templates = listTemplates();
  const people = listPeople();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-8">
      <header className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-muted text-sm">
          Gestão do workspace — marcas, labels e campos customizados. (status e
          prioridades em breve)
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">
          Marcas ({brands.length})
        </h2>
        <AdminBrands brands={brands} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">
          Labels ({labels.length})
        </h2>
        <AdminLabels labels={labels} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">
          Campos customizados ({fields.length})
        </h2>
        <AdminFields fields={fields} brands={brands} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">
          Templates de tarefa ({templates.length})
        </h2>
        <AdminTemplates templates={templates} brands={brands} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-muted text-xs font-semibold tracking-wide uppercase">
          Usuários ({people.length})
        </h2>
        <AdminUsers people={people} />
      </section>
    </div>
  );
}
