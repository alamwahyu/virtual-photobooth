import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { frameDataFromRequest } from "@/lib/db/admin-mappers";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  try {
    const frame = await prisma.frame.update({ where: { id }, data: await frameDataFromRequest(request) });
    return NextResponse.json(frame);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan frame." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const used = await prisma.eventFrame.count({ where: { frameId: id } });
  if (used) return NextResponse.json({ error: `Frame masih digunakan oleh ${used} event dan tidak dapat dihapus.` }, { status: 409 });
  await prisma.frame.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
