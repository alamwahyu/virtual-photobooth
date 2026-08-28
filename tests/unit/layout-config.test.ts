import { describe, expect, it } from "vitest";
import type { LayoutConfig } from "@/types";

function validateLayoutConfig(config: LayoutConfig, count: number) {
  return config.slots.length === count && config.slots.every((slot) => slot.width > 0 && slot.height > 0);
}

describe("layout config", () => {
  it("validates slot count and dimensions", () => {
    expect(validateLayoutConfig({ slots: [{ x: 0, y: 0, width: 100, height: 100 }] }, 1)).toBe(true);
    expect(validateLayoutConfig({ slots: [{ x: 0, y: 0, width: 0, height: 100 }] }, 1)).toBe(false);
  });
});
