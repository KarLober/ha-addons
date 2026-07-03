import type { NextConfig } from "next";
import { INGRESS_BASE_PATH } from "./server/constants.mjs";

// In dev, basePath is left off entirely for local ergonomics (npm run dev
// serves plain http://localhost:3000). Production builds always compile in
// the fixed placeholder basePath; server/ingress-proxy.mjs rewrites it to
// the real (possibly dynamic) prefix at runtime. See that file and the
// README's "Home Assistant" section.
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: isDev ? undefined : INGRESS_BASE_PATH,
  // Always off: the ingress proxy rewrites response bodies as plain text,
  // which requires uncompressed output from Next's own server.
  compress: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
