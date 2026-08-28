import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { frameDataFromRequest } from "@/lib/db/admin-mappers";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  await requireAdmin();
  return NextResponse.json(await prisma.frame.findMany({ orderBy: { createdAt: "desc" }, include: { layout: true } }));
}

export async function POST(request: Request) {
  await requireAdmin();
  try {
    const frame = await prisma.frame.create({ data: await frameDataFromRequest(request) });
    return NextResponse.json(frame, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal membuat frame." }, { status: 400 });
  }
}
