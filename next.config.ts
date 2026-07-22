import type { NextConfig } from "next";

const experimentalConfig: NonNullable<NextConfig["experimental"]> = {
  serverActions: {
    bodySizeLimit: "100mb",
  },
  proxyClientMaxBodySize: "100mb",
};

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.110.250"],
  experimental: experimentalConfig,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://node1.gervhosting.my.id:5457/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://node1.gervhosting.my.id:5457/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
