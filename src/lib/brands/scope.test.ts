import { describe, it, expect } from "vitest";
import type { AccessScope } from "@/types";
import {
  assertBrandInScope,
  isBrandInScope,
  resolveScopedBrand,
  scopedBrands,
} from "./scope";

const scope: AccessScope = {
  userId: "u-test",
  allowedBrandIds: ["farm", "animale"],
  role: "editor",
};

describe("escopo de marca (server-side)", () => {
  it("scopedBrands devolve só as marcas permitidas", () => {
    expect(
      scopedBrands(scope)
        .map((b) => b.id)
        .sort(),
    ).toEqual(["animale", "farm"]);
  });

  it("isBrandInScope reflete o escopo", () => {
    expect(isBrandInScope(scope, "farm")).toBe(true);
    expect(isBrandInScope(scope, "carol-bassi")).toBe(false);
  });

  it("resolveScopedBrand ignora marca fora do escopo (não confia no client)", () => {
    expect(resolveScopedBrand(scope, "farm")?.id).toBe("farm");
    expect(resolveScopedBrand(scope, "carol-bassi")).toBeUndefined();
    expect(resolveScopedBrand(scope, undefined)).toBeUndefined();
  });

  it("assertBrandInScope lança fora do escopo", () => {
    expect(() => assertBrandInScope(scope, "carol-bassi")).toThrow(/escopo/i);
    expect(() => assertBrandInScope(scope, "farm")).not.toThrow();
  });
});
