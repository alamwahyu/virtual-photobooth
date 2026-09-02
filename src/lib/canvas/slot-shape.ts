import type { PhotoSlot } from "@/types";

export function normalizedSlotShape(slot: PhotoSlot) {
  return slot.shape || "miter";
}

export function photoRectForSlot(slot: PhotoSlot) {
  if (normalizedSlotShape(slot) !== "polaroid") return slot;
  const inset = Math.max(18, Math.min(slot.width, slot.height) * 0.055);
  const bottom = Math.max(70, slot.height * 0.18);
  return {
    ...slot,
    x: slot.x + inset,
    y: slot.y + inset,
    width: Math.max(1, slot.width - inset * 2),
    height: Math.max(1, slot.height - inset - bottom)
  };
}

export function addSlotPath(ctx: CanvasRenderingContext2D, slot: PhotoSlot) {
  const shape = normalizedSlotShape(slot);
  const rect = photoRectForSlot(slot);
  ctx.beginPath();

  if (shape === "oval") {
    ctx.ellipse(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width / 2, rect.height / 2, 0, 0, Math.PI * 2);
    return rect;
  }

  if (shape === "rounded") {
    const radius = Math.min(rect.width, rect.height) * 0.09;
    roundedRectPath(ctx, rect.x, rect.y, rect.width, rect.height, radius);
    return rect;
  }

  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  return rect;
}

export function drawSlotFrame(ctx: CanvasRenderingContext2D, slot: PhotoSlot, options?: { preview?: boolean }) {
  const shape = normalizedSlotShape(slot);
  if (shape === "polaroid") {
    ctx.save();
    ctx.fillStyle = options?.preview ? "rgba(255,255,255,0.92)" : "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = options?.preview ? 0 : 20;
    ctx.shadowOffsetY = options?.preview ? 0 : 10;
    ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
    ctx.restore();
    return;
  }

  if (!options?.preview) return;
  drawSlotBorder(ctx, slot, options);
}

export function drawSlotBorder(ctx: CanvasRenderingContext2D, slot: PhotoSlot, options?: { preview?: boolean }) {
  const borderWidth = slot.borderWidth ?? 0;
  if (!options?.preview && borderWidth <= 0) return;
  const shape = normalizedSlotShape(slot);

  ctx.save();
  ctx.strokeStyle = slot.borderColor || (shape === "oval" ? "rgba(181,139,75,0.95)" : "#b58b4b");
  ctx.lineWidth = borderWidth > 0 ? borderWidth : Math.max(3, slot.width / 140);
  addSlotPath(ctx, slot);
  ctx.stroke();
  ctx.restore();
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}
