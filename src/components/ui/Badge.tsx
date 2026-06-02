import type { ReactNode } from "react";

/**
 * Chip/etiqueta do design system. Com `color`, o texto fica neutro (`fg`, alto
 * contraste — AA) e a cor vira um PONTO + fundo suave (`color-mix`); a cor não
 * é usada como texto pequeno (que falharia contraste). Sem cor, chip neutra.
 */
export function Badge({
  color,
  children,
  className = "",
}: {
  color?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!color) {
    return (
      <span
        className={`bg-surface-2 text-muted inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${className}`}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className={`text-fg inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${className}`}
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
      }}
    >
      <span
        aria-hidden
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {children}
    </span>
  );
}
