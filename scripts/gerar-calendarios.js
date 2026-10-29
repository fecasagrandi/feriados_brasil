#!/usr/bin/env node
/*
 * Gera os calendários assináveis: calendario/brasil.ics (nacionais) e calendario/<UF>.ics
 * (nacionais + estaduais), com pontos facultativos marcados no título.
 *
 * Quem assina a URL no Google Agenda, Outlook ou Apple recebe as correções sozinho: o UID de
 * cada evento é estável e o DTSTAMP é fixo, então o arquivo só muda quando um dado muda.
 * Quando muda (lei, fonte, tipo…), o SEQUENCE do evento sobe: é o que faz o cliente trocar
 * o evento antigo pelo novo. O histórico fica em scripts/revisoes-calendario.json
 * (chave do feriado → [hash do conteúdo, revisão]); por isso ele é versionado junto.
 *
 * Uso: node scripts/gerar-calendarios.js
 * test/calendarios.test.js falha se os arquivos estiverem desatualizados ou se a cobertura
 * estiver acabando (menos de 2 anos à frente): aí é só aumentar ANO_FIM e rodar de novo.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const F = require("../feriados.js");

const ANO_INICIO = 2025;
const ANO_FIM = 2030;
const DIR = path.join(__dirname, "..", "calendario");
const REVISOES = path.join(__dirname, "revisoes-calendario.json");

function lerRevisoes() {
  try { return JSON.parse(fs.readFileSync(REVISOES, "utf8")); } catch (e) { if (e.code === "ENOENT") return {}; throw e; }
}

// Nome e data já estão no UID; o resto do que aparece no evento entra no hash.
const chave = (f) => `${f.data}|${f.uf || ""}|${f.nome}`;
const conteudo = (f) =>
  crypto.createHash("sha256").update(JSON.stringify([f.tipo, f.obs, f.abrangencia, f.lei, f.fonte])).digest("hex").slice(0, 12);

function gerar(anteriores = lerRevisoes()) {
  const revisoes = { ...anteriores };
  const revisao = (f) => {
    const k = chave(f), h = conteudo(f), r = revisoes[k];
    if (!r) revisoes[k] = [h, 0];
    else if (r[0] !== h) revisoes[k] = [h, r[1] + 1];
    return revisoes[k][1];
  };
  const de = `${ANO_INICIO}-01-01`;
  const ate = `${ANO_FIM}-12-31`;
  const agora = new Date(Date.UTC(ANO_INICIO, 0, 1)); // fixo: o arquivo só muda quando os dados mudam
  const arquivos = {
    "brasil.ics": F.paraIcs(F.feriadosEntre(de, ate, { facultativos: true }), agora, { nome: "Feriadou · Brasil", revisao }),
  };
  for (const [uf, nome] of Object.entries(F.UFS)) {
    arquivos[`${uf}.ics`] = F.paraIcs(F.feriadosEntre(de, ate, { facultativos: true, uf }), agora, { nome: `Feriadou · ${nome}`, revisao });
  }
  const ordenadas = Object.fromEntries(Object.entries(revisoes).sort(([a], [b]) => a.localeCompare(b)));
  return { arquivos, revisoes: ordenadas };
}

module.exports = { gerar, ANO_INICIO, ANO_FIM, DIR, REVISOES };

if (require.main === module) {
  fs.mkdirSync(DIR, { recursive: true });
  const { arquivos, revisoes } = gerar();
  fs.writeFileSync(REVISOES, JSON.stringify(revisoes, null, 0).replace(/\],"/g, '],\n"') + "\n");
  for (const velho of fs.readdirSync(DIR)) {
    if (velho.endsWith(".ics") && !(velho in arquivos)) fs.unlinkSync(path.join(DIR, velho));
  }
  let total = 0;
  for (const [nome, conteudo] of Object.entries(arquivos)) {
    fs.writeFileSync(path.join(DIR, nome), conteudo);
    total += Buffer.byteLength(conteudo);
  }
  console.log(`${Object.keys(arquivos).length} calendários em calendario/ (${ANO_INICIO}–${ANO_FIM}), ${(total / 1024).toFixed(0)} KB no total`);
}
