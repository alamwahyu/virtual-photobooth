import { drawImageCover } from "@/lib/canvas/draw-image-cover";
import { loadImage } from "@/lib/canvas/load-image";
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
  if (type === "coupleName") return event.displayName;
  if (type === "eventDate") return compactDate(event.eventDate);
  if (type === "venue") return event.venueName;
  return fallback || "";
}

function drawText(ctx: CanvasRenderingContext2D, event: PublicEvent, frame: PublicFrame) {
  for (const text of frame.configJson.texts || []) {
    const value = textValue(text.type, event, text.value);
    if (!value) continue;
    ctx.save();
    ctx.fillStyle = text.color || event.textColor;
    ctx.textAlign = text.align || "center";
    ctx.textBaseline = "middle";
    const family = text.font === "serif" ? "Georgia, serif" : "Inter, sans-serif";
    ctx.font = `${text.fontSize}px ${family}`;
    ctx.fillText(value, text.x, text.y);
    ctx.restore();
  }
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

  for (const [index, slot] of layout.configJson.slots.entries()) {
    const photo = photos[index];
    if (!photo) continue;
    const image = await loadImage(photo);
    ctx.save();
    ctx.beginPath();
    ctx.rect(slot.x, slot.y, slot.width, slot.height);
    ctx.clip();
    if (frame.configJson.mirrorOutput ?? true) {
      ctx.translate(slot.x + slot.width, slot.y);
      ctx.scale(-1, 1);
      drawImageCover(ctx, image, 0, 0, slot.width, slot.height);
    } else {
      drawImageCover(ctx, image, slot.x, slot.y, slot.width, slot.height);
    }
    ctx.restore();
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
