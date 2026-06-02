"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Brand } from "@/types";
import { Dialog } from "./ui/Dialog";

/**
 * Command palette (⌘K) + atalhos globais. Desacoplada do board: navega por
 * router e emite CustomEvents que AddTask/TaskBoard escutam (focus-add,
 * toggle-view, clear-filters). Atalhos: ⌘K abre; "c" foca novo; "v" alterna
 * visão; Esc fecha.
 */
interface Command {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

function emit(name: string) {
  window.dispatchEvent(new CustomEvent(name));
}

function isTyping(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    t.isContentEditable
  );
}

export function CommandPalette({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const commands = useMemo<Command[]>(() => {
    const go = (brand: string) => () => {
      router.push(`/tasks?brand=${brand}`);
      setOpen(false);
    };
    return [
      {
        id: "new",
        label: "Nova tarefa",
        hint: "c",
        run: () => {
          setOpen(false);
          setTimeout(() => emit("mosaico:focus-add"), 0);
        },
      },
      {
        id: "view",
        label: "Alternar visão (Lista / Quadro)",
        hint: "v",
        run: () => {
          emit("mosaico:toggle-view");
          setOpen(false);
        },
      },
      {
        id: "clear",
        label: "Limpar filtros",
        run: () => {
          emit("mosaico:clear-filters");
          setOpen(false);
        },
      },
      { id: "all", label: "Ver todas as marcas", run: go("all") },
      ...brands.map((b) => ({
        id: `brand-${b.id}`,
        label: `Ir para ${b.name}`,
        hint: "marca",
        run: go(b.id),
      })),
    ];
  }, [brands, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  // Atalhos globais
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          setQuery("");
          setActive(0);
          setOpen(true);
        }
        return;
      }
      if (open) return;
      if (isTyping(e.target)) return;
      if (e.key === "c") {
        e.preventDefault();
        emit("mosaico:focus-add");
      } else if (e.key === "v") {
        e.preventDefault();
        emit("mosaico:toggle-view");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} ariaLabel="Comandos">
      <input
        autoFocus
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            filtered[active]?.run();
          }
        }}
        placeholder="Digite um comando…"
        className="border-border placeholder:text-faint w-full border-b bg-transparent px-4 py-3 text-sm outline-none"
      />
      <ul className="max-h-80 overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <li className="text-muted px-3 py-6 text-center text-sm">
            Nenhum comando.
          </li>
        ) : (
          filtered.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={c.run}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  i === active ? "bg-surface-2 text-fg" : "text-muted"
                }`}
              >
                <span>{c.label}</span>
                {c.hint && (
                  <kbd className="border-border text-faint rounded border px-1.5 py-0.5 text-[10px]">
                    {c.hint}
                  </kbd>
                )}
              </button>
            </li>
          ))
        )}
      </ul>
    </Dialog>
  );
}
