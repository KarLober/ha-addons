// Fixed placeholder basePath, compiled into the production build. The
// runtime proxy (server/ingress-proxy.mjs) rewrites every occurrence of
// this literal string to the real prefix on each response: empty for
// direct access, or the dynamic Home Assistant ingress path read from the
// X-Ingress-Path header. See server/ingress-proxy.mjs and the README's
// "Home Assistant" section.
export const INGRESS_BASE_PATH = "/__sweepweek_base__";
