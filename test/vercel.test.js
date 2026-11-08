// A Vercel serve o site com os cabeçalhos de vercel.json (no GitHub Pages não há como).
// Estes testes impedem que a configuração e a página se desencontrem.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const RAIZ = path.join(__dirname, "..");
const config = JSON.parse(fs.readFileSync(path.join(RAIZ, "vercel.json"), "utf8"));
const html = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
const cabecalho = (source, key) =>
  config.headers.find((h) => h.source === source).headers.find((x) => x.key === key).value;

test("vercel.json: a CSP do cabeçalho é a mesma da <meta>, mais frame-ancestors", () => {
  const meta = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  // frame-ancestors só vale em cabeçalho HTTP; na <meta> o navegador ignora.
  assert.equal(cabecalho("/(.*)", "Content-Security-Policy"), `${meta}; frame-ancestors 'none'`);
});

test("vercel.json: cache imutável só com ?v= na URL (ou para as fontes, que trocam de nome se mudarem)", () => {
  const imutaveis = config.headers.filter((r) => r.headers.some((h) => h.key === "Cache-Control" && /immutable/.test(h.value)));
  assert.ok(imutaveis.length > 0);
  for (const r of imutaveis) {
    const exigeV = (r.has || []).some((c) => c.type === "query" && c.key === "v");
    assert.ok(exigeV || r.source.startsWith("/fontes/"), `${r.source}: cache de 1 ano sem exigir ?v= serviria a versão velha`);
  }
  // E tudo que a página carrega leva ?v=, senão perde o cache longo.
  const refs = [...html.matchAll(/(?:src|href)="([^"#:][^"]*)"/g)].map((m) => m[1]);
  const app = fs.readFileSync(path.join(RAIZ, "app.js"), "utf8");
  refs.push(...[...app.matchAll(/"([\w-]+\.js\?v=[0-9a-f]+)"/g)].map((m) => m[1]));
  for (const ref of refs) {
    const [caminho, busca = ""] = ref.split("?");
    if (!/\.(js|css|svg|png)$/.test(caminho)) continue;
    assert.match(busca, /^v=[0-9a-f]{8}$/, `${ref}: sem ?v=hash`);
  }
});

test(".vercelignore não esconde nada que a página usa", () => {
  const ignorados = fs.readFileSync(path.join(RAIZ, ".vercelignore"), "utf8")
    .split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  const usados = [...html.matchAll(/(?:src|href)="([^"#:][^"?]*)/g)].map((m) => m[1].split("/")[0]);
  usados.push("ufs-geo.js", "calendario");
  for (const u of usados) assert.ok(!ignorados.includes(u), `${u} está no .vercelignore`);
  assert.ok(fs.existsSync(path.join(RAIZ, "index.html")));
});
