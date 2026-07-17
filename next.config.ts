import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

function getLocalDevOrigins() {
  const port = process.env.PORT ?? "3000";
  const envOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const lanOrigins = Object.values(networkInterfaces())
    .flatMap((networkInterface) => networkInterface ?? [])
    .filter((networkAddress) => {
      return networkAddress.family === "IPv4" && !networkAddress.internal;
    })
    .flatMap((networkAddress) => {
      const host = networkAddress.address;

      return [host, `${host}:${port}`];
    });

  return Array.from(new Set([...envOrigins, ...lanOrigins]));
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalDevOrigins(),
};

export default nextConfig;
