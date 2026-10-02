#!/usr/bin/env node
/*
 * Cache busting sem build: acrescenta ?v=<hash do conteúdo> nas URLs dos assets.
 *
 * Por quê: o GitHub Pages serve cada arquivo com cache de 10 min, e cada um expira
 * numa hora diferente. Sem versão na URL, logo após um deploy o navegador pode
 * juntar app.js novo com feriados.js antigo — e a página quebra.
 *
 * Uso:  node scripts/versionar.js          (atualiza os arquivos)
 *       node scripts/versionar.js --check  (só confere; sai com erro se algo estiver velho)
 */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const RAIZ = path.join(__dirname, "..");

// Ordem importa: app.js referencia ufs-geo.js, então ele é carimbado antes de ter o próprio hash calculado.
const ALVOS = [
  { arquivo: "app.js", assets: ["ufs-geo.js"] },
  { arquivo: "index.html", assets: ["favicon.svg", "apple-touch-icon.png", "tema.js", "estilo.css", "bandeira.svg", "og.png", "feriados.js", "localizacao.js", "app.js"] },
];

const hash = (arquivo) =>
  crypto.createHash("sha256").update(fs.readFileSync(path.join(RAIZ, arquivo))).digest("hex").slice(0, 8);

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function versionar({ escrever }) {
  const alterados = [];
  for (const { arquivo, assets } of ALVOS) {
    const caminho = path.join(RAIZ, arquivo);
    const antes = fs.readFileSync(caminho, "utf8");
    let depois = antes;
    for (const asset of assets) {
      // Casa "asset", "asset?v=xxxx" ou uma URL terminando no asset (".../og.png"), entre aspas.
      const re = new RegExp(`(["'])((?:[^"'\\s]*/)?)${escapar(asset)}(\\?v=[0-9a-f]+)?\\1`, "g");
      if (!re.test(depois)) throw new Error(`${arquivo} não referencia ${asset}`);
      depois = depois.replace(re, `$1$2${asset}?v=${hash(asset)}$1`);
    }
    if (depois !== antes) {
      alterados.push(arquivo);
      if (escrever) fs.writeFileSync(caminho, depois);
    }
  }
  return alterados;
}

module.exports = { versionar };

if (require.main === module) {
  const checar = process.argv.includes("--check");
  const alterados = versionar({ escrever: !checar });
  if (checar && alterados.length) {
    console.error(`versões desatualizadas em: ${alterados.join(", ")} — rode: node scripts/versionar.js`);
    process.exit(1);
  }
  console.log(alterados.length ? `atualizado: ${alterados.join(", ")}` : "versões em dia");
}
