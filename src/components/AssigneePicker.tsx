"use client";

import { initials } from "@/lib/people";
import { useTaskBoard } from "./task-board-context";
import { SelectMenu } from "./ui/SelectMenu";

/** Cor estavel do avatar derivada do id da pessoa. */
function hue(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function Avatar({ id, name }: { id: string; name: string }) {
  return (
    <span
      aria-hidden
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: `hsl(${hue(id)} 52% 34%)` }}
    >
      {initials(name)}
    </span>
  );
}

/** Responsável — dropdown acessível com avatares; valor "" = ninguém. */
export function AssigneePicker({
  id,
  assigneeId,
}: {
  id: string;
  assigneeId?: string;
}) {
  const { mutate, people } = useTaskBoard();
  const person = people.find((p) => p.id === assigneeId);

  return (
    <SelectMenu
      ariaLabel={
        person ? `Responsável: ${person.name}` : "Atribuir responsável"
      }
      value={assigneeId ?? ""}
      onChange={(v) => mutate(id, { assigneeId: v || null })}
      options={[
        {
          value: "",
          label: "Ninguém",
          node: <span className="text-muted">Ninguém</span>,
        },
        ...people.map((p) => ({
          value: p.id,
          label: p.name,
          node: (
            <span className="flex items-center gap-2">
              <Avatar id={p.id} name={p.name} />
              {p.name}
            </span>
          ),
        })),
      ]}
      triggerClassName="flex shrink-0 items-center rounded-full"
      trigger={
        person ? (
          <Avatar id={person.id} name={person.name} />
        ) : (
          <span
            aria-hidden
            className="border-faint text-faint hover:border-fg hover:text-fg flex h-6 w-6 items-center justify-center rounded-full border border-dashed text-xs transition-colors"
          >
            +
          </span>
        )
      }
    />
  );
}
