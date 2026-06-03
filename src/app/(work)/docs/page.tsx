import { getSession } from "@/lib/auth/session";
import { resolveScopedBrand, scopedBrands } from "@/lib/brands/scope";
import { listDocs } from "@/lib/docs";
import { DocsView } from "@/components/DocsView";

/**
 * Base de conhecimento por marca. Tudo no servidor: sessão -> escopo -> marca
 * ativa (mesmo ?brand= das tarefas) -> documentos da marca. O editor reusa o
 * BlockEditor das tarefas.
 */
export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; doc?: string }>;
}) {
  const { scope } = await getSession();
  const brands = scopedBrands(scope);
  const { brand, doc } = await searchParams;

  // Docs são sempre por marca (sem visões consolidadas "all"/"mine"): cai na
  // marca ativa revalidada, com fallback na primeira em escopo.
  const activeBrand = resolveScopedBrand(scope, brand) ?? brands[0];
  const docs = activeBrand ? listDocs(scope, activeBrand.id) : [];

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Base de conhecimento
        </h1>
        <p className="text-muted text-sm">
          {activeBrand
            ? `Documentos da marca ${activeBrand.name}.`
            : "Nenhuma marca em escopo para esta sessão."}
        </p>
      </header>

      {activeBrand && (
        <DocsView
          key={activeBrand.id}
          docs={docs}
          brandId={activeBrand.id}
          selectedId={doc}
        />
      )}
    </div>
  );
}
