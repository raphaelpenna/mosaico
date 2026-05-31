import type { Task } from "@/types";
import { getSession } from "@/lib/auth/session";
import { getTaskSource } from "@/lib/tasks";
import { resolveScopedBrand, scopedBrands } from "@/lib/brands/scope";
import { getBrand } from "@/lib/brands/taxonomy";
import { resolveTaskData, type ResolvedTaskData } from "@/lib/links/resolve";
import { BrandSelector } from "@/components/BrandSelector";
import { AddTask } from "@/components/AddTask";
import { TaskList } from "@/components/TaskList";

/** Item de tarefa ja resolvido no servidor para a UI consumir. */
export interface ResolvedTaskItem {
  task: Task;
  resolved: ResolvedTaskData;
  linkedBrandName: string | undefined;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;

  // Tudo no servidor: sessao -> escopo -> ports. Nenhuma fonte vaza pro client.
  const { user, scope } = await getSession();
  // Marcas do seletor vem da taxonomia (config estatica) escopada pela sessao —
  // nao da fonte de dados. Assim o seletor nao depende da fonte estar pronta.
  const brands = scopedBrands(scope);
  const activeBrand = resolveScopedBrand(scope, brand);

  const tasks = await getTaskSource().listTasks(scope);
  const items: ResolvedTaskItem[] = await Promise.all(
    tasks.map(async (task) => ({
      task,
      resolved: await resolveTaskData(task, scope),
      linkedBrandName: task.dataLink
        ? getBrand(task.dataLink.brandId)?.name
        : undefined,
    })),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-5 py-8">
      {/* Banner: deixa explicito que TODO dado e ficticio neste milestone. */}
      <div className="rounded-md bg-amber-400/15 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
        Ambiente de demonstração — todos os números são{" "}
        <strong>fictícios (MOCK)</strong>. Nenhum dado real da Azzas.
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Mosaico · Tarefas</h1>
        <p className="text-foreground/60 text-sm">
          Dado Azzas no contexto do trabalho — vincule uma métrica de marca a
          uma tarefa.
        </p>
      </header>

      <div className="border-foreground/10 flex flex-wrap items-center justify-between gap-2 border-y py-2 text-sm">
        <BrandSelector brands={brands} />
        <span className="text-foreground/50 text-xs">
          {user.name} · escopo: {brands.map((b) => b.name).join(", ")}
        </span>
      </div>

      <AddTask />
      <TaskList items={items} activeBrand={activeBrand} />
    </div>
  );
}
