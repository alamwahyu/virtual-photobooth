"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExactFramePreview, ExactLayoutPreview } from "@/components/admin/CanvasPreview";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { appPath } from "@/lib/utils/base-path";
import { slugify } from "@/lib/utils/slug";
import type { FrameConfig, FrameText, FrameTextType, LayoutConfig, PhotoSlotShape } from "@/types";

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
    configJson: initial?.configJson || { slots: [{ x: 80, y: 80, width: 1040, height: 1200, shape: "miter" }] },
    isActive: initial?.isActive ?? true,
    id: initial?.id
  });
  const [createFrame, setCreateFrame] = useState(false);
  const [draftFrame, setDraftFrame] = useState<Omit<FrameItem, "layoutId">>({
    name: "",
    slug: "",
    overlayImage: "",
    previewImage: "",
    backgroundColor: "#ffffff",
    backgroundImage: "",
    configJson: {
      mirrorOutput: true,
      texts: [defaultText("eventTheme"), defaultText("coupleName"), defaultText("venue"), defaultText("eventDate"), defaultText("branding")]
    },
    isActive: true
  });
  const [error, setError] = useState("");
  const layoutConfig = normalizeLayoutConfig(item.configJson);
  const draftLayoutOption: AdminLayoutOption = {
    id: item.id || "new-layout",
    name: item.name || "Layout Baru",
    canvasWidth: item.canvasWidth,
    canvasHeight: item.canvasHeight,
    configJson: layoutConfig
  };

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
        height: 220,
        shape: "miter" as PhotoSlotShape
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
    if (!item.id && createFrame && (!draftFrame.name || !draftFrame.slug)) {
      setError("Nama dan slug frame wajib diisi jika opsi tambah frame aktif.");
      return;
    }

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

    const savedLayout = (await response.json()) as { id: string };
    if (!item.id && createFrame) {
      const frameResponse = await fetch(appPath("/api/admin/frames"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...draftFrame,
          layoutId: savedLayout.id,
          configJson: JSON.stringify(draftFrame.configJson)
        })
      });
      if (!frameResponse.ok) {
        const data = await frameResponse.json().catch(() => ({ error: "Layout tersimpan, tetapi frame gagal dibuat." }));
        setError(`Layout tersimpan, tetapi frame gagal dibuat: ${data.error}`);
        router.refresh();
        return;
      }
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
            <ExactLayoutPreview layout={{ ...item, configJson: layoutConfig }} className="mt-4" />
          </div>
        </aside>
        )}
        <div className={compact ? "grid gap-5" : "grid gap-5 p-5"}>
          {compact && (
            <div className="grid gap-4 rounded-md border border-black/10 bg-linen/40 p-4 md:grid-cols-[220px_1fr]">
              <ExactLayoutPreview layout={{ ...item, configJson: layoutConfig }} />
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
                <p className="text-sm text-black/60">Atur posisi foto dan bentuk sudut bingkai. Nilai memakai pixel dari ukuran canvas asli.</p>
              </div>
              <Button type="button" variant="secondary" onClick={addSlot}>Tambah Slot</Button>
            </div>
            <div className="grid gap-3 p-4">
              {layoutConfig.slots.map((slot, index) => (
                <div key={`${slot.x}-${slot.y}-${index}`} className="grid gap-3 rounded-md bg-linen/60 p-3 md:grid-cols-[80px_repeat(5,1fr)_auto] md:items-end">
                  <div className="font-medium">Foto {index + 1}</div>
                  <Label>X<Input type="number" value={slot.x} onChange={(e) => updateSlot(index, { x: Number(e.target.value) })} /></Label>
                  <Label>Y<Input type="number" value={slot.y} onChange={(e) => updateSlot(index, { y: Number(e.target.value) })} /></Label>
                  <Label>Width<Input type="number" min={1} value={slot.width} onChange={(e) => updateSlot(index, { width: Number(e.target.value) })} /></Label>
                  <Label>Height<Input type="number" min={1} value={slot.height} onChange={(e) => updateSlot(index, { height: Number(e.target.value) })} /></Label>
                  <Label>Bentuk<select className="min-h-11 rounded-md border border-black/15 px-3" value={slot.shape || "miter"} onChange={(e) => updateSlot(index, { shape: e.target.value as PhotoSlotShape })}><option value="miter">Kotak / Miter</option><option value="rounded">Oval / Rounded</option><option value="oval">Oval Penuh</option><option value="polaroid">Polaroid</option></select></Label>
                  <Button type="button" variant="secondary" onClick={() => removeSlot(index)} disabled={layoutConfig.slots.length <= 1}>Hapus</Button>
                </div>
              ))}
            </div>
          </section>

          {!item.id && (
            <section className="rounded-md border border-black/10 bg-white">
              <div className="flex flex-col justify-between gap-3 border-b border-black/10 px-4 py-3 md:flex-row md:items-center">
                <div>
                  <h3 className="font-serif text-2xl">Frame Opsional</h3>
                  <p className="text-sm text-black/60">Buat frame pertama untuk layout ini dalam sekali submit.</p>
                </div>
                <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-linen px-3 py-2 text-xs font-semibold">
                  <input type="checkbox" checked={createFrame} onChange={(event) => setCreateFrame(event.target.checked)} />
                  {createFrame ? "On" : "Off"}
                </label>
              </div>
              {createFrame && (
                <div className="grid gap-4 p-4 lg:grid-cols-[240px_1fr]">
                  <ExactFramePreview frame={draftFrame} layout={draftLayoutOption} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Label>Frame Name<Input value={draftFrame.name} onChange={(event) => setDraftFrame({ ...draftFrame, name: event.target.value })} onBlur={() => !draftFrame.slug && setDraftFrame({ ...draftFrame, slug: slugify(draftFrame.name) })} required={createFrame} /></Label>
                    <Label>Frame Slug<Input value={draftFrame.slug} onChange={(event) => setDraftFrame({ ...draftFrame, slug: slugify(event.target.value) })} required={createFrame} /></Label>
                    <Label>Background Color<Input type="color" value={draftFrame.backgroundColor} onChange={(event) => setDraftFrame({ ...draftFrame, backgroundColor: event.target.value })} /></Label>
                    <label className="flex items-center gap-2 self-end rounded-md border border-black/10 bg-linen/50 px-3 py-3 text-sm"><input type="checkbox" checked={draftFrame.isActive} onChange={(event) => setDraftFrame({ ...draftFrame, isActive: event.target.checked })} />Active</label>
                    <UploadUrlField label="Background Image URL" value={draftFrame.backgroundImage} kind="frames" onChange={(backgroundImage) => setDraftFrame({ ...draftFrame, backgroundImage })} />
                    <UploadUrlField label="Overlay PNG/WebP URL" value={draftFrame.overlayImage} kind="frames" onChange={(overlayImage) => setDraftFrame({ ...draftFrame, overlayImage })} />
                    <UploadUrlField label="Preview Image URL" value={draftFrame.previewImage} kind="frames" onChange={(previewImage) => setDraftFrame({ ...draftFrame, previewImage })} />
                  </div>
                </div>
              )}
            </section>
          )}

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
  return <ExactLayoutPreview layout={layout} className={className} />;
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
    configJson: initial?.configJson || {
      mirrorOutput: true,
      texts: [defaultText("eventTheme"), defaultText("coupleName"), defaultText("venue"), defaultText("eventDate"), defaultText("branding")]
    },
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
            <ExactFramePreview frame={{ ...item, configJson: frameConfig }} layout={selectedLayout} className="mt-4" />
          </div>
        </aside>
        )}
        <div className={compact ? "grid gap-5" : "grid gap-5 p-5"}>
          {compact && (
            <div className="grid gap-4 rounded-md border border-black/10 bg-linen/40 p-4 md:grid-cols-[220px_1fr]">
              <ExactFramePreview frame={{ ...item, configJson: frameConfig }} layout={selectedLayout} />
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
              {(["eventTheme", "coupleName", "venue", "eventDate", "branding"] as const).map((type) => {
                const text = frameConfig.texts?.find((entry) => entry.type === type) || defaultText(type);
                return (
                  <div key={type} className={`grid gap-3 rounded-md bg-white p-3 transition md:grid-cols-6 ${text.enabled === false ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between gap-3 md:col-span-6">
                      <div>
                        <div className="font-medium">{textLabel(type)}</div>
                        <div className="text-xs text-black/50">{text.enabled === false ? "Tidak ditampilkan di hasil final" : "Ditampilkan di hasil final"}</div>
                      </div>
                      <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-linen px-3 py-2 text-xs font-semibold">
                        <input type="checkbox" checked={text.enabled !== false} onChange={(e) => updateText(type, { enabled: e.target.checked })} />
                        {text.enabled === false ? "Off" : "On"}
                      </label>
                    </div>
                    <Label>X<Input disabled={text.enabled === false} type="number" value={text.x} onChange={(e) => updateText(type, { x: Number(e.target.value) })} /></Label>
                    <Label>Y<Input disabled={text.enabled === false} type="number" value={text.y} onChange={(e) => updateText(type, { y: Number(e.target.value) })} /></Label>
                    <Label>Font Size<Input disabled={text.enabled === false} type="number" value={text.fontSize} onChange={(e) => updateText(type, { fontSize: Number(e.target.value) })} /></Label>
                    <Label>Color<Input disabled={text.enabled === false} type="color" value={text.color || "#221f1c"} onChange={(e) => updateText(type, { color: e.target.value })} /></Label>
                    <Label>Font<select disabled={text.enabled === false} className="min-h-11 rounded-md border border-black/15 px-3 disabled:opacity-50" value={normalizeFontValue(text.font)} onChange={(e) => updateText(type, { font: e.target.value })}>{fontOptions.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}</select></Label>
                    <Label>Align<select disabled={text.enabled === false} className="min-h-11 rounded-md border border-black/15 px-3 disabled:opacity-50" value={text.align || "center"} onChange={(e) => updateText(type, { align: e.target.value as CanvasTextAlign })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></Label>
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
  return <ExactFramePreview frame={frame} layout={layout} className={className} />;
}

function defaultText(type: FrameTextType): FrameText {
  const y =
    type === "eventTheme" ? 1540 :
    type === "coupleName" ? 1600 :
    type === "venue" ? 1670 :
    type === "eventDate" ? 1725 :
    type === "branding" ? 1770 :
    1600;
  return {
    type,
    enabled: true,
    x: 600,
    y,
    value: type === "branding" ? "AWH Digital" : undefined,
    font: type === "coupleName" ? "dancing" : type === "venue" || type === "branding" ? "montserrat" : "cinzel",
    fontSize: type === "coupleName" ? 64 : type === "branding" ? 22 : 30,
    color: type === "eventTheme" || type === "branding" ? "#b58b4b" : "#221f1c",
    align: "center"
  };
}

function textLabel(type: FrameTextType) {
  if (type === "eventTheme") return "Tema";
  if (type === "coupleName") return "Nama Pasangan";
  if (type === "venue") return "Tempat";
  if (type === "eventDate") return "Tanggal";
  if (type === "branding") return "Branding";
  return "Custom";
}

function normalizeFrameConfig(value: unknown): FrameConfig {
  const defaults = [defaultText("eventTheme"), defaultText("coupleName"), defaultText("venue"), defaultText("eventDate"), defaultText("branding")];
  if (!value || typeof value !== "object") return { mirrorOutput: true, texts: defaults };
  const config = value as FrameConfig;
  const existing = config.texts || [];
  const texts = [
    ...defaults.map((text) => ({ ...text, ...(existing.find((entry) => entry.type === text.type) || {}) })),
    ...existing.filter((entry) => !defaults.some((text) => text.type === entry.type))
  ];
  return {
    ...config,
    mirrorOutput: config.mirrorOutput ?? true,
    texts
  };
}

function normalizeLayoutConfig(value: unknown): LayoutConfig {
  if (!value || typeof value !== "object") return { slots: [{ x: 80, y: 80, width: 1040, height: 1200, shape: "miter" }] };
  const config = value as LayoutConfig;
  if (!Array.isArray(config.slots)) return { slots: [] };
  return { ...config, slots: config.slots.map((slot) => ({ ...slot, shape: slot.shape || "miter" })) };
}

const fontOptions = [
  { value: "cinzel", label: "Cinzel" },
  { value: "dancing", label: "Dancing" },
  { value: "caveat", label: "Caveat" },
  { value: "montserrat", label: "Montserrat" }
];

function normalizeFontValue(font?: string) {
  if (font === "dancing" || font === "caveat" || font === "montserrat" || font === "cinzel") return font;
  if (font === "serif") return "cinzel";
  return "montserrat";
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
