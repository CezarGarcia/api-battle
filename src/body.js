const MIN_SIZE_TO_COMPRESS = 1024;

export function prepareBody(json, gzipLevel = 6) {
  const raw = Buffer.from(json);
  const gzip = raw.length > MIN_SIZE_TO_COMPRESS ? Bun.gzipSync(raw, { level: gzipLevel }) : null;
  return { raw, gzip };
}

export function sendBody(req, body) {
  if (body.gzip && req.headers.get("accept-encoding")?.includes("gzip")) {
    return new Response(body.gzip, {
      headers: { "Content-Type": "application/json", "Content-Encoding": "gzip", "Vary": "Accept-Encoding" },
    });
  }
  return new Response(body.raw, { headers: { "Content-Type": "application/json" } });
}
