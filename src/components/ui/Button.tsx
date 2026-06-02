import type { ButtonHTMLAttributes } from "react";

/**
 * Botão base do design system — variantes e tamanhos consistentes (foco, raio,
 * transição). Sem "use client": é só apresentação, usável em server e client.
 */
type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:opacity-90",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  outline: "border-border text-fg hover:bg-surface-2 border",
  danger: "text-[var(--danger)] hover:bg-surface-2",
};
const SIZE: Record<Size, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

export function Button({
  variant = "ghost",
  size = "md",
  type = "button",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium transition-colors ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...props}
    />
  );
}
