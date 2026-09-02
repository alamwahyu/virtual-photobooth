import { AdminShell } from "@/components/admin/AdminShell";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { LibraryModal } from "@/components/admin/LibraryModal";
import { DynamicLayoutPreview, LayoutEditor } from "@/components/admin/JsonCrud";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function LayoutsPage() {
  await requireAdmin();
  const layouts = await prisma.layout.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <AdminShell>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Layout Library</p>
          <h1 className="mt-2 font-serif text-5xl">Layouts</h1>
          <p className="mt-2 max-w-2xl text-black/60">Kelola format hasil photobooth, ukuran canvas, jumlah pose, dan posisi setiap photo slot.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-md bg-white px-4 py-3 shadow-sm">
            <div className="font-serif text-2xl">{layouts.length}</div>
            <div className="text-xs text-black/50">Total</div>
          </div>
          <div className="rounded-md bg-white px-4 py-3 shadow-sm">
            <div className="font-serif text-2xl">{layouts.filter((layout) => layout.isActive).length}</div>
            <div className="text-xs text-black/50">Active</div>
          </div>
          <div className="rounded-md bg-white px-4 py-3 shadow-sm">
            <div className="font-serif text-2xl">{layouts.reduce((sum, layout) => sum + layout.photoCount, 0)}</div>
            <div className="text-xs text-black/50">Slots</div>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-3xl">Existing Layouts</h2>
            <p className="text-sm text-black/60">Satu baris untuk satu layout. Preview dirender dari konfigurasi slot aktif.</p>
          </div>
          <LibraryModal title="Create Layout" triggerLabel="Create Layout" mode="create">
            <LayoutEditor />
          </LibraryModal>
        </div>

        <div className="grid gap-3">
          {layouts.map((layout) => (
            <div key={layout.id} className="grid gap-4 rounded-lg border border-black/10 bg-white p-4 shadow-sm lg:grid-cols-[120px_1fr_auto] lg:items-center">
              <div className="w-full max-w-[140px] lg:max-w-none">
                <DynamicLayoutPreview layout={{ ...layout, configJson: layout.configJson }} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="min-w-0 break-words font-serif text-2xl leading-tight">{layout.name}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${layout.isActive ? "bg-green-50 text-green-700" : "bg-black/5 text-black/50"}`}>
                    {layout.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-1 break-words text-sm text-black/60">{layout.slug} · {layout.orientation}</p>
                <p className="mt-2 line-clamp-2 text-sm text-black/55">{layout.description || "Tanpa deskripsi."}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-black/55">
                  <span className="rounded-full bg-linen px-3 py-1">{layout.canvasWidth} x {layout.canvasHeight}</span>
                  <span className="rounded-full bg-linen px-3 py-1">{layout.photoCount} pose</span>
                  <span className="rounded-full bg-linen px-3 py-1">{Array.isArray((layout.configJson as { slots?: unknown[] }).slots) ? (layout.configJson as { slots: unknown[] }).slots.length : 0} slot</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <LibraryModal title={`Edit Layout: ${layout.name}`} triggerLabel="Edit">
                  <LayoutEditor compact initial={{ ...layout, configJson: layout.configJson }} />
                </LibraryModal>
                <DeleteButton endpoint={`/api/admin/layouts/${layout.id}`} label="Delete" />
              </div>
            </div>
          ))}
        </div>
        {!layouts.length && <p className="rounded-lg bg-white p-5 text-sm text-black/60 shadow-soft">Belum ada layout.</p>}
      </section>
    </AdminShell>
  );
}
