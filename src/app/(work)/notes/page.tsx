import { getSession } from "@/lib/auth/session";
import { listNotes } from "@/lib/docs";
import { DocsView } from "@/components/DocsView";

/**
 * Minhas notas — documentos pessoais (sem marca), escopados só pelo dono. Reusa
 * o DocsView/BlockEditor das tarefas; a seleção mora em ?doc=.
 */
export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string }>;
}) {
  const { scope } = await getSession();
  const { doc } = await searchParams;
  const notes = listNotes(scope);

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-semibold tracking-tight">Minhas notas</h1>
        <p className="text-muted text-sm">
          Anotações pessoais, fora do escopo de marca. Só você as vê.
        </p>
      </header>

      <DocsView docs={notes} brandId={null} selectedId={doc} basePath="/notes" />
    </div>
  );
}
