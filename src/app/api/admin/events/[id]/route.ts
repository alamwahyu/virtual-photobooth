import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { eventDataFromRequest } from "@/lib/db/admin-mappers";
import { prisma } from "@/lib/db/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, include: { layouts: true, frames: true } });
  if (!event) return NextResponse.json({ error: "Event tidak ditemukan." }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  try {
    const data = await eventDataFromRequest(request);
    const event = await prisma.$transaction(async (tx) => {
      await tx.eventLayout.deleteMany({ where: { eventId: id } });
      await tx.eventFrame.deleteMany({ where: { eventId: id } });
      const updated = await tx.event.update({ where: { id }, data: data.scalar });
      await tx.eventLayout.createMany({ data: data.layoutIds.map((layoutId, index) => ({ eventId: id, layoutId, sortOrder: index, isDefault: layoutId === data.defaultLayoutId })) });
      await tx.eventFrame.createMany({ data: data.frameIds.map((frameId, index) => ({ eventId: id, frameId, sortOrder: index, isDefault: frameId === data.defaultFrameId })) });
      return updated;
    });
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan event." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
