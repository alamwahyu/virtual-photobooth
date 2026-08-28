import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { layoutDataFromRequest } from "@/lib/db/admin-mappers";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  await requireAdmin();
  return NextResponse.json(await prisma.layout.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
  await requireAdmin();
  try {
    const layout = await prisma.layout.create({ data: await layoutDataFromRequest(request) });
    return NextResponse.json(layout, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal membuat layout." }, { status: 400 });
  }
}
