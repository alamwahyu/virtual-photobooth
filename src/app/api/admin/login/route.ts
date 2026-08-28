import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { setAdminSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/admin";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!checkRateLimit(`login:${ip}`)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan login. Coba lagi sebentar." }, { status: 429 });
  }
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Email atau password tidak valid." }, { status: 400 });

  const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!admin || !(await bcrypt.compare(parsed.data.password, admin.passwordHash))) {
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }
  await setAdminSession(admin.id);
  return NextResponse.json({ ok: true });
}
