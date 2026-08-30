import { describe, expect, it } from "vitest";
import { calculateImageContain, calculateImageCover } from "@/lib/canvas/draw-image-cover";

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

describe("calculateImageContain", () => {
  it("fits wide images inside portrait slots without cropping", () => {
    const rect = calculateImageContain(1920, 1080, 600, 900);
    expect(rect.destinationWidth).toBeCloseTo(600);
    expect(rect.destinationHeight).toBeCloseTo(337.5);
    expect(rect.destinationY).toBeCloseTo(281.25);
  });

  it("fits tall images inside wide slots without cropping", () => {
    const rect = calculateImageContain(900, 1600, 1200, 600);
    expect(rect.destinationWidth).toBeCloseTo(337.5);
    expect(rect.destinationHeight).toBeCloseTo(600);
    expect(rect.destinationX).toBeCloseTo(431.25);
  });
});
