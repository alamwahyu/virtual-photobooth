"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { appPath, publicEventUrl } from "@/lib/utils/base-path";
import { slugify } from "@/lib/utils/slug";

type Option = { id: string; name: string; layoutId?: string };
type EventFormValue = {
  id?: string;
  coupleName1: string;
  coupleName2: string;
  displayName: string;
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
        <Label>Slug<Input value={value.slug} onChange={(e) => patch({ slug: slugify(e.target.value) })} required /></Label>
        <Label>Wedding Date<Input type="date" value={value.eventDate} onChange={(e) => patch({ eventDate: e.target.value })} required /></Label>
        <Label>Venue Name<Input value={value.venueName} onChange={(e) => patch({ venueName: e.target.value })} required /></Label>
        <Label>Cover Image URL<Input value={value.coverImage} onChange={(e) => patch({ coverImage: e.target.value })} placeholder="/uploads/events/cover.webp" /></Label>
        <Label>Logo URL<Input value={value.logoImage} onChange={(e) => patch({ logoImage: e.target.value })} /></Label>
        <Label>Venue Address<Textarea value={value.venueAddress} onChange={(e) => patch({ venueAddress: e.target.value })} /></Label>
        <Label>Description<Textarea value={value.description} onChange={(e) => patch({ description: e.target.value })} /></Label>
        <Label>Status<select className="min-h-11 rounded-md border border-black/15 px-3" value={value.status} onChange={(e) => patch({ status: e.target.value as EventFormValue["status"] })}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select></Label>
      </div>

      <div className="grid gap-4 rounded-lg bg-white p-5 shadow-soft md:grid-cols-4">
        {(["primaryColor", "secondaryColor", "backgroundColor", "textColor"] as const).map((key) => (
          <Label key={key}>{key}<Input type="color" value={value[key]} onChange={(e) => patch({ [key]: e.target.value })} /></Label>
        ))}
      </div>

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
          <Button type="button" variant="secondary" onClick={async () => setQr(await QRCode.toDataURL(url, { width: 512 }))}>Preview QR</Button>
          {qr && <a className="rounded-md border border-black/15 px-4 py-2 text-sm font-semibold" download={`qr-${value.slug}.png`} href={qr}>Download QR PNG</a>}
        </div>
        {qr && <img alt="QR public URL" src={qr} className="mt-4 h-44 w-44 rounded-md border bg-white p-2" />}
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <Button type="submit">Simpan Event</Button>
    </form>
  );
}
