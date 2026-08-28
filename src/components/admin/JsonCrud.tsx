"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { appPath } from "@/lib/utils/base-path";
import { slugify } from "@/lib/utils/slug";

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
    configJson: initial?.configJson || { mirrorOutput: true, texts: [{ type: "coupleName", x: 600, y: 1600, font: "serif", fontSize: 64, color: "#221f1c", align: "center" }] },
    isActive: initial?.isActive ?? true,
    id: initial?.id
  });
  const [error, setError] = useState("");

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
        <Label>Overlay PNG/WebP URL<Input value={item.overlayImage} onChange={(e) => setItem({ ...item, overlayImage: e.target.value })} /></Label>
        <Label>Preview Image URL<Input value={item.previewImage} onChange={(e) => setItem({ ...item, previewImage: e.target.value })} /></Label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.isActive} onChange={(e) => setItem({ ...item, isActive: e.target.checked })} />Active</label>
      </div>
      <Label>Config JSON<Textarea value={JSON.stringify(item.configJson, null, 2)} onChange={(e) => { try { setItem({ ...item, configJson: JSON.parse(e.target.value) }); } catch { setError("JSON config tidak valid."); } }} /></Label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit">Simpan Frame</Button>
    </form>
  );
}
