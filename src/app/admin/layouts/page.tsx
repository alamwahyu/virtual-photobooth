import { AdminShell } from "@/components/admin/AdminShell";
import { DeleteButton } from "@/components/admin/DeleteButton";
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

      <div className="grid gap-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-3xl">Create Layout</h2>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black/55">Canvas + Slots</span>
          </div>
          <LayoutEditor />
        </section>

        <section>
          <div className="mb-3">
            <h2 className="font-serif text-3xl">Existing Layouts</h2>
            <p className="text-sm text-black/60">Preview di bawah dirender dari `configJson.slots`, jadi mengikuti setup layout sebenarnya.</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
          {layouts.map((layout) => (
            <div key={layout.id} className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-soft">
              <div className="grid gap-0 md:grid-cols-[240px_1fr]">
                <div className="bg-linen/60 p-4">
                  <DynamicLayoutPreview layout={{ ...layout, configJson: layout.configJson }} />
                </div>
                <div className="flex flex-col justify-between gap-4 p-5">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-3xl leading-tight">{layout.name}</h3>
                        <p className="mt-1 text-sm text-black/60">{layout.slug} · {layout.orientation}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${layout.isActive ? "bg-green-50 text-green-700" : "bg-black/5 text-black/50"}`}>
                        {layout.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-black/60">{layout.description || "Tanpa deskripsi."}</p>
                    <div className="mt-5 grid gap-2 text-sm text-black/60 sm:grid-cols-3">
                      <div className="rounded-md border border-black/10 p-3">
                        <div className="text-xs uppercase tracking-wide text-black/40">Canvas</div>
                        <div className="mt-1 font-medium text-ink">{layout.canvasWidth} x {layout.canvasHeight}</div>
                      </div>
                      <div className="rounded-md border border-black/10 p-3">
                        <div className="text-xs uppercase tracking-wide text-black/40">Pose</div>
                        <div className="mt-1 font-medium text-ink">{layout.photoCount}</div>
                      </div>
                      <div className="rounded-md border border-black/10 p-3">
                        <div className="text-xs uppercase tracking-wide text-black/40">Slots</div>
                        <div className="mt-1 font-medium text-ink">{Array.isArray((layout.configJson as { slots?: unknown[] }).slots) ? (layout.configJson as { slots: unknown[] }).slots.length : 0}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-4">
                    <DeleteButton endpoint={`/api/admin/layouts/${layout.id}`} label="Delete" />
                  </div>
                </div>
              </div>
              <details className="border-t border-black/10">
                <summary className="cursor-pointer bg-linen/40 px-5 py-3 text-sm font-semibold">Edit layout settings</summary>
                <div className="p-5">
                  <LayoutEditor initial={{ ...layout, configJson: layout.configJson }} />
                </div>
              </details>
            </div>
          ))}
          </div>
          {!layouts.length && <p className="rounded-lg bg-white p-5 text-sm text-black/60 shadow-soft">Belum ada layout.</p>}
        </section>
      </div>
    </AdminShell>
  );
}
