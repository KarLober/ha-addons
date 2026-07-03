import http from "node:http";
import { spawn } from "node:child_process";
import { INGRESS_BASE_PATH } from "./constants.mjs";

const EXTERNAL_PORT = Number(process.env.PORT ?? 3000);
const INTERNAL_PORT = 3001;
// Optional fixed prefix for generic reverse-proxy setups that aren't HA
// ingress (which supplies its prefix dynamically per request instead).
const EXTERNAL_BASE_PATH = process.env.EXTERNAL_BASE_PATH ?? "";

const REWRITABLE_CONTENT_TYPES = [
  "text/html",
  "text/css",
  "text/plain",
  "text/javascript",
  "application/javascript",
  "application/json",
  "text/x-component", // Next.js RSC payload
];

function isRewritable(contentType) {
  if (!contentType) return false;
  return REWRITABLE_CONTENT_TYPES.some((t) => contentType.includes(t));
}

function currentPrefix(req) {
  const ingressPath = req.headers["x-ingress-path"];
  if (typeof ingressPath === "string" && ingressPath.length > 0) {
    return ingressPath;
  }
  return EXTERNAL_BASE_PATH;
}

// ---- start the real Next.js standalone server as a child process, bound
// to an internal-only port ----
const nextServer = spawn(process.execPath, ["server.js"], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: String(INTERNAL_PORT),
    HOSTNAME: "127.0.0.1",
  },
});

nextServer.on("exit", (code) => {
  console.error(`Next.js server exited with code ${code}`);
  process.exit(code ?? 1);
});

function waitForInternalServer(retries = 100) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      const req = http.request(
        { host: "127.0.0.1", port: INTERNAL_PORT, path: "/", method: "HEAD" },
        () => resolve(),
      );
      req.on("error", () => {
        if (remaining <= 0) {
          reject(new Error("Next.js server did not become ready in time"));
          return;
        }
        setTimeout(() => attempt(remaining - 1), 200);
      });
      req.end();
    };
    attempt(retries);
  });
}

const proxyServer = http.createServer((clientReq, clientRes) => {
  const prefix = currentPrefix(clientReq);
  // Root ("/") must map to the bare basePath, not "<basePath>/": requesting
  // the latter makes Next issue its own trailing-slash-canonicalization
  // redirect first (to a path with no segment after the ingress token),
  // which Home Assistant's ingress router then 404s on since its route
  // requires a path component after the token.
  const incomingPath = (clientReq.url ?? "/") === "/" ? "" : (clientReq.url ?? "/");
  const forwardPath = INGRESS_BASE_PATH + incomingPath;

  const upstreamReq = http.request(
    {
      host: "127.0.0.1",
      port: INTERNAL_PORT,
      path: forwardPath,
      method: clientReq.method,
      headers: clientReq.headers,
    },
    (upstreamRes) => {
      const contentType = upstreamRes.headers["content-type"] ?? "";
      const chunks = [];
      upstreamRes.on("data", (chunk) => chunks.push(chunk));
      upstreamRes.on("end", () => {
        let body = Buffer.concat(chunks);
        const headers = { ...upstreamRes.headers };

        if (isRewritable(contentType) && body.length > 0) {
          const rewritten = body
            .toString("utf8")
            .split(INGRESS_BASE_PATH)
            .join(prefix);
          body = Buffer.from(rewritten, "utf8");
          headers["content-length"] = String(Buffer.byteLength(body));
        }

        // Rewrite any header whose value embeds the placeholder, not just
        // Location: Next also sends font/script preload hints via a Link
        // response header, independent of the HTML body.
        for (const [key, value] of Object.entries(headers)) {
          if (typeof value === "string" && value.includes(INGRESS_BASE_PATH)) {
            headers[key] = value.split(INGRESS_BASE_PATH).join(prefix);
          } else if (Array.isArray(value)) {
            headers[key] = value.map((v) =>
              v.includes(INGRESS_BASE_PATH) ? v.split(INGRESS_BASE_PATH).join(prefix) : v,
            );
          }
        }

        clientRes.writeHead(upstreamRes.statusCode ?? 502, headers);
        clientRes.end(body);
      });
    },
  );

  upstreamReq.on("error", (err) => {
    console.error("Ingress proxy: upstream error", err);
    if (!clientRes.headersSent) {
      clientRes.writeHead(502);
    }
    clientRes.end("Bad gateway");
  });

  clientReq.pipe(upstreamReq);
});

try {
  await waitForInternalServer();
  proxyServer.listen(EXTERNAL_PORT, "0.0.0.0", () => {
    console.log(
      `Ingress-aware proxy listening on :${EXTERNAL_PORT}, forwarding to internal Next.js server on :${INTERNAL_PORT}`,
    );
  });
} catch (err) {
  console.error(err);
  process.exit(1);
}
