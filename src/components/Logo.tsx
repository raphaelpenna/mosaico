/**
 * Logomark do Mosaico — um mosaico 2×2 de azulejos. Três tiles em `currentColor`
 * (herdam a cor do texto) e um na cor da marca ativa (`--brand-accent`), o que
 * amarra o logo ao contexto de marca. Decorativo (aria-hidden).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <rect x="1" y="1" width="8" height="8" rx="2.2" fill="currentColor" />
      <rect
        x="11"
        y="1"
        width="8"
        height="8"
        rx="2.2"
        fill="currentColor"
        opacity="0.4"
      />
      <rect
        x="1"
        y="11"
        width="8"
        height="8"
        rx="2.2"
        fill="currentColor"
        opacity="0.4"
      />
      <rect
        x="11"
        y="11"
        width="8"
        height="8"
        rx="2.2"
        fill="var(--brand-accent)"
      />
    </svg>
  );
}
