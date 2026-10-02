#!/usr/bin/env node
// Servidor estático mínimo para desenvolvimento e testes E2E (sem dependências).
// Uso: node scripts/servidor.js [porta]
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const PORTA = Number(process.argv[2]) || 4173;
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};

http
  .createServer((req, res) => {
    const caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const arquivo = path.normalize(path.join(RAIZ, caminho === "/" ? "index.html" : caminho));
    if (!arquivo.startsWith(RAIZ) || arquivo.includes(`${path.sep}node_modules${path.sep}`)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(arquivo, (erro, dados) => {
      if (erro) return res.writeHead(404).end();
      res.writeHead(200, { "content-type": TIPOS[path.extname(arquivo)] || "application/octet-stream" }).end(dados);
    });
  })
  .listen(PORTA, () => console.log(`http://localhost:${PORTA}`));
