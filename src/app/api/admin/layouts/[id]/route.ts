import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { layoutDataFromRequest } from "@/lib/db/admin-mappers";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  try {
    const layout = await prisma.layout.update({ where: { id }, data: await layoutDataFromRequest(request) });
    return NextResponse.json(layout);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan layout." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const used = await prisma.eventLayout.count({ where: { layoutId: id } });
  if (used) return NextResponse.json({ error: `Layout masih digunakan oleh ${used} event dan tidak dapat dihapus.` }, { status: 409 });
  await prisma.layout.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
