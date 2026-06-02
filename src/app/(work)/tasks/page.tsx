import { getSession } from "@/lib/auth/session";
import { getTaskSource } from "@/lib/tasks";
import { resolveScopedBrand, scopedBrands } from "@/lib/brands/scope";
import { AddTask } from "@/components/AddTask";
import { TaskBoard } from "@/components/TaskBoard";
import type { TaskStatus } from "@/types";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  // Tudo no servidor: sessao -> escopo -> marca ativa -> port de tarefas.
  const { user, scope } = await getSession();
  const brands = scopedBrands(scope);
  const { brand } = await searchParams;

  // Visoes consolidadas (todas as marcas): "all" = tudo; "mine" = atribuidas a
  // mim. Caso contrario, marca ativa de ?brand= revalidada, com fallback na
  // primeira em escopo.
  const allView = brand === "all";
  const mineView = brand === "mine";
  const consolidated = allView || mineView;
  const activeBrand = consolidated
    ? null
    : (resolveScopedBrand(scope, brand) ?? brands[0]);

  let tasks = consolidated
    ? await getTaskSource().listTasks(scope)
    : activeBrand
      ? await getTaskSource().listTasks(scope, activeBrand.id)
      : [];
  if (mineView) tasks = tasks.filter((t) => t.assigneeId === user.id);

  const count = (s: TaskStatus) => tasks.filter((t) => t.status === s).length;
  const done = count("done");
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Referencia de "hoje" (ISO) resolvida no servidor — passada aos cards para a
  // marcacao de prazo (atrasado/hoje) bater no SSR e no client.
  const today = new Date().toISOString().slice(0, 10);

  const subtitle = mineView
    ? "Suas tarefas, em todas as marcas em escopo."
    : allView
      ? "Trabalho de todas as marcas em escopo."
      : activeBrand
        ? `Trabalho da marca ${activeBrand.name}.`
        : "Nenhuma marca em escopo para esta sessão.";

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mineView ? "Minhas tarefas" : "Tarefas"}
            </h1>
            <p className="text-muted text-sm">{subtitle}</p>
          </div>
          {total > 0 && (
            <span className="text-muted text-sm tabular-nums">
              {count("todo")} a fazer · {count("doing")} fazendo · {done} feito
            </span>
          )}
        </div>

        {total > 0 && (
          <div
            className="bg-surface-2 h-1.5 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso"
          >
            <div
              className="bg-done h-full rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </header>

      {!consolidated && activeBrand && <AddTask brandId={activeBrand.id} />}
      <TaskBoard
        tasks={tasks}
        today={today}
        groupByBrand={consolidated}
        brands={brands}
      />
    </div>
  );
}
