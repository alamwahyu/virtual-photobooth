import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"]
]);

export type UploadKind = "events" | "frames" | "layouts" | "uploads";

export function storageRoot() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

export function publicUploadUrl(kind: UploadKind, filename: string) {
  return `/uploads/${kind}/${filename}`;
}

export function sanitizeUploadKind(value: string | null): UploadKind {
  if (value === "events" || value === "frames" || value === "layouts" || value === "uploads") return value;
  return "uploads";
}

export async function saveImageUpload(file: File, kind: UploadKind) {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new Error("Format file harus PNG, JPG, JPEG, atau WEBP.");
  if (file.size > MAX_UPLOAD_SIZE) throw new Error("Ukuran file maksimal 5MB.");
  const filename = `${Date.now()}-${randomUUID()}.${ext}`;
  const dir = path.join(storageRoot(), kind);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer, { flag: "wx" });
  return publicUploadUrl(kind, filename);
}
