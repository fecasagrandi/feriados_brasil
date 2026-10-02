#!/usr/bin/env node
/*
 * Gera og.png (1200x630), a imagem da prévia de link (WhatsApp, Telegram, redes).
 * Renderiza um HTML com as fontes e o ícone do próprio site num Chromium (Playwright).
 * Uso: node scripts/gerar-og.js   (PLAYWRIGHT_CHROMIUM_PATH opcional)
 */
"use strict";
const path = require("path");
const fs = require("fs");
const { chromium } = require("@playwright/test");

const RAIZ = path.join(__dirname, "..");
const fonte = (f) => `data:font/woff2;base64,${fs.readFileSync(path.join(RAIZ, "fontes", f)).toString("base64")}`;
const icone = `data:image/svg+xml;base64,${fs.readFileSync(path.join(RAIZ, "favicon.svg")).toString("base64")}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: B; font-weight: 600; src: url(${fonte("barlow-condensed-600.woff2")}); }
@font-face { font-family: M; font-weight: 400; src: url(${fonte("dm-mono-400.woff2")}); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #f2f1ed; color: #1b1a17; font-family: M;
  display: grid; grid-template-columns: 330px 1fr; align-items: center; gap: 70px; padding: 0 100px; }
.folha { width: 330px; background: #fff; border-radius: 10px; overflow: hidden; text-align: center;
  box-shadow: 0 2px 0 #d2cec5, 0 30px 50px -28px rgba(40,30,20,.5); }
.faixa { background: #c41e1a; color: #fff; font-size: 26px; letter-spacing: .28em; padding: 22px 0 18px; }
.dia { font: 600 210px/1 B; color: #c41e1a; padding-top: 22px; }
.sem { font-size: 22px; letter-spacing: .2em; color: #6b6860; padding: 6px 0 34px; }
.marca { display: flex; align-items: center; gap: 18px; font-size: 26px; letter-spacing: .24em; margin-bottom: 30px; }
.marca img { width: 44px; height: 44px; }
h1 { font: 600 92px/0.95 B; margin-bottom: 28px; }
p { font-size: 25px; line-height: 1.5; color: #6b6860; }
</style></head><body>
<div class="folha"><div class="faixa">FERIADO</div><div class="dia">F</div><div class="sem">DIA VERMELHO</div></div>
<div>
  <div class="marca"><img src="${icone}"> FERIADOU</div>
  <h1>Quanto falta para o próximo feriado?</h1>
  <p>Nacionais e do seu estado, qualquer ano.<br>Calculado no navegador, sem cookies.</p>
</div>
</body></html>`;

(async () => {
  const exe = process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const navegador = await chromium.launch(exe ? { executablePath: exe } : {});
  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
  await pagina.setContent(html);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: path.join(RAIZ, "og.png") });
  await navegador.close();
  console.log("og.png gerado");
})();
