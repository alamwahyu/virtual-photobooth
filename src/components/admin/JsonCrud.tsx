"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { appPath, assetPath } from "@/lib/utils/base-path";
import { slugify } from "@/lib/utils/slug";
import type { FrameConfig, FrameText, FrameTextType, LayoutConfig } from "@/types";

export type AdminLayoutOption = {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  configJson: unknown;
};

type LayoutItem = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  photoCount: number;
  orientation: string;
  canvasWidth: number;
  canvasHeight: number;
  previewImage: string;
  configJson: unknown;
  isActive: boolean;
};

type FrameItem = {
  id?: string;
  name: string;
  slug: string;
  layoutId: string;
  overlayImage: string;
  previewImage: string;
  backgroundColor: string;
  backgroundImage: string;
  configJson: unknown;
  isActive: boolean;
};

export function LayoutEditor({ initial, compact = false }: { initial?: Partial<LayoutItem>; compact?: boolean }) {
  const router = useRouter();
  const [item, setItem] = useState<LayoutItem>({
    name: initial?.name || "",
    slug: initial?.slug || "",
    description: initial?.description || "",
    photoCount: initial?.photoCount || 3,
    orientation: initial?.orientation || "portrait",
    canvasWidth: initial?.canvasWidth || 1200,
    canvasHeight: initial?.canvasHeight || 1800,
    previewImage: initial?.previewImage || "",
    configJson: initial?.configJson || { slots: [{ x: 80, y: 80, width: 1040, height: 1200 }] },
    isActive: initial?.isActive ?? true,
    id: initial?.id
  });
  const [error, setError] = useState("");
  const layoutConfig = normalizeLayoutConfig(item.configJson);

  function updateSlot(index: number, patch: Partial<LayoutConfig["slots"][number]>) {
    const slots = [...layoutConfig.slots];
    slots[index] = { ...slots[index], ...patch };
    setItem({ ...item, configJson: { ...layoutConfig, slots } });
  }

  function addSlot() {
    const slots = [
      ...layoutConfig.slots,
      {
        x: 80,
        y: 80 + layoutConfig.slots.length * 260,
        width: Math.max(240, item.canvasWidth - 160),
        height: 220
      }
    ];
    setItem({ ...item, photoCount: slots.length, configJson: { ...layoutConfig, slots } });
  }

  function removeSlot(index: number) {
    const slots = layoutConfig.slots.filter((_, slotIndex) => slotIndex !== index);
    setItem({ ...item, photoCount: Math.max(1, slots.length), configJson: { ...layoutConfig, slots } });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch(appPath(item.id ? `/api/admin/layouts/${item.id}` : "/api/admin/layouts"), {
      method: item.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...item, configJson: JSON.stringify(item.configJson) })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Gagal menyimpan layout." }));
      setError(data.error);
      return;
    }
    router.refresh();
    if (!item.id) setItem({ ...item, name: "", slug: "" });
  }

  return (
    <form onSubmit={submit} className={compact ? "rounded-md bg-white" : "rounded-lg border border-black/10 bg-white shadow-soft"}>
      <div className={compact ? "grid gap-0" : "grid gap-0 lg:grid-cols-[310px_1fr]"}>
        {!compact && (
        <aside className="border-b border-black/10 bg-linen/50 p-5 lg:border-b-0 lg:border-r">
          <div className="sticky top-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Layout Preview</p>
            <h3 className="mt-2 font-serif text-2xl">{item.name || "Layout Baru"}</h3>
            <p className="mt-1 text-sm text-black/55">{item.canvasWidth} x {item.canvasHeight} · {layoutConfig.slots.length} slot</p>
            <DynamicLayoutPreview layout={{ ...item, configJson: layoutConfig }} className="mt-4" />
          </div>
        </aside>
        )}
        <div className={compact ? "grid gap-5" : "grid gap-5 p-5"}>
          {compact && (
            <div className="grid gap-4 rounded-md border border-black/10 bg-linen/40 p-4 md:grid-cols-[220px_1fr]">
              <DynamicLayoutPreview layout={{ ...item, configJson: layoutConfig }} />
              <div className="self-center">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Preview Layout</p>
                <h3 className="mt-2 font-serif text-3xl">{item.name || "Layout"}</h3>
                <p className="mt-1 text-sm text-black/60">{item.canvasWidth} x {item.canvasHeight} · {layoutConfig.slots.length} slot · {item.orientation}</p>
              </div>
            </div>
          )}
          <section>
            <h3 className="font-serif text-2xl">Informasi Layout</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Label>Name<Input value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} onBlur={() => !item.slug && setItem({ ...item, slug: slugify(item.name) })} required /></Label>
              <Label>Slug<Input value={item.slug} onChange={(e) => setItem({ ...item, slug: slugify(e.target.value) })} required /></Label>
              <Label>Orientation<select className="min-h-11 rounded-md border border-black/15 px-3" value={item.orientation} onChange={(e) => setItem({ ...item, orientation: e.target.value })}><option value="portrait">Portrait</option><option value="landscape">Landscape</option><option value="square">Square</option></select></Label>
              <Label>Preview Image<Input value={item.previewImage} onChange={(e) => setItem({ ...item, previewImage: e.target.value })} placeholder="/uploads/layouts/layout.webp" /></Label>
              <Label>Description<Textarea value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} /></Label>
              <label className="flex items-center gap-2 self-end rounded-md border border-black/10 bg-linen/50 px-3 py-3 text-sm"><input type="checkbox" checked={item.isActive} onChange={(e) => setItem({ ...item, isActive: e.target.checked })} />Active</label>
            </div>
          </section>

          <section className="rounded-md border border-black/10 bg-linen/60 p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 className="font-serif text-2xl">Canvas</h3>
                <p className="text-sm text-black/60">Ukuran hasil akhir dan jumlah pose yang akan dicapture.</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black/55">{item.photoCount} pose</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Label>Canvas Width<Input type="number" min={600} value={item.canvasWidth} onChange={(e) => setItem({ ...item, canvasWidth: Number(e.target.value) })} /></Label>
              <Label>Canvas Height<Input type="number" min={600} value={item.canvasHeight} onChange={(e) => setItem({ ...item, canvasHeight: Number(e.target.value) })} /></Label>
              <Label>Photo Count<Input type="number" min={1} value={item.photoCount} onChange={(e) => setItem({ ...item, photoCount: Number(e.target.value) })} /></Label>
            </div>
          </section>

          <section className="rounded-md border border-black/10 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
              <div>
                <h3 className="font-serif text-2xl">Photo Slots</h3>
                <p className="text-sm text-black/60">Atur posisi foto pada canvas. Nilai memakai pixel dari ukuran canvas asli.</p>
              </div>
              <Button type="button" variant="secondary" onClick={addSlot}>Tambah Slot</Button>
            </div>
            <div className="grid gap-3 p-4">
              {layoutConfig.slots.map((slot, index) => (
                <div key={`${slot.x}-${slot.y}-${index}`} className="grid gap-3 rounded-md bg-linen/60 p-3 md:grid-cols-[80px_repeat(4,1fr)_auto] md:items-end">
                  <div className="font-medium">Foto {index + 1}</div>
                  <Label>X<Input type="number" value={slot.x} onChange={(e) => updateSlot(index, { x: Number(e.target.value) })} /></Label>
                  <Label>Y<Input type="number" value={slot.y} onChange={(e) => updateSlot(index, { y: Number(e.target.value) })} /></Label>
                  <Label>Width<Input type="number" min={1} value={slot.width} onChange={(e) => updateSlot(index, { width: Number(e.target.value) })} /></Label>
                  <Label>Height<Input type="number" min={1} value={slot.height} onChange={(e) => updateSlot(index, { height: Number(e.target.value) })} /></Label>
                  <Button type="button" variant="secondary" onClick={() => removeSlot(index)} disabled={layoutConfig.slots.length <= 1}>Hapus</Button>
                </div>
              ))}
            </div>
          </section>

          <details className="rounded-md border border-black/10 bg-white">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Advanced JSON Config</summary>
            <div className="border-t border-black/10 p-4">
              <Label>Config JSON<Textarea value={JSON.stringify(item.configJson, null, 2)} onChange={(e) => { try { setItem({ ...item, configJson: JSON.parse(e.target.value) }); } catch { setError("JSON config tidak valid."); } }} /></Label>
            </div>
          </details>
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit">Simpan Layout</Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export function DynamicLayoutPreview({ layout, className = "" }: { layout: Partial<LayoutItem> & { configJson?: unknown }; className?: string }) {
  const width = layout.canvasWidth || 1200;
  const height = layout.canvasHeight || 1800;
  const config = normalizeLayoutConfig(layout.configJson);

  return (
    <div className={`overflow-hidden rounded-lg border border-black/10 bg-white p-3 shadow-sm ${className}`}>
      <div
        className="relative mx-auto w-full overflow-hidden rounded-md bg-[#faf6ef]"
        style={{
          aspectRatio: `${width} / ${height}`,
          maxHeight: "360px",
          backgroundImage: "linear-gradient(45deg, rgba(181,139,75,0.10) 25%, transparent 25%), linear-gradient(-45deg, rgba(181,139,75,0.10) 25%, transparent 25%)",
          backgroundSize: "18px 18px"
        }}
      >
        {config.slots.map((slot, index) => (
          <div
            key={`${slot.x}-${slot.y}-${slot.width}-${slot.height}-${index}`}
            className="absolute grid place-items-center rounded-sm border border-gold/80 bg-white/85 text-[10px] font-semibold uppercase tracking-wide text-gold shadow-sm"
            style={{
              left: `${(slot.x / width) * 100}%`,
              top: `${(slot.y / height) * 100}%`,
              width: `${(slot.width / width) * 100}%`,
              height: `${(slot.height / height) * 100}%`
            }}
          >
            Foto {index + 1}
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-black/55">
        <span>{width} x {height}</span>
        <span className="text-right">{config.slots.length} slot</span>
      </div>
    </div>
  );
}

export function FrameEditor({ initial, layouts, compact = false }: { initial?: Partial<FrameItem>; layouts: AdminLayoutOption[]; compact?: boolean }) {
  const router = useRouter();
  const [item, setItem] = useState<FrameItem>({
    name: initial?.name || "",
    slug: initial?.slug || "",
    layoutId: initial?.layoutId || layouts[0]?.id || "",
    overlayImage: initial?.overlayImage || "",
    previewImage: initial?.previewImage || "",
    backgroundColor: initial?.backgroundColor || "#ffffff",
    backgroundImage: initial?.backgroundImage || "",
    configJson: initial?.configJson || { mirrorOutput: true, texts: [{ type: "coupleName", x: 600, y: 1600, font: "serif", fontSize: 64, color: "#221f1c", align: "center" }] },
    isActive: initial?.isActive ?? true,
    id: initial?.id
  });
  const [error, setError] = useState("");

  const frameConfig = normalizeFrameConfig(item.configJson);
  const selectedLayout = layouts.find((layout) => layout.id === item.layoutId);

  function updateText(type: FrameTextType, patch: Partial<FrameText>) {
    const current = normalizeFrameConfig(item.configJson);
    const texts = [...(current.texts || [])];
    const index = texts.findIndex((text) => text.type === type);
    const existing = index >= 0 ? texts[index] : defaultText(type);
    const next = { ...existing, ...patch };
    if (index >= 0) texts[index] = next;
    else texts.push(next);
    setItem({ ...item, configJson: { ...current, texts } });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch(appPath(item.id ? `/api/admin/frames/${item.id}` : "/api/admin/frames"), {
      method: item.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...item, configJson: JSON.stringify(item.configJson) })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Gagal menyimpan frame." }));
      setError(data.error);
      return;
    }
    router.refresh();
    if (!item.id) setItem({ ...item, name: "", slug: "" });
  }

  return (
    <form onSubmit={submit} className={compact ? "rounded-md bg-white" : "rounded-lg border border-black/10 bg-white shadow-soft"}>
      <div className={compact ? "grid gap-0" : "grid gap-0 lg:grid-cols-[310px_1fr]"}>
        {!compact && (
        <aside className="border-b border-black/10 bg-linen/50 p-5 lg:border-b-0 lg:border-r">
          <div className="sticky top-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Live Preview</p>
            <h3 className="mt-2 font-serif text-2xl">{item.name || "Frame Baru"}</h3>
            <p className="mt-1 text-sm text-black/55">{selectedLayout?.name || "Pilih layout"}</p>
            <DynamicFramePreview frame={{ ...item, configJson: frameConfig }} layout={selectedLayout} className="mt-4" />
          </div>
        </aside>
        )}
        <div className={compact ? "grid gap-5" : "grid gap-5 p-5"}>
          {compact && (
            <div className="grid gap-4 rounded-md border border-black/10 bg-linen/40 p-4 md:grid-cols-[220px_1fr]">
              <DynamicFramePreview frame={{ ...item, configJson: frameConfig }} layout={selectedLayout} />
              <div className="self-center">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Preview Frame</p>
                <h3 className="mt-2 font-serif text-3xl">{item.name || "Frame"}</h3>
                <p className="mt-1 text-sm text-black/60">{selectedLayout?.name || "Pilih layout"} · {item.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          )}
          <section className="grid gap-3 md:grid-cols-2">
            <Label>Name<Input value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} onBlur={() => !item.slug && setItem({ ...item, slug: slugify(item.name) })} required /></Label>
            <Label>Slug<Input value={item.slug} onChange={(e) => setItem({ ...item, slug: slugify(e.target.value) })} required /></Label>
            <Label>Compatible Layout<select className="min-h-11 rounded-md border border-black/15 px-3" value={item.layoutId} onChange={(e) => setItem({ ...item, layoutId: e.target.value })}>{layouts.map((layout) => <option key={layout.id} value={layout.id}>{layout.name}</option>)}</select></Label>
            <Label>Background Color<Input type="color" value={item.backgroundColor} onChange={(e) => setItem({ ...item, backgroundColor: e.target.value })} /></Label>
            <UploadUrlField label="Background Image URL" value={item.backgroundImage} kind="frames" onChange={(backgroundImage) => setItem({ ...item, backgroundImage })} />
            <UploadUrlField label="Overlay PNG/WebP URL" value={item.overlayImage} kind="frames" onChange={(overlayImage) => setItem({ ...item, overlayImage })} />
            <UploadUrlField label="Preview Image URL" value={item.previewImage} kind="frames" onChange={(previewImage) => setItem({ ...item, previewImage })} />
            <label className="flex items-center gap-2 self-end rounded-md border border-black/10 bg-linen/50 px-3 py-3 text-sm"><input type="checkbox" checked={item.isActive} onChange={(e) => setItem({ ...item, isActive: e.target.checked })} />Active</label>
          </section>
          <section className="rounded-md border border-black/10 bg-linen/60 p-4">
            <h3 className="font-serif text-2xl">Styling Informasi</h3>
            <p className="mt-1 text-sm text-black/60">Atur posisi dan gaya teks nama pasangan, tanggal, dan tempat pada hasil final.</p>
            <div className="mt-4 grid gap-4">
              {(["coupleName", "eventDate", "venue"] as const).map((type) => {
                const text = frameConfig.texts?.find((entry) => entry.type === type) || defaultText(type);
                return (
                  <div key={type} className="grid gap-3 rounded-md bg-white p-3 md:grid-cols-6">
                    <div className="font-medium md:col-span-6">{textLabel(type)}</div>
                    <Label>X<Input type="number" value={text.x} onChange={(e) => updateText(type, { x: Number(e.target.value) })} /></Label>
                    <Label>Y<Input type="number" value={text.y} onChange={(e) => updateText(type, { y: Number(e.target.value) })} /></Label>
                    <Label>Font Size<Input type="number" value={text.fontSize} onChange={(e) => updateText(type, { fontSize: Number(e.target.value) })} /></Label>
                    <Label>Color<Input type="color" value={text.color || "#221f1c"} onChange={(e) => updateText(type, { color: e.target.value })} /></Label>
                    <Label>Font<select className="min-h-11 rounded-md border border-black/15 px-3" value={text.font || "sans-serif"} onChange={(e) => updateText(type, { font: e.target.value })}><option value="serif">Serif</option><option value="sans-serif">Sans</option></select></Label>
                    <Label>Align<select className="min-h-11 rounded-md border border-black/15 px-3" value={text.align || "center"} onChange={(e) => updateText(type, { align: e.target.value as CanvasTextAlign })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></Label>
                  </div>
                );
              })}
            </div>
          </section>
          <details className="rounded-md border border-black/10 bg-white">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Advanced JSON Config</summary>
            <div className="border-t border-black/10 p-4">
              <Label>Config JSON<Textarea value={JSON.stringify(item.configJson, null, 2)} onChange={(e) => { try { setItem({ ...item, configJson: JSON.parse(e.target.value) }); } catch { setError("JSON config tidak valid."); } }} /></Label>
            </div>
          </details>
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit">Simpan Frame</Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export function DynamicFramePreview({
  frame,
  layout,
  className = ""
}: {
  frame: Partial<FrameItem> & { configJson?: unknown };
  layout?: AdminLayoutOption;
  className?: string;
}) {
  const config = normalizeFrameConfig(frame.configJson);
  const layoutConfig = normalizeLayoutConfig(layout?.configJson);
  const width = layout?.canvasWidth || 1200;
  const height = layout?.canvasHeight || 1800;
  const aspectRatio = `${width} / ${height}`;

  return (
    <div className={`overflow-hidden rounded-lg border border-black/10 bg-white p-3 shadow-sm ${className}`}>
      <div
        className="relative mx-auto w-full overflow-hidden rounded-md bg-cover bg-center"
        style={{
          aspectRatio,
          maxHeight: "360px",
          backgroundColor: frame.backgroundColor || "#ffffff",
          backgroundImage: frame.backgroundImage ? `url(${assetPath(frame.backgroundImage)})` : undefined
        }}
      >
        {layoutConfig.slots.map((slot, index) => (
          <div
            key={`${slot.x}-${slot.y}-${index}`}
            className="absolute grid place-items-center border border-white/85 bg-black/20 text-[10px] font-semibold uppercase tracking-wide text-white shadow-inner"
            style={{
              left: `${(slot.x / width) * 100}%`,
              top: `${(slot.y / height) * 100}%`,
              width: `${(slot.width / width) * 100}%`,
              height: `${(slot.height / height) * 100}%`
            }}
          >
            Foto {index + 1}
          </div>
        ))}
        {frame.overlayImage && <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${assetPath(frame.overlayImage)})` }} />}
        {(config.texts || []).map((text, index) => (
          <div
            key={`${text.type}-${index}`}
            className={text.font === "serif" ? "absolute whitespace-nowrap font-serif" : "absolute whitespace-nowrap font-sans"}
            style={{
              left: `${(text.x / width) * 100}%`,
              top: `${(text.y / height) * 100}%`,
              color: text.color || "#221f1c",
              fontSize: `${Math.max(8, (text.fontSize / width) * 260)}px`,
              transform: text.align === "right" ? "translate(-100%, -50%)" : text.align === "left" ? "translate(0, -50%)" : "translate(-50%, -50%)",
              textAlign: text.align || "center",
              textShadow: "0 1px 2px rgba(255,255,255,0.55)"
            }}
          >
            {previewText(text)}
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-black/55">
        <span>{width} x {height}</span>
        <span className="text-right">{layoutConfig.slots.length} slot</span>
      </div>
    </div>
  );
}

function defaultText(type: FrameTextType): FrameText {
  const y = type === "coupleName" ? 1600 : type === "eventDate" ? 1670 : 1725;
  return {
    type,
    x: 600,
    y,
    font: type === "coupleName" ? "serif" : "sans-serif",
    fontSize: type === "coupleName" ? 64 : 30,
    color: "#221f1c",
    align: "center"
  };
}

function textLabel(type: FrameTextType) {
  if (type === "coupleName") return "Nama Pasangan";
  if (type === "eventDate") return "Tanggal";
  if (type === "venue") return "Tempat";
  return "Custom";
}

function normalizeFrameConfig(value: unknown): FrameConfig {
  if (!value || typeof value !== "object") return { mirrorOutput: true, texts: [defaultText("coupleName"), defaultText("eventDate"), defaultText("venue")] };
  const config = value as FrameConfig;
  return {
    ...config,
    mirrorOutput: config.mirrorOutput ?? true,
    texts: config.texts || [defaultText("coupleName"), defaultText("eventDate"), defaultText("venue")]
  };
}

function normalizeLayoutConfig(value: unknown): LayoutConfig {
  if (!value || typeof value !== "object") return { slots: [{ x: 80, y: 80, width: 1040, height: 1200 }] };
  const config = value as LayoutConfig;
  if (!Array.isArray(config.slots)) return { slots: [] };
  return config;
}

function previewText(text: FrameText) {
  if (text.type === "coupleName") return "Alam & Ghina";
  if (text.type === "eventDate") return "30.09.2026";
  if (text.type === "venue") return "Edelweiss Wedding Hall";
  return text.value || "Custom Text";
}

function UploadUrlField({ label, value, kind, onChange }: { label: string; value: string; kind: "events" | "frames" | "layouts" | "uploads"; onChange: (value: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.set("file", file);
    const response = await fetch(appPath(`/api/admin/upload?kind=${kind}`), { method: "POST", body: form });
    setUploading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Upload gagal." }));
      setError(data.error);
      return;
    }
    const data = (await response.json()) as { url: string };
    onChange(data.url);
  }

  return (
    <div className="space-y-1 text-sm font-medium">
      <span>{label}</span>
      <div className="flex gap-2">
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="/uploads/frames/frame.png" />
        <label className="touch-target inline-flex cursor-pointer items-center rounded-md border border-black/15 bg-white px-3 text-sm font-semibold hover:bg-linen">
          {uploading ? "Uploading..." : "Upload"}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} />
        </label>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
