"use client";

import { useEffect, useSyncExternalStore } from "react";
import { SelectMenu } from "./ui/SelectMenu";

/**
 * Alternador de tema (claro / escuro / sistema) com persistencia em
 * localStorage. A aplicacao inicial (sem flash) e feita pelo script inline no
 * RootLayout; aqui refletimos/atualizamos a preferencia via um store externo
 * (useSyncExternalStore) — sem mismatch de hidratacao. "system" segue o SO em
 * tempo real via matchMedia.
 */
type Pref = "system" | "light" | "dark";
const KEY = "mosaico-theme";

function resolve(pref: Pref): "light" | "dark" {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return pref;
}

function applyTheme(pref: Pref) {
  const dark = resolve(pref) === "dark";
  const el = document.documentElement;
  el.dataset.theme = dark ? "dark" : "light";
  el.style.colorScheme = dark ? "dark" : "light";
}

// Store externo da preferencia de tema (uma fonte da verdade no localStorage).
const listeners = new Set<() => void>();
const themeStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    window.addEventListener("storage", cb);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", cb);
    };
  },
  get(): Pref {
    return (localStorage.getItem(KEY) as Pref) || "system";
  },
  set(pref: Pref) {
    localStorage.setItem(KEY, pref);
    applyTheme(pref);
    listeners.forEach((l) => l());
  },
};

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <rect
        x="3"
        y="4.5"
        width="18"
        height="12"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8.5 20h7M12 16.5V20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const OPTIONS: { value: Pref; label: string; icon: React.ReactNode }[] = [
  { value: "system", label: "Sistema", icon: <SystemIcon /> },
  { value: "light", label: "Claro", icon: <SunIcon /> },
  { value: "dark", label: "Escuro", icon: <MoonIcon /> },
];

export function ThemeToggle() {
  const pref = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.get,
    () => "system" as Pref,
  );

  // Aplica o tema sempre que a preferencia muda — inclui sincronizacao entre
  // abas (o 'storage' event re-renderiza via useSyncExternalStore). Em "system",
  // tambem reage a mudancas do SO em tempo real. (Efeito de DOM, sem setState.)
  useEffect(() => {
    applyTheme(pref);
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const current = OPTIONS.find((o) => o.value === pref) ?? OPTIONS[0];

  return (
    <SelectMenu
      ariaLabel={`Tema: ${current.label}`}
      value={pref}
      onChange={(v) => themeStore.set(v as Pref)}
      options={OPTIONS.map((o) => ({
        value: o.value,
        label: o.label,
        node: (
          <span className="flex items-center gap-2">
            {o.icon}
            {o.label}
          </span>
        ),
      }))}
      triggerClassName="text-muted hover:bg-surface-2 hover:text-fg flex h-7 w-7 items-center justify-center rounded-full transition-colors"
      trigger={current.icon}
    />
  );
}
