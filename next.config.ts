import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// ทำให้ getCloudflareContext() (D1 binding) ใช้ได้ตอน next dev ผ่าน miniflare local
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
