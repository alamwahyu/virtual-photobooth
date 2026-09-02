import { drawImageCover } from "@/lib/canvas/draw-image-cover";
import { canvasFontFamily } from "@/lib/canvas/font-family";
import { loadImage } from "@/lib/canvas/load-image";
import { addSlotPath, drawSlotBorder, drawSlotFrame, photoRectForSlot } from "@/lib/canvas/slot-shape";
import { compactDate } from "@/lib/utils/format";
import type { PublicEvent, PublicFrame, PublicLayout } from "@/types";

type ComposeInput = {
  event: PublicEvent;
  layout: PublicLayout;
  frame: PublicFrame;
  photos: string[];
};

function drawDecorations(ctx: CanvasRenderingContext2D, frame: PublicFrame) {
  for (const item of frame.configJson.decorations || []) {
    if (item.type === "line") {
      ctx.save();
      ctx.strokeStyle = item.color || "#b58b4b";
      ctx.lineWidth = item.width || 2;
      ctx.beginPath();
      ctx.moveTo(item.x1, item.y1);
      ctx.lineTo(item.x2, item.y2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function textValue(type: string, event: PublicEvent, fallback?: string) {
  if (type === "eventTheme") return event.theme || fallback || "The Wedding of";
  if (type === "coupleName") return event.displayName;
  if (type === "eventDate") return compactDate(event.eventDate);
  if (type === "venue") return event.venueName;
  if (type === "branding") return fallback || "AWH Digital";
  return fallback || "";
}

function drawText(ctx: CanvasRenderingContext2D, event: PublicEvent, frame: PublicFrame) {
  for (const text of withDefaultCanvasTexts(frame.configJson.texts, layoutSafeHeight(frame))) {
    if (text.enabled === false) continue;
    const value = textValue(text.type, event, text.value);
    if (!value) continue;
    ctx.save();
    ctx.fillStyle = text.color || event.textColor;
    ctx.textAlign = text.align || "center";
    ctx.textBaseline = "middle";
    ctx.font = `${text.fontSize}px ${canvasFontFamily(text.font)}`;
    ctx.fillText(value, text.x, text.y);
    ctx.restore();
  }
}

function layoutSafeHeight(frame: PublicFrame) {
  const maxY = Math.max(1800, ...(frame.configJson.texts || []).map((text) => text.y));
  return maxY > 2200 ? 2500 : 1800;
}

function withDefaultCanvasTexts(texts: PublicFrame["configJson"]["texts"], height: number) {
  const existing = texts || [];
  const order = ["eventTheme", "coupleName", "venue", "eventDate", "branding"];
  const baseY = height >= 2400 ? 2185 : 1490;
  const defaults = [
    { type: "eventTheme", enabled: true, x: 600, y: baseY, font: "cinzel", fontSize: 30, color: "#8d714b", align: "center" as CanvasTextAlign },
    { type: "coupleName", enabled: true, x: 600, y: baseY + 60, font: "dancing", fontSize: 74, color: "#221f1c", align: "center" as CanvasTextAlign },
    { type: "venue", enabled: true, x: 600, y: baseY + 135, font: "montserrat", fontSize: 28, color: "#6f665d", align: "center" as CanvasTextAlign },
    { type: "eventDate", enabled: true, x: 600, y: baseY + 185, font: "cinzel", fontSize: 30, color: "#6f665d", align: "center" as CanvasTextAlign },
    { type: "branding", enabled: true, x: 600, y: baseY + 255, font: "montserrat", fontSize: 22, color: "#b58b4b", align: "center" as CanvasTextAlign }
  ];
  return [
    ...order.map((type) => existing.find((text) => text.type === type) || defaults.find((text) => text.type === type)).filter(Boolean),
    ...existing.filter((text) => !order.includes(text.type))
  ] as NonNullable<PublicFrame["configJson"]["texts"]>;
}

export async function composePhotobooth({ event, layout, frame, photos }: ComposeInput) {
  if (document.fonts) await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = layout.canvasWidth;
  canvas.height = layout.canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung oleh browser ini.");

  ctx.fillStyle = frame.backgroundColor || event.backgroundColor || "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (frame.backgroundImage) {
    const background = await loadImage(frame.backgroundImage);
    drawImageCover(ctx, background, 0, 0, canvas.width, canvas.height);
  }

  for (const [index, slot] of layout.configJson.slots.entries()) {
    const photo = photos[index];
    if (!photo) continue;
    const image = await loadImage(photo);
    drawSlotFrame(ctx, slot);
    const photoRect = photoRectForSlot(slot);
    ctx.save();
    addSlotPath(ctx, slot);
    ctx.clip();
    if (frame.configJson.mirrorOutput ?? true) {
      ctx.translate(photoRect.x + photoRect.width, photoRect.y);
      ctx.scale(-1, 1);
      drawImageCover(ctx, image, 0, 0, photoRect.width, photoRect.height);
    } else {
      drawImageCover(ctx, image, photoRect.x, photoRect.y, photoRect.width, photoRect.height);
    }
    ctx.restore();
    drawSlotBorder(ctx, slot);
  }

  if (frame.overlayImage) {
    const overlay = await loadImage(frame.overlayImage);
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
  }

  drawDecorations(ctx, frame);
  drawText(ctx, event, frame);

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality = 0.95) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Gagal membuat file gambar."))), type, quality);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
