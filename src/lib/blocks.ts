import type { Block, BlockType } from "@/types";

/**
 * Saneamento do corpo em blocos (tarefas E documentos). Nunca confia no client:
 * aceita só tipos conhecidos e normaliza os campos por tipo. Compartilhado entre
 * as server actions de tarefa e de documento.
 */
const VALID_BLOCK: readonly BlockType[] = [
  "paragraph",
  "heading",
  "todo",
  "bullet",
  "quote",
  "divider",
];

export function sanitizeBlocks(input: unknown): Block[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((b) => b && VALID_BLOCK.includes(b.type))
    .map(
      (b): Block => ({
        id: String(b.id),
        type: b.type,
        text: typeof b.text === "string" ? b.text : "",
        ...(b.type === "heading" ? { level: b.level === 2 ? 2 : 1 } : {}),
        ...(b.type === "todo" ? { done: Boolean(b.done) } : {}),
      }),
    );
}
