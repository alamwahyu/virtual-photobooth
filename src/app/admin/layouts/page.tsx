import { AdminShell } from "@/components/admin/AdminShell";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { LayoutEditor } from "@/components/admin/JsonCrud";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function LayoutsPage() {
  await requireAdmin();
  const layouts = await prisma.layout.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-serif text-4xl">Layouts</h1>
        <p className="text-black/60">Layout extensible berbasis config JSON untuk posisi photo slot.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <LayoutEditor />
        <div className="grid gap-4">
          {layouts.map((layout) => (
            <div key={layout.id} className="rounded-lg bg-white p-5 shadow-soft">
              <div className="mb-3 flex justify-between gap-4">
                <div><h2 className="font-serif text-2xl">{layout.name}</h2><p className="text-sm text-black/60">{layout.photoCount} pose · {layout.canvasWidth}x{layout.canvasHeight} · {layout.isActive ? "Active" : "Inactive"}</p></div>
                <DeleteButton endpoint={`/api/admin/layouts/${layout.id}`} label="Delete" />
              </div>
              <LayoutEditor initial={{ ...layout, configJson: layout.configJson }} />
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
