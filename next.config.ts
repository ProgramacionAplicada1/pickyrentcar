import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "efkguaxtucbcfmfufmbx.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/vehicles/**",
      },
    ],
  },
};

export default nextConfig;