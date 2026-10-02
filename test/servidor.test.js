const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");

const RAIZ = path.join(__dirname, "..");

// Sobe o servidor de desenvolvimento numa porta livre e devolve a URL base.
function subir() {
  return new Promise((ok, falha) => {
    const proc = spawn(process.execPath, [path.join(RAIZ, "scripts", "servidor.js"), "0"]);
    proc.stdout.once("data", (d) => ok({ proc, base: String(d).trim() }));
    proc.once("error", falha);
  });
}

// GET cru: sem normalizar a URL (fetch resolveria "..", escondendo o ataque).
function status(base, caminho) {
  return new Promise((ok, falha) => {
    const { hostname, port } = new URL(base);
    http.get({ hostname, port, path: caminho }, (r) => { r.resume(); ok(r.statusCode); }).on("error", falha);
  });
}

test("servidor de desenvolvimento: só arquivos públicos, só na máquina local", async (t) => {
  const vizinho = RAIZ + "-segredo-teste";
  fs.mkdirSync(vizinho, { recursive: true });
  fs.writeFileSync(path.join(vizinho, "x.txt"), "segredo");
  const { proc, base } = await subir();
  t.after(() => { proc.kill(); fs.rmSync(vizinho, { recursive: true, force: true }); });

  assert.match(base, /^http:\/\/127\.0\.0\.1:\d+$/); // não escuta na rede
  assert.equal(await status(base, "/"), 200);
  assert.equal(await status(base, "/feriados.js"), 200);
  assert.equal(await status(base, "/.git/config"), 403);
  assert.equal(await status(base, "/.github/workflows/test.yml"), 403);
  assert.equal(await status(base, "/node_modules/.package-lock.json"), 403);
  // "/../x" literal: o próprio parser de URL desfaz o ".." e o caminho cai dentro da raiz (não existe → 404)
  assert.equal(await status(base, "/../" + path.basename(vizinho) + "/x.txt"), 404);
  assert.equal(await status(base, "/%2e%2e%2f" + path.basename(vizinho) + "/x.txt"), 403);
  assert.equal(await status(base, "/%E0%A4%A"), 400); // URL malformada não derruba o servidor
  assert.equal(await status(base, "/"), 200);
});
