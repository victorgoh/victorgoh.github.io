import type { NextConfig } from "next";

const configuredBasePath = process.env.NEXT_PUBLIC_FRAMEWORK_BASE_PATH ?? "";
const basePath =
  configuredBasePath && !configuredBasePath.startsWith("/")
    ? `/${configuredBasePath}`
    : configuredBasePath;
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX ?? basePath;

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: assetPrefix || undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
