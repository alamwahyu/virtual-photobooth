import { AdminShell } from "@/components/admin/AdminShell";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { FrameEditor } from "@/components/admin/JsonCrud";
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
      <div className="mb-6">
        <h1 className="font-serif text-4xl">Frames</h1>
        <p className="text-black/60">Kelola frame reusable dengan overlay transparan dan dynamic text.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <FrameEditor layouts={layouts} />
        <div className="grid gap-4">
          {frames.map((frame) => (
            <div key={frame.id} className="rounded-lg bg-white p-5 shadow-soft">
              <div className="mb-3 flex justify-between gap-4">
                <div><h2 className="font-serif text-2xl">{frame.name}</h2><p className="text-sm text-black/60">{frame.layout.name} · {frame.isActive ? "Active" : "Inactive"}</p></div>
                <DeleteButton endpoint={`/api/admin/frames/${frame.id}`} label="Delete" />
              </div>
              <FrameEditor initial={{ ...frame, configJson: frame.configJson }} layouts={layouts} />
            </div>
          ))}
          {!frames.length && <p className="rounded-lg bg-white p-5 text-sm text-black/60 shadow-soft">Belum ada frame.</p>}
        </div>
      </div>
    </AdminShell>
  );
}
