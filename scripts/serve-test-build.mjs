import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import sirv from "sirv";

// Serve the actual deploy artifact, with a static HTTP 404 instead of an SPA fallback.
const notFound = await readFile("build/client/404.html");
const serve = sirv("build/client", { dev: true, dotfiles: true });
const server = createServer((request, response) => {
  serve(request, response, () => {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(notFound);
  });
});
server.listen(4175, "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close());
}
