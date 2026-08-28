import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sanitizeUploadKind, saveImageUpload } from "@/lib/storage/storage";

export async function POST(request: NextRequest) {
  await requireAdmin();
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "File upload tidak ditemukan." }, { status: 400 });
    const url = await saveImageUpload(file, sanitizeUploadKind(request.nextUrl.searchParams.get("kind")));
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload gagal." }, { status: 400 });
  }
}
