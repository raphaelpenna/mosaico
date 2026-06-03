"use client";

import { useState } from "react";
import type { CustomFieldValue, FieldDef, Task } from "@/types";
import { useTaskBoard } from "./task-board-context";
import { SelectMenu } from "./ui/SelectMenu";
import { evalFormula } from "@/lib/formula";

/**
 * Renderiza os campos customizados aplicáveis à marca da tarefa (globais + da
 * marca), cada um com o input do seu tipo. Salva via updateTask(customFields).
 */
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted w-24 shrink-0 truncate text-xs font-medium">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

const inputCls =
  "border-border focus:border-border-strong w-full rounded-md border bg-transparent px-2 py-1 text-sm outline-none";

function ScalarInput({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const [v, setV] = useState(value);
  const commit = () => {
    if (v !== value) onChange(v);
  };
  if (def.type === "checkbox") {
    return (
      <button
        type="button"
        onClick={() => onChange(value === "1" ? "" : "1")}
        aria-pressed={value === "1"}
        aria-label={def.name}
        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
          value === "1" ? "border-accent bg-accent text-white" : "border-faint"
        }`}
      >
        {value === "1" && (
          <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" aria-hidden>
            <path
              d="M4 8.5l2.5 2.5L12 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    );
  }
  if (def.type === "currency") {
    return (
      <div className="flex items-center gap-1">
        <span className="text-faint text-sm">R$</span>
        <input
          type="number"
          inputMode="decimal"
          value={v}
          onChange={(e) => setV(e.target.value)}
          onBlur={commit}
          aria-label={def.name}
          className={inputCls}
        />
      </div>
    );
  }
  const type =
    def.type === "number"
      ? "number"
      : def.type === "date"
        ? "date"
        : def.type === "url"
          ? "url"
          : "text";
  return (
    <input
      type={type}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      aria-label={def.name}
      placeholder={def.type === "url" ? "https://…" : ""}
      className={inputCls}
    />
  );
}

export function CustomFields({ task }: { task: Task }) {
  const { fields, mutate, today } = useTaskBoard();
  const defs = fields.filter((f) => !f.brandId || f.brandId === task.brandId);
  if (defs.length === 0) return null;

  function setField(id: string, value: CustomFieldValue) {
    const next: Record<string, CustomFieldValue> = { ...task.customFields };
    if (value === "" || (Array.isArray(value) && value.length === 0))
      delete next[id];
    else next[id] = value;
    mutate(task.id, { customFields: next });
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-faint text-xs font-semibold tracking-wide uppercase">
        Campos
      </span>
      {defs.map((def) => {
        const raw = task.customFields[def.id];
        if (def.type === "formula") {
          const out = def.formula
            ? evalFormula(def.formula, task, today)
            : "";
          return (
            <Row key={def.id} label={def.name}>
              <span className={`text-sm ${out ? "text-fg" : "text-faint"}`}>
                {out || "—"}
              </span>
            </Row>
          );
        }
        if (def.type === "select") {
          const current = typeof raw === "string" ? raw : "";
          return (
            <Row key={def.id} label={def.name}>
              <SelectMenu
                ariaLabel={def.name}
                value={current}
                onChange={(val) => setField(def.id, val)}
                align="start"
                options={[
                  { value: "", label: "—" },
                  ...(def.options ?? []).map((o) => ({ value: o, label: o })),
                ]}
                triggerClassName="hover:bg-surface-2 flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-sm"
                trigger={
                  <span className={current ? "" : "text-faint"}>
                    {current || "—"}
                  </span>
                }
              />
            </Row>
          );
        }
        if (def.type === "multiselect") {
          const sel = new Set(Array.isArray(raw) ? raw : []);
          return (
            <Row key={def.id} label={def.name}>
              <div className="flex flex-wrap gap-1">
                {(def.options ?? []).map((o) => {
                  const on = sel.has(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => {
                        const next = on
                          ? [...sel].filter((x) => x !== o)
                          : [...sel, o];
                        setField(def.id, next);
                      }}
                      aria-pressed={on}
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        on
                          ? "border-accent bg-accent-soft text-fg"
                          : "border-border text-muted hover:bg-surface-2"
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </Row>
          );
        }
        return (
          <Row key={def.id} label={def.name}>
            <ScalarInput
              def={def}
              value={typeof raw === "string" ? raw : ""}
              onChange={(v) => setField(def.id, v)}
            />
          </Row>
        );
      })}
    </div>
  );
}
