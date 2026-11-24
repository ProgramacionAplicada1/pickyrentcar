import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Solo desarrollo: permite abrir la app también en http://127.0.0.1:3000
  // (útil para tener dos sesiones a la vez: localhost y 127.0.0.1 no
  // comparten cookies). No afecta al build de producción.
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "efkguaxtucbcfmfufmbx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
