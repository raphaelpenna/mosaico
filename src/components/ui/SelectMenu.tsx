"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/**
 * Dropdown de seleção única, acessível e sem dependências.
 *
 * Padrão listbox: trigger com aria-haspopup/expanded; painel role="listbox"
 * com itens role="option". Teclado: ↑/↓ navegam, Enter/Espaço selecionam, Esc
 * fecha e devolve o foco ao trigger, Home/End vão às pontas. Fecha no clique
 * fora e em scroll/resize. Renderizado em portal (fixed) para não ser cortado
 * por containers com overflow (ex.: colunas do Kanban).
 */
export interface SelectOption {
  value: string;
  /** texto para acessibilidade */
  label: string;
  /** render customizado no item (default: label) */
  node?: ReactNode;
}

export function SelectMenu({
  value,
  onChange,
  options,
  ariaLabel,
  trigger,
  triggerClassName,
  align = "end",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  trigger: ReactNode;
  triggerClassName?: string;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [active, setActive] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();

  function openMenu() {
    setRect(triggerRef.current?.getBoundingClientRect() ?? null);
    setActive(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  }
  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }
  function choose(v: string) {
    onChange(v);
    close();
  }

  // Foca o item ativo (efeito de DOM). `preventScroll` evita que focar role o
  // container — o que dispararia o listener de scroll abaixo e fecharia o menu
  // na hora (ex.: dentro do painel de detalhe, que é rolável).
  useEffect(() => {
    if (open) itemRefs.current[active]?.focus({ preventScroll: true });
  }, [open, active]);

  // Fecha no clique fora. (NÃO fecha em scroll: dentro de containers roláveis
  // como o painel de detalhe, o scroll induzido pelo foco fechava o menu na
  // hora — bug. O menu é `fixed`; em scroll de página ele só perde o ancoramento,
  // o que é aceitável.)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t))
        return;
      close(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  // Vira para cima quando não há espaço abaixo (ex.: trigger no rodapé da
  // sidebar) e limita a altura à viewport (rola se preciso).
  const flipUp = rect ? rect.bottom > window.innerHeight - 260 : false;
  const panelStyle: CSSProperties | undefined = rect
    ? {
        position: "fixed",
        maxHeight: (flipUp ? rect.top : window.innerHeight - rect.bottom) - 12,
        ...(flipUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
        ...(align === "end"
          ? { right: window.innerWidth - rect.right }
          : { left: rect.left }),
      }
    : undefined;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(e) => {
          if (
            !open &&
            (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
          ) {
            e.preventDefault();
            openMenu();
          }
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>

      {open &&
        rect &&
        typeof document !== "undefined" &&
        createPortal(
          <ul
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            style={panelStyle}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                close();
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, options.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Home") {
                e.preventDefault();
                setActive(0);
              } else if (e.key === "End") {
                e.preventDefault();
                setActive(options.length - 1);
              } else if (e.key === "Tab") {
                close(false);
              }
            }}
            className="bg-surface border-border anim-pop z-50 min-w-44 overflow-y-auto rounded-lg border p-1 shadow-lg"
          >
            {options.map((o, i) => {
              const selected = o.value === value;
              return (
                <li key={o.value} role="none">
                  <button
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    onClick={() => choose(o.value)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      i === active ? "bg-surface-2" : ""
                    }`}
                  >
                    <span className="flex-1">{o.node ?? o.label}</span>
                    {selected && (
                      <svg
                        viewBox="0 0 16 16"
                        className="text-accent h-3.5 w-3.5 shrink-0"
                        aria-hidden
                      >
                        <path
                          d="M3.5 8.5l3 3 6-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}
