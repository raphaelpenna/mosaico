import { getLabel } from "@/lib/labels";
import { Badge } from "./ui/Badge";

/** Chips de label (somente leitura) exibidas na linha da tarefa. */
export function LabelChips({
  labelIds,
  className = "",
}: {
  labelIds: string[];
  className?: string;
}) {
  if (labelIds.length === 0) return null;
  return (
    <div className={`shrink-0 items-center gap-1 ${className}`}>
      {labelIds.map((id) => {
        const label = getLabel(id);
        if (!label) return null;
        return (
          <Badge key={id} color={label.color}>
            {label.name}
          </Badge>
        );
      })}
    </div>
  );
}
