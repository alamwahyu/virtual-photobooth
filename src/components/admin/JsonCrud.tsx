"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { appPath } from "@/lib/utils/base-path";
import { slugify } from "@/lib/utils/slug";
import type { FrameConfig, FrameText, FrameTextType } from "@/types";

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

export function LayoutEditor({ initial }: { initial?: Partial<LayoutItem> }) {
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
    <form onSubmit={submit} className="grid gap-3 rounded-lg bg-white p-5 shadow-soft">
      <div className="grid gap-3 md:grid-cols-2">
        <Label>Name<Input value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} onBlur={() => !item.slug && setItem({ ...item, slug: slugify(item.name) })} required /></Label>
        <Label>Slug<Input value={item.slug} onChange={(e) => setItem({ ...item, slug: slugify(e.target.value) })} required /></Label>
        <Label>Photo Count<Input type="number" min={1} value={item.photoCount} onChange={(e) => setItem({ ...item, photoCount: Number(e.target.value) })} /></Label>
        <Label>Orientation<Input value={item.orientation} onChange={(e) => setItem({ ...item, orientation: e.target.value })} /></Label>
        <Label>Canvas Width<Input type="number" value={item.canvasWidth} onChange={(e) => setItem({ ...item, canvasWidth: Number(e.target.value) })} /></Label>
        <Label>Canvas Height<Input type="number" value={item.canvasHeight} onChange={(e) => setItem({ ...item, canvasHeight: Number(e.target.value) })} /></Label>
        <Label>Preview Image<Input value={item.previewImage} onChange={(e) => setItem({ ...item, previewImage: e.target.value })} /></Label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.isActive} onChange={(e) => setItem({ ...item, isActive: e.target.checked })} />Active</label>
      </div>
      <Label>Description<Textarea value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} /></Label>
      <Label>Config JSON<Textarea value={JSON.stringify(item.configJson, null, 2)} onChange={(e) => { try { setItem({ ...item, configJson: JSON.parse(e.target.value) }); } catch { setError("JSON config tidak valid."); } }} /></Label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit">Simpan Layout</Button>
    </form>
  );
}

export function FrameEditor({ initial, layouts }: { initial?: Partial<FrameItem>; layouts: { id: string; name: string }[] }) {
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
    <form onSubmit={submit} className="grid gap-3 rounded-lg bg-white p-5 shadow-soft">
      <div className="grid gap-3 md:grid-cols-2">
        <Label>Name<Input value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} onBlur={() => !item.slug && setItem({ ...item, slug: slugify(item.name) })} required /></Label>
        <Label>Slug<Input value={item.slug} onChange={(e) => setItem({ ...item, slug: slugify(e.target.value) })} required /></Label>
        <Label>Compatible Layout<select className="min-h-11 rounded-md border border-black/15 px-3" value={item.layoutId} onChange={(e) => setItem({ ...item, layoutId: e.target.value })}>{layouts.map((layout) => <option key={layout.id} value={layout.id}>{layout.name}</option>)}</select></Label>
        <Label>Background Color<Input type="color" value={item.backgroundColor} onChange={(e) => setItem({ ...item, backgroundColor: e.target.value })} /></Label>
        <UploadUrlField label="Background Image URL" value={item.backgroundImage} kind="frames" onChange={(backgroundImage) => setItem({ ...item, backgroundImage })} />
        <UploadUrlField label="Overlay PNG/WebP URL" value={item.overlayImage} kind="frames" onChange={(overlayImage) => setItem({ ...item, overlayImage })} />
        <UploadUrlField label="Preview Image URL" value={item.previewImage} kind="frames" onChange={(previewImage) => setItem({ ...item, previewImage })} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.isActive} onChange={(e) => setItem({ ...item, isActive: e.target.checked })} />Active</label>
      </div>
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
      <Label>Config JSON<Textarea value={JSON.stringify(item.configJson, null, 2)} onChange={(e) => { try { setItem({ ...item, configJson: JSON.parse(e.target.value) }); } catch { setError("JSON config tidak valid."); } }} /></Label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit">Simpan Frame</Button>
    </form>
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
