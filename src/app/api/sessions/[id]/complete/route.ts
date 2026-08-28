import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.photoboothSession.update({ where: { id }, data: { completedAt: new Date() } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
