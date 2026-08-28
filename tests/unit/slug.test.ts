import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/utils/slug";

describe("slugify", () => {
  it("creates URL-safe wedding slugs", () => {
    expect(slugify("Alam & Ghina Wedding!")).toBe("alam-ghina-wedding");
  });
});
