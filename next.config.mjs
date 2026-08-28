const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/virtual-photobooth";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  poweredByHeader: false,
  images: {
    unoptimized: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb"
    }
  }
};

export default nextConfig;
