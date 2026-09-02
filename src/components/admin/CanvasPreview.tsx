"use client";

import { useEffect, useRef, useState } from "react";
import { drawImageCover } from "@/lib/canvas/draw-image-cover";
import { canvasFontFamily } from "@/lib/canvas/font-family";
import { loadImage } from "@/lib/canvas/load-image";
import { addSlotPath, drawSlotBorder, drawSlotFrame, normalizedSlotShape, photoRectForSlot } from "@/lib/canvas/slot-shape";
import type { FrameConfig, FrameText, LayoutConfig } from "@/types";

type LayoutPreviewInput = {
  canvasWidth?: number;
  canvasHeight?: number;
  configJson?: unknown;
};

type FramePreviewInput = {
  backgroundColor?: string;
  backgroundImage?: string;
  overlayImage?: string;
  configJson?: unknown;
};

export function ExactLayoutPreview({ layout, className = "" }: { layout: LayoutPreviewInput; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const width = layout.canvasWidth || 1200;
  const height = layout.canvasHeight || 1800;
  const config = normalizeLayoutConfig(layout.configJson);

  useEffect(() => {
    async function render() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      if (document.fonts) await document.fonts.ready;
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = "#faf6ef";
      ctx.fillRect(0, 0, width, height);
      drawChecker(ctx, width, height);
      config.slots.forEach((slot, index) => {
        ctx.save();
        drawSlotFrame(ctx, slot, { preview: true });
        const photoRect = photoRectForSlot(slot);
        addSlotPath(ctx, slot);
        ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
        ctx.fill();
        drawSlotBorder(ctx, slot, { preview: true });
        ctx.fillStyle = "#b58b4b";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${Math.max(22, width / 40)}px sans-serif`;
        ctx.fillText(`Foto ${index + 1}`, photoRect.x + photoRect.width / 2, photoRect.y + photoRect.height / 2);
        ctx.font = `${Math.max(14, width / 70)}px sans-serif`;
        ctx.fillText(normalizedSlotShape(slot), photoRect.x + photoRect.width / 2, photoRect.y + photoRect.height / 2 + Math.max(32, width / 26));
        ctx.restore();
      });
    }
    render();
  }, [config, height, width]);

  return <PreviewShell width={width} height={height} slots={config.slots.length} className={className} canvasRef={canvasRef} />;
}

export function ExactFramePreview({ frame, layout, className = "" }: { frame: FramePreviewInput; layout?: LayoutPreviewInput; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState("");
  const width = layout?.canvasWidth || 1200;
  const height = layout?.canvasHeight || 1800;
  const layoutConfig = normalizeLayoutConfig(layout?.configJson);
  const frameConfig = normalizeFrameConfig(frame.configJson);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      canvas.width = width;
      canvas.height = height;
      setError("");
      if (document.fonts) await document.fonts.ready;

      ctx.fillStyle = frame.backgroundColor || "#ffffff";
      ctx.fillRect(0, 0, width, height);

      try {
        if (frame.backgroundImage) {
          const background = await loadImage(frame.backgroundImage);
          if (cancelled) return;
          drawImageCover(ctx, background, 0, 0, width, height);
        }

        layoutConfig.slots.forEach((slot, index) => {
          ctx.save();
          drawSlotFrame(ctx, slot, { preview: true });
          const photoRect = photoRectForSlot(slot);
          addSlotPath(ctx, slot);
          ctx.fillStyle = "rgba(20, 20, 20, 0.24)";
          ctx.fill();
          drawSlotBorder(ctx, slot, { preview: true });
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `${Math.max(20, width / 48)}px sans-serif`;
          ctx.fillText(`Foto ${index + 1}`, photoRect.x + photoRect.width / 2, photoRect.y + photoRect.height / 2);
          ctx.restore();
        });

        if (frame.overlayImage) {
          const overlay = await loadImage(frame.overlayImage);
          if (cancelled) return;
          ctx.drawImage(overlay, 0, 0, width, height);
        }

        frameConfig.texts.filter((text) => text.enabled !== false).forEach((text) => drawPreviewText(ctx, text));
      } catch (renderError) {
        if (!cancelled) setError(renderError instanceof Error ? renderError.message : "Preview gagal dimuat.");
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [frame.backgroundColor, frame.backgroundImage, frame.overlayImage, frameConfig, height, layoutConfig, width]);

  return (
    <div className="space-y-2">
      <PreviewShell width={width} height={height} slots={layoutConfig.slots.length} className={className} canvasRef={canvasRef} />
      {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}

function PreviewShell({
  width,
  height,
  slots,
  className,
  canvasRef
}: {
  width: number;
  height: number;
  slots: number;
  className: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  return (
    <div className={`overflow-hidden rounded-lg border border-black/10 bg-white p-3 shadow-sm ${className}`}>
      <canvas ref={canvasRef} className="mx-auto block h-auto max-h-[360px] w-full rounded-md object-contain" style={{ aspectRatio: `${width} / ${height}` }} />
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-black/55">
        <span>{width} x {height}</span>
        <span className="text-right">{slots} slot</span>
      </div>
    </div>
  );
}

function drawChecker(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const size = Math.max(36, width / 48);
  ctx.save();
  ctx.fillStyle = "rgba(181, 139, 75, 0.10)";
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      if ((x / size + y / size) % 2 === 0) ctx.fillRect(x, y, size, size);
    }
  }
  ctx.restore();
}

function drawPreviewText(ctx: CanvasRenderingContext2D, text: FrameText) {
  ctx.save();
  ctx.fillStyle = text.color || "#221f1c";
  ctx.textAlign = text.align || "center";
  ctx.textBaseline = "middle";
  ctx.font = `${text.fontSize}px ${canvasFontFamily(text.font)}`;
  ctx.shadowColor = "rgba(255, 255, 255, 0.55)";
  ctx.shadowBlur = 2;
  ctx.fillText(previewText(text), text.x, text.y);
  ctx.restore();
}

function normalizeLayoutConfig(value: unknown): LayoutConfig {
  if (!value || typeof value !== "object") return { slots: [{ x: 80, y: 80, width: 1040, height: 1200 }] };
  const config = value as LayoutConfig;
  if (!Array.isArray(config.slots)) return { slots: [] };
  return config;
}

function normalizeFrameConfig(value: unknown): Required<Pick<FrameConfig, "texts">> {
  if (!value || typeof value !== "object") return { texts: [] };
  const config = value as FrameConfig;
  return { texts: config.texts || [] };
}

function previewText(text: FrameText) {
  if (text.type === "eventTheme") return "The Wedding of";
  if (text.type === "coupleName") return "Alam & Ghina";
  if (text.type === "venue") return "Edelweiss Wedding Hall";
  if (text.type === "eventDate") return "30.09.2026";
  if (text.type === "branding") return text.value || "AWH Digital";
  return text.value || "Custom Text";
}
