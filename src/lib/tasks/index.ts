import "server-only";

import type { TaskSource } from "./types";
import { MockTaskSource } from "./mock";

export type { TaskSource } from "./types";

/**
 * O "um arquivo" do swap para o port de tarefas (commodity).
 *
 * Hoje so existe o mock. Quando o nucleo OSS de PM (Plane) entrar, criar um
 * PlaneTaskSource implements TaskSource e selecionar por TASK_SOURCE aqui — a
 * UI nao muda. `import "server-only"` mantem o store fora do bundle do browser.
 */
let instance: TaskSource | null = null;

export function getTaskSource(): TaskSource {
  if (instance) return instance;
  const kind = process.env.TASK_SOURCE ?? "mock";
  switch (kind) {
    // case "plane": instance = new PlaneTaskSource(); break;  // milestone futuro
    case "mock":
    default:
      instance = new MockTaskSource();
      break;
  }
  return instance;
}
