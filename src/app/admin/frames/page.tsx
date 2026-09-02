import { AdminShell } from "@/components/admin/AdminShell";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { LibraryModal } from "@/components/admin/LibraryModal";
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

      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-3xl">Existing Frames</h2>
            <p className="text-sm text-black/60">Satu baris untuk satu frame. Preview dirender dari konfigurasi frame aktif.</p>
          </div>
          <LibraryModal title="Create Frame" triggerLabel="Create Frame" mode="create">
            <FrameEditor layouts={layouts} />
          </LibraryModal>
        </div>

        <div className="grid gap-3">
          {frames.map((frame) => (
            <div key={frame.id} className="grid gap-4 rounded-lg border border-black/10 bg-white p-4 shadow-sm lg:grid-cols-[120px_1fr_auto] lg:items-center">
              <div className="w-full max-w-[140px] lg:max-w-none">
                <DynamicFramePreview frame={{ ...frame, configJson: frame.configJson }} layout={frame.layout} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="min-w-0 break-words font-serif text-2xl leading-tight">{frame.name}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${frame.isActive ? "bg-green-50 text-green-700" : "bg-black/5 text-black/50"}`}>
                    {frame.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-1 break-words text-sm text-black/60">{frame.layout.name} · {frame.slug}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-black/55">
                  <span className="rounded-full bg-linen px-3 py-1">{frame.backgroundImage ? "Background image" : frame.backgroundColor}</span>
                  <span className="rounded-full bg-linen px-3 py-1">{frame.overlayImage ? "Overlay uploaded" : "No overlay"}</span>
                  <span className="rounded-full bg-linen px-3 py-1">{Array.isArray((frame.configJson as { texts?: unknown[] }).texts) ? (frame.configJson as { texts: unknown[] }).texts.length : 0} text layer</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <LibraryModal title={`Edit Frame: ${frame.name}`} triggerLabel="Edit">
                  <FrameEditor compact initial={{ ...frame, configJson: frame.configJson }} layouts={layouts} />
                </LibraryModal>
                <DeleteButton endpoint={`/api/admin/frames/${frame.id}`} label="Delete" />
              </div>
            </div>
          ))}
        </div>
        {!frames.length && <p className="rounded-lg bg-white p-5 text-sm text-black/60 shadow-soft">Belum ada frame.</p>}
      </section>
    </AdminShell>
  );
}
