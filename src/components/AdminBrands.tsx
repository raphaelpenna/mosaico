"use client";

import { useRef, useState, useTransition } from "react";
import type { Brand } from "@/types";
import {
  createBrandAction,
  deleteBrandAction,
  moveBrandAction,
  updateBrandAction,
} from "@/app/(work)/admin/actions";
import { Button } from "./ui/Button";

/**
 * CRUD de marcas (Admin v1). Renomear/recolorir salvam no blur/change; mover e
 * remover na hora; criar pelo formulário no fim. Tudo via server actions, que
 * checam o papel admin no servidor.
 */
function BrandRow({
  brand,
  index,
  total,
}: {
  brand: Brand;
  index: number;
  total: number;
}) {
  const [name, setName] = useState(brand.name);
  const [pending, start] = useTransition();

  return (
    <li
      className={`border-border bg-surface flex items-center gap-2 rounded-xl border px-3 py-2 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <label className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        <span className="sr-only">Cor da marca {brand.name}</span>
        <span
          className="h-4 w-4 rounded-[5px]"
          style={{ backgroundColor: brand.accent }}
        />
        <input
          type="color"
          defaultValue={brand.accent}
          onChange={(e) =>
            start(() => updateBrandAction(brand.id, { accent: e.target.value }))
          }
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label={`Cor de ${brand.name}`}
        />
      </label>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim() && name !== brand.name)
            start(() => updateBrandAction(brand.id, { name }));
        }}
        aria-label={`Nome da marca ${brand.name}`}
        className="focus:border-border-strong min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none"
      />

      <span className="text-faint shrink-0 font-mono text-xs">{brand.id}</span>

      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={() => start(() => moveBrandAction(brand.id, -1))}
          disabled={index === 0}
          aria-label="Mover para cima"
          className="text-faint hover:bg-surface-2 hover:text-fg flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => start(() => moveBrandAction(brand.id, 1))}
          disabled={index === total - 1}
          aria-label="Mover para baixo"
          className="text-faint hover:bg-surface-2 hover:text-fg flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-30"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => start(() => deleteBrandAction(brand.id))}
          aria-label={`Remover ${brand.name}`}
          className="text-faint hover:bg-surface-2 ml-1 flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:text-[var(--danger)]"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
            <path
              d="M4 4l8 8M12 4l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </li>
  );
}

export function AdminBrands({ brands }: { brands: Brand[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5">
        {brands.map((b, i) => (
          <BrandRow key={b.id} brand={b} index={i} total={brands.length} />
        ))}
      </ul>

      <form
        ref={formRef}
        action={async (formData) => {
          await createBrandAction(formData);
          formRef.current?.reset();
        }}
        className="border-border bg-surface flex items-center gap-2 rounded-xl border px-3 py-2"
      >
        <input
          name="name"
          required
          autoComplete="off"
          placeholder="Nova marca…"
          aria-label="Nome da nova marca"
          className="placeholder:text-faint min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <Button type="submit" variant="primary" size="sm">
          Adicionar marca
        </Button>
      </form>
    </div>
  );
}
