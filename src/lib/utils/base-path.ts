export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/virtual-photobooth";

export function appPath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return basePath;
  return `${basePath}${normalized}`;
}

export function assetPath(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:") || path.startsWith(basePath)) {
    return path;
  }
  return appPath(path);
}

export function publicEventUrl(slug: string) {
  const base = process.env.APP_URL || `https://awhdigital.my.id${basePath}`;
  return `${base.replace(/\/$/, "")}/event/${slug}`;
}
