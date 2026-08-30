import { describe, expect, it } from "vitest";
import { calculateImageCover } from "@/lib/canvas/draw-image-cover";

describe("calculateImageCover", () => {
  it("crops wide images to cover portrait slots without stretching", () => {
    const rect = calculateImageCover(1920, 1080, 600, 900);
    expect(rect.sourceWidth).toBeCloseTo(720);
    expect(rect.sourceHeight).toBe(1080);
    expect(rect.sourceX).toBeCloseTo(600);
  });

  it("crops tall images to cover wide slots without stretching", () => {
    const rect = calculateImageCover(900, 1600, 1200, 600);
    expect(rect.sourceWidth).toBe(900);
    expect(rect.sourceHeight).toBeCloseTo(450);
    expect(rect.sourceY).toBeCloseTo(575);
  });
});
