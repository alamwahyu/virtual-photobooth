import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { eventDataFromRequest } from "@/lib/db/admin-mappers";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  await requireAdmin();
  const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" }, include: { layouts: true, frames: true } });
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  await requireAdmin();
  try {
    const data = await eventDataFromRequest(request);
    const event = await prisma.$transaction(async (tx) => {
      const created = await tx.event.create({ data: data.scalar });
      await tx.eventLayout.createMany({
        data: data.layoutIds.map((layoutId, index) => ({ eventId: created.id, layoutId, sortOrder: index, isDefault: layoutId === data.defaultLayoutId }))
      });
      await tx.eventFrame.createMany({
        data: data.frameIds.map((frameId, index) => ({ eventId: created.id, frameId, sortOrder: index, isDefault: frameId === data.defaultFrameId }))
      });
      return created;
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal membuat event." }, { status: 400 });
  }
}
