import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { EventForm } from "@/components/admin/EventForm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [event, layouts, frames] = await Promise.all([
    prisma.event.findUnique({ where: { id }, include: { layouts: true, frames: true } }),
    prisma.layout.findMany(),
    prisma.frame.findMany()
  ]);
  if (!event) notFound();
  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-serif text-4xl">Edit Event</h1>
        <p className="text-black/60">Kelola detail pasangan, status, tema, layout, dan frame.</p>
      </div>
      <EventForm
        layouts={layouts}
        frames={frames}
        initial={{
          id: event.id,
          coupleName1: event.coupleName1,
          coupleName2: event.coupleName2,
          displayName: event.displayName,
          slug: event.slug,
          eventDate: event.eventDate.toISOString().slice(0, 10),
          venueName: event.venueName,
          venueAddress: event.venueAddress,
          description: event.description,
          coverImage: event.coverImage,
          logoImage: event.logoImage,
          status: event.status,
          primaryColor: event.primaryColor,
          secondaryColor: event.secondaryColor,
          backgroundColor: event.backgroundColor,
          textColor: event.textColor,
          layoutIds: event.layouts.map((item) => item.layoutId),
          frameIds: event.frames.map((item) => item.frameId),
          defaultLayoutId: event.layouts.find((item) => item.isDefault)?.layoutId,
          defaultFrameId: event.frames.find((item) => item.isDefault)?.frameId
        }}
      />
    </AdminShell>
  );
}
