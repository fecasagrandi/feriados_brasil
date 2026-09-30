#!/usr/bin/env node
/*
 * Gera ufs-geo.js (contornos simplificados das 27 UFs) a partir de um GeoJSON.
 *
 * Fonte usada: https://github.com/giuliano-oliveira/geodata-br-states (MIT),
 * derivado da camada "Estados do Brasil" do LAGEAMB/UFPR.
 *
 * Uso: node scripts/gerar-ufs-geo.js caminho/br_states.json
 */
"use strict";
const fs = require("fs");
const path = require("path");

const TOLERANCIA = 0.01; // graus (~1 km). Menor = mais preciso e mais pesado.
const CASAS = 3;         // ~100 m

// Distância perpendicular do ponto p ao segmento a-b (em graus, plano).
function distSeg(p, a, b) {
  const [x, y] = p, [x1, y1] = a, [x2, y2] = b;
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((x - x1) * dx + (y - y1) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

// Douglas–Peucker iterativo (anéis de estados grandes estouram a pilha se recursivo).
function simplificar(pts, tol) {
  if (pts.length < 3) return pts;
  const manter = new Uint8Array(pts.length);
  manter[0] = manter[pts.length - 1] = 1;
  const pilha = [[0, pts.length - 1]];
  while (pilha.length) {
    const [i, j] = pilha.pop();
    let max = 0, idx = -1;
    for (let k = i + 1; k < j; k++) {
      const d = distSeg(pts[k], pts[i], pts[j]);
      if (d > max) { max = d; idx = k; }
    }
    if (max > tol) {
      manter[idx] = 1;
      pilha.push([i, idx], [idx, j]);
    }
  }
  return pts.filter((_, k) => manter[k]);
}

const arredonda = (n) => Number(n.toFixed(CASAS));

const entrada = process.argv[2];
if (!entrada) {
  console.error("uso: node scripts/gerar-ufs-geo.js br_states.json");
  process.exit(1);
}

const geo = JSON.parse(fs.readFileSync(entrada, "utf8"));
const saida = {};
for (const f of geo.features) {
  const uf = f.properties.SIGLA || f.properties.sigla;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  saida[uf] = polys
    .map((aneis) =>
      aneis
        .map((anel) => simplificar(anel, TOLERANCIA).map(([lng, lat]) => [arredonda(lng), arredonda(lat)]))
        .filter((anel) => anel.length >= 4)
    )
    .filter((aneis) => aneis.length);
}

const js =
  "/* Gerado por scripts/gerar-ufs-geo.js — não editar à mão.\n" +
  " * Contornos simplificados das UFs, [lng, lat]. Fonte: github.com/giuliano-oliveira/geodata-br-states (MIT). */\n" +
  "(function (root) {\n" +
  "  var UFS_GEO = " + JSON.stringify(saida) + ";\n" +
  '  if (typeof module !== "undefined" && module.exports) module.exports = UFS_GEO;\n' +
  "  else root.UFS_GEO = UFS_GEO;\n" +
  '})(typeof globalThis !== "undefined" ? globalThis : this);\n';

const destino = path.join(__dirname, "..", "ufs-geo.js");
fs.writeFileSync(destino, js);
console.log(`${destino}: ${(js.length / 1024).toFixed(1)} KB, ${Object.keys(saida).length} UFs`);
