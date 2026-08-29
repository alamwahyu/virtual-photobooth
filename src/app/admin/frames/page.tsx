import { AdminShell } from "@/components/admin/AdminShell";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { DynamicFramePreview, FrameEditor } from "@/components/admin/JsonCrud";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function FramesPage() {
  await requireAdmin();
  const [frames, layouts] = await Promise.all([
    prisma.frame.findMany({ orderBy: { createdAt: "desc" }, include: { layout: true } }),
    prisma.layout.findMany({ orderBy: { name: "asc" } })
  ]);
  return (
    <AdminShell>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Frame Library</p>
          <h1 className="mt-2 font-serif text-5xl">Frames</h1>
          <p className="mt-2 max-w-2xl text-black/60">Kelola background, overlay transparan, preview, dan teks dinamis yang dipakai pada hasil photobooth.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-md bg-white px-4 py-3 shadow-sm">
            <div className="font-serif text-2xl">{frames.length}</div>
            <div className="text-xs text-black/50">Total</div>
          </div>
          <div className="rounded-md bg-white px-4 py-3 shadow-sm">
            <div className="font-serif text-2xl">{frames.filter((frame) => frame.isActive).length}</div>
            <div className="text-xs text-black/50">Active</div>
          </div>
          <div className="rounded-md bg-white px-4 py-3 shadow-sm">
            <div className="font-serif text-2xl">{layouts.length}</div>
            <div className="text-xs text-black/50">Layouts</div>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-3xl">Create Frame</h2>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black/55">Background + Overlay + Text</span>
          </div>
          <FrameEditor layouts={layouts} />
        </section>

        <section>
          <div className="mb-3">
            <h2 className="font-serif text-3xl">Existing Frames</h2>
            <p className="text-sm text-black/60">Preview di bawah dirender dari konfigurasi frame, bukan dari thumbnail statis.</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
          {frames.map((frame) => (
            <div key={frame.id} className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-soft">
              <div className="grid gap-0 md:grid-cols-[240px_1fr]">
                <div className="bg-linen/60 p-4">
                  <DynamicFramePreview frame={{ ...frame, configJson: frame.configJson }} layout={frame.layout} />
                </div>
                <div className="flex flex-col justify-between gap-4 p-5">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-3xl leading-tight">{frame.name}</h3>
                        <p className="mt-1 text-sm text-black/60">{frame.layout.name} · {frame.slug}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${frame.isActive ? "bg-green-50 text-green-700" : "bg-black/5 text-black/50"}`}>
                        {frame.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-2 text-sm text-black/60 sm:grid-cols-3">
                      <div className="rounded-md border border-black/10 p-3">
                        <div className="text-xs uppercase tracking-wide text-black/40">Background</div>
                        <div className="mt-1 font-medium text-ink">{frame.backgroundImage ? "Image" : frame.backgroundColor}</div>
                      </div>
                      <div className="rounded-md border border-black/10 p-3">
                        <div className="text-xs uppercase tracking-wide text-black/40">Overlay</div>
                        <div className="mt-1 font-medium text-ink">{frame.overlayImage ? "Uploaded" : "None"}</div>
                      </div>
                      <div className="rounded-md border border-black/10 p-3">
                        <div className="text-xs uppercase tracking-wide text-black/40">Text</div>
                        <div className="mt-1 font-medium text-ink">{Array.isArray((frame.configJson as { texts?: unknown[] }).texts) ? (frame.configJson as { texts: unknown[] }).texts.length : 0} layer</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-4">
                    <DeleteButton endpoint={`/api/admin/frames/${frame.id}`} label="Delete" />
                  </div>
                </div>
              </div>
              <details className="border-t border-black/10">
                <summary className="cursor-pointer bg-linen/40 px-5 py-3 text-sm font-semibold">Edit frame settings</summary>
                <div className="p-5">
                  <FrameEditor initial={{ ...frame, configJson: frame.configJson }} layouts={layouts} />
                </div>
              </details>
            </div>
          ))}
          </div>
          {!frames.length && <p className="rounded-lg bg-white p-5 text-sm text-black/60 shadow-soft">Belum ada frame.</p>}
        </section>
      </div>
    </AdminShell>
  );
}
