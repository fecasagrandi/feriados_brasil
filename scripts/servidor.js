#!/usr/bin/env node
// Servidor estático mínimo para desenvolvimento e testes E2E (sem dependências).
// Uso: node scripts/servidor.js [porta]
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const PORTA = Number(process.argv[2] ?? 4173); // 0 = porta livre qualquer (usado nos testes)
const HOST = "127.0.0.1"; // só a própria máquina, nunca a rede
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};

http
  .createServer((req, res) => {
    let caminho;
    try {
      caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
    } catch {
      return res.writeHead(400).end();
    }
    const arquivo = path.resolve(RAIZ, "." + (caminho === "/" ? "/index.html" : caminho));

    // Só arquivos públicos do projeto: nada fora da raiz (comparando por segmento de
    // caminho, não por prefixo de texto), nada oculto (.git, .github...) e nada de node_modules.
    const relativo = path.relative(RAIZ, arquivo);
    const partes = relativo.split(path.sep);
    if (
      relativo === "" ||
      path.isAbsolute(relativo) ||
      partes[0] === ".." ||
      partes.some((p) => p.startsWith(".") || p === "node_modules")
    ) {
      return res.writeHead(403).end();
    }
    fs.readFile(arquivo, (erro, dados) => {
      if (erro) return res.writeHead(404).end();
      res.writeHead(200, { "content-type": TIPOS[path.extname(arquivo)] || "application/octet-stream" }).end(dados);
    });
  })
  .listen(PORTA, HOST, function () {
    console.log(`http://${HOST}:${this.address().port}`);
  });
