"use client";

import { useMemo, useState } from "react";
import { Download, QrCode, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { appPath, assetPath, publicEventUrl } from "@/lib/utils/base-path";
import { slugify } from "@/lib/utils/slug";

type Option = { id: string; name: string; layoutId?: string };
type EventFormValue = {
  id?: string;
  coupleName1: string;
  coupleName2: string;
  displayName: string;
  theme: string;
  slug: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  description: string;
  coverImage: string;
  logoImage: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  layoutIds: string[];
  frameIds: string[];
  defaultLayoutId?: string;
  defaultFrameId?: string;
};

export function EventForm({ initial, layouts, frames }: { initial?: EventFormValue; layouts: Option[]; frames: Option[] }) {
  const router = useRouter();
  const [value, setValue] = useState<EventFormValue>(
    initial || {
      coupleName1: "",
      coupleName2: "",
      displayName: "",
      theme: "The Wedding of",
      slug: "",
      eventDate: "",
      venueName: "",
      venueAddress: "",
      description: "",
      coverImage: "",
      logoImage: "",
      status: "DRAFT",
      primaryColor: "#b58b4b",
      secondaryColor: "#d9a6a0",
      backgroundColor: "#fbf7f0",
      textColor: "#221f1c",
      layoutIds: [],
      frameIds: []
    }
  );
  const [error, setError] = useState("");
  const [qr, setQr] = useState("");
  const url = useMemo(() => publicEventUrl(value.slug || "event-slug"), [value.slug]);

  function patch(next: Partial<EventFormValue>) {
    setValue((current) => ({ ...current, ...next }));
  }

  function toggle(key: "layoutIds" | "frameIds", id: string) {
    const set = new Set(value[key]);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    patch({ [key]: Array.from(set) } as Partial<EventFormValue>);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch(appPath(value.id ? `/api/admin/events/${value.id}` : "/api/admin/events"), {
      method: value.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(value)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Gagal menyimpan event." }));
      setError(data.error);
      return;
    }
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-4 rounded-lg bg-white p-5 shadow-soft md:grid-cols-2">
        <Label>Partner Name 1<Input value={value.coupleName1} onChange={(e) => patch({ coupleName1: e.target.value })} required /></Label>
        <Label>Partner Name 2<Input value={value.coupleName2} onChange={(e) => patch({ coupleName2: e.target.value })} required /></Label>
        <Label>Display Name<Input value={value.displayName} onChange={(e) => patch({ displayName: e.target.value })} onBlur={() => !value.slug && patch({ slug: slugify(value.displayName) })} required /></Label>
        <Label>Tema<Input value={value.theme} onChange={(e) => patch({ theme: e.target.value })} placeholder="The Wedding of" /></Label>
        <Label>Slug<Input value={value.slug} onChange={(e) => patch({ slug: slugify(e.target.value) })} required /></Label>
        <Label>Wedding Date<Input type="date" value={value.eventDate} onChange={(e) => patch({ eventDate: e.target.value })} required /></Label>
        <Label>Venue Name<Input value={value.venueName} onChange={(e) => patch({ venueName: e.target.value })} required /></Label>
        <UploadImageField label="Cover Image URL" value={value.coverImage} kind="events" onChange={(coverImage) => patch({ coverImage })} />
        <UploadImageField label="Logo URL" value={value.logoImage} kind="events" onChange={(logoImage) => patch({ logoImage })} />
        <Label>Venue Address<Textarea value={value.venueAddress} onChange={(e) => patch({ venueAddress: e.target.value })} /></Label>
        <Label>Description<Textarea value={value.description} onChange={(e) => patch({ description: e.target.value })} /></Label>
        <Label>Status<select className="min-h-11 rounded-md border border-black/15 px-3" value={value.status} onChange={(e) => patch({ status: e.target.value as EventFormValue["status"] })}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select></Label>
      </div>

      <section className="rounded-lg bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="font-serif text-2xl">Event Theme Colors</h2>
            <p className="text-sm text-black/60">Warna ini mengatur tampilan halaman publik event dan aksen photobooth.</p>
          </div>
          <div className="flex overflow-hidden rounded-md border border-black/10">
            <span className="h-10 w-10" style={{ backgroundColor: value.primaryColor }} />
            <span className="h-10 w-10" style={{ backgroundColor: value.secondaryColor }} />
            <span className="h-10 w-10" style={{ backgroundColor: value.backgroundColor }} />
            <span className="h-10 w-10" style={{ backgroundColor: value.textColor }} />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="grid gap-3 md:grid-cols-2">
            <ColorField
              label="Primary Color"
              description="Aksen utama seperti label, highlight, dan detail penting."
              value={value.primaryColor}
              onChange={(primaryColor) => patch({ primaryColor })}
            />
            <ColorField
              label="Secondary Color"
              description="Aksen pendukung untuk variasi visual event."
              value={value.secondaryColor}
              onChange={(secondaryColor) => patch({ secondaryColor })}
            />
            <ColorField
              label="Background Color"
              description="Warna latar halaman public event dan booth."
              value={value.backgroundColor}
              onChange={(backgroundColor) => patch({ backgroundColor })}
            />
            <ColorField
              label="Text Color"
              description="Warna teks utama pada halaman public event."
              value={value.textColor}
              onChange={(textColor) => patch({ textColor })}
            />
          </div>
          <div className="rounded-lg border border-black/10 p-4" style={{ backgroundColor: value.backgroundColor, color: value.textColor }}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: value.primaryColor }}>Virtual Photobooth</p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: value.primaryColor }}>{value.theme || "The Wedding of"}</p>
            <h3 className="mt-1 font-serif text-3xl">{value.displayName || "Alam & Ghina"}</h3>
            <p className="mt-3 text-sm opacity-70">{value.venueName || "Edelweiss Wedding Hall"}</p>
            <div className="mt-4 h-1.5 w-24 rounded-full" style={{ backgroundColor: value.secondaryColor }} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 rounded-lg bg-white p-5 shadow-soft md:grid-cols-2">
        <section>
          <h2 className="font-serif text-2xl">Available Layouts</h2>
          <div className="mt-3 grid gap-2">
            {layouts.map((layout) => <label key={layout.id} className="flex gap-2 text-sm"><input type="checkbox" checked={value.layoutIds.includes(layout.id)} onChange={() => toggle("layoutIds", layout.id)} />{layout.name}</label>)}
          </div>
          <Label>Default Layout<select className="min-h-11 rounded-md border border-black/15 px-3" value={value.defaultLayoutId || ""} onChange={(e) => patch({ defaultLayoutId: e.target.value })}><option value="">Pilih</option>{layouts.filter((l) => value.layoutIds.includes(l.id)).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></Label>
        </section>
        <section>
          <h2 className="font-serif text-2xl">Available Frames</h2>
          <div className="mt-3 grid gap-2">
            {frames.map((frame) => <label key={frame.id} className="flex gap-2 text-sm"><input type="checkbox" checked={value.frameIds.includes(frame.id)} onChange={() => toggle("frameIds", frame.id)} />{frame.name}</label>)}
          </div>
          <Label>Default Frame<select className="min-h-11 rounded-md border border-black/15 px-3" value={value.defaultFrameId || ""} onChange={(e) => patch({ defaultFrameId: e.target.value })}><option value="">Pilih</option>{frames.filter((f) => value.frameIds.includes(f.id)).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></Label>
        </section>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-soft">
        <p className="text-sm text-black/60">URL Preview</p>
        <p className="break-all font-medium">{url}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" className="px-3" onClick={async () => setQr(await QRCode.toDataURL(url, { width: 512 }))} aria-label="Preview QR" title="Preview QR">
            <QrCode size={17} />
          </Button>
          {qr && <a className="touch-target inline-flex items-center justify-center rounded-md border border-black/15 px-3 py-2 text-sm font-semibold" aria-label="Download QR PNG" title="Download QR PNG" download={`qr-${value.slug}.png`} href={qr}><Download size={17} /></a>}
        </div>
        {qr && <img alt="QR public URL" src={qr} className="mt-4 h-44 w-44 rounded-md border bg-white p-2" />}
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button type="submit" className="px-3" aria-label="Simpan event" title="Simpan event"><Save size={17} /></Button>
    </form>
  );
}

function ColorField({ label, description, value, onChange }: { label: string; description: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 rounded-md border border-black/10 bg-linen/40 p-3 text-sm">
      <span className="font-semibold">{label}</span>
      <span className="text-xs leading-relaxed text-black/55">{description}</span>
      <div className="flex items-center gap-3">
        <Input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-16 p-1" />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function UploadImageField({ label, value, kind, onChange }: { label: string; value: string; kind: "events" | "frames" | "layouts" | "uploads"; onChange: (value: string) => void }) {
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
    <div className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <div className="flex gap-2">
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="/uploads/events/cover.webp" />
        <label className="touch-target inline-flex cursor-pointer items-center rounded-md border border-black/15 bg-white px-3 text-sm font-semibold hover:bg-linen">
          {uploading ? "Uploading..." : "Upload"}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} />
        </label>
      </div>
      {value && <img src={assetPath(value)} alt="" className="h-24 w-24 rounded-md border border-black/10 object-cover" />}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
