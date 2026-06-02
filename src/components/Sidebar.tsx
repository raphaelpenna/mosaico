"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Brand } from "@/types";
import { initials } from "@/lib/people";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Sidebar esquerda recolhível (zona 1 do layout de 3 zonas). Navegação por
 * marca (cada marca é um workspace) + visões consolidadas. A marca/visão ativa
 * vem de ?brand= (lida no client). Recolhida, mostra só os pontos/ícones.
 */
function NavLink({
  href,
  active,
  collapsed,
  title,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  collapsed: boolean;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      title={collapsed ? title : undefined}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
        active
          ? "bg-surface-2 text-fg font-medium"
          : "text-muted hover:bg-surface-2 hover:text-fg"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {icon}
      </span>
      {!collapsed && <span className="truncate">{children}</span>}
    </a>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-faint px-2 pt-3 pb-1 text-[11px] font-semibold tracking-wide uppercase">
      {children}
    </p>
  );
}

export function Sidebar({
  brands,
  defaultBrandId,
  userName,
  userEmail,
  isAdmin = false,
  className = "",
}: {
  brands: Brand[];
  defaultBrandId: string;
  userName: string;
  userEmail: string;
  isAdmin?: boolean;
  className?: string;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const onTasks = pathname === "/tasks" || pathname === "/";
  const active = onTasks ? params.get("brand") || defaultBrandId : "";
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-bg border-border sticky top-0 flex h-dvh shrink-0 flex-col border-r transition-[width] ${
        collapsed ? "w-14" : "w-60"
      } ${className}`}
    >
      {/* Topo: wordmark + recolher */}
      <div className="flex h-14 items-center gap-2 px-3">
        <a
          href="/tasks"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <Logo className="text-fg h-5 w-5 shrink-0" />
          {!collapsed && "Mosaico"}
        </a>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!collapsed}
          className="text-faint hover:bg-surface-2 hover:text-fg ml-auto flex h-7 w-7 items-center justify-center rounded-md transition-colors"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
            <path
              d={collapsed ? "M6 4l4 4-4 4" : "M10 4l-4 4 4 4"}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {!collapsed && <SectionLabel>Marcas</SectionLabel>}
        <div className="flex flex-col gap-0.5">
          {brands.map((b) => (
            <NavLink
              key={b.id}
              href={`/tasks?brand=${b.id}`}
              active={active === b.id}
              collapsed={collapsed}
              title={b.name}
              icon={
                <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ backgroundColor: b.accent }}
                />
              }
            >
              {b.name}
            </NavLink>
          ))}
        </div>

        {!collapsed && <SectionLabel>Visões</SectionLabel>}
        <div className="flex flex-col gap-0.5">
          <NavLink
            href="/tasks?brand=all"
            active={active === "all"}
            collapsed={collapsed}
            title="Todas as marcas"
            icon={
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <path
                  d="M2.5 2.5h4v4h-4zM9.5 2.5h4v4h-4zM2.5 9.5h4v4h-4zM9.5 9.5h4v4h-4z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
            }
          >
            Todas as marcas
          </NavLink>
          <NavLink
            href="/tasks?brand=mine"
            active={active === "mine"}
            collapsed={collapsed}
            title="Minhas tarefas"
            icon={
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <path
                  d="M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 13.5c0-2.2 2.2-3.5 5-3.5s5 1.3 5 3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            }
          >
            Minhas tarefas
          </NavLink>
        </div>

        {isAdmin && (
          <>
            {!collapsed && <SectionLabel>Gestão</SectionLabel>}
            <NavLink
              href="/admin"
              active={pathname === "/admin"}
              collapsed={collapsed}
              title="Admin"
              icon={
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                  <path
                    d="M8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              }
            >
              Admin
            </NavLink>
          </>
        )}
      </nav>

      {/* Rodapé: tema + usuário */}
      <div className="border-border flex items-center gap-2 border-t p-2">
        <ThemeToggle />
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-2">
            <span
              title={`${userName} · ${userEmail}`}
              className="bg-surface-2 text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
            >
              {initials(userName)}
            </span>
            <span className="text-muted truncate text-xs">{userName}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
