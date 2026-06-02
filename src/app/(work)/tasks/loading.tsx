/**
 * Skeleton da superficie de tarefas — mostrado em transicoes de rota (ex.: troca
 * de marca) enquanto o Server Component recarrega.
 */
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 py-8">
      <div className="flex flex-col gap-3">
        <div className="bg-surface-2 h-7 w-40 animate-pulse rounded-md" />
        <div className="bg-surface-2 h-4 w-56 animate-pulse rounded-md" />
        <div className="bg-surface-2 h-1.5 w-full animate-pulse rounded-full" />
      </div>
      <div className="bg-surface-2 h-12 w-full animate-pulse rounded-xl" />
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-2 h-12 w-full animate-pulse rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}
