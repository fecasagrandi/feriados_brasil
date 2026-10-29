#!/usr/bin/env node
/*
 * Gera os calendários assináveis: calendario/brasil.ics (nacionais) e calendario/<UF>.ics
 * (nacionais + estaduais), com pontos facultativos marcados no título.
 *
 * Quem assina a URL no Google Agenda, Outlook ou Apple recebe as correções sozinho: o UID de
 * cada evento é estável e o DTSTAMP é fixo, então o arquivo só muda quando um dado muda.
 *
 * Uso: node scripts/gerar-calendarios.js
 * test/calendarios.test.js falha se os arquivos estiverem desatualizados ou se a cobertura
 * estiver acabando (menos de 2 anos à frente): aí é só aumentar ANO_FIM e rodar de novo.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const F = require("../feriados.js");

const ANO_INICIO = 2025;
const ANO_FIM = 2030;
const DIR = path.join(__dirname, "..", "calendario");

function gerar() {
  const de = `${ANO_INICIO}-01-01`;
  const ate = `${ANO_FIM}-12-31`;
  const agora = new Date(Date.UTC(ANO_INICIO, 0, 1)); // fixo: o arquivo só muda quando os dados mudam
  const arquivos = {
    "brasil.ics": F.paraIcs(F.feriadosEntre(de, ate, { facultativos: true }), agora, { nome: "Feriadou · Brasil" }),
  };
  for (const [uf, nome] of Object.entries(F.UFS)) {
    arquivos[`${uf}.ics`] = F.paraIcs(F.feriadosEntre(de, ate, { facultativos: true, uf }), agora, { nome: `Feriadou · ${nome}` });
  }
  return arquivos;
}

module.exports = { gerar, ANO_INICIO, ANO_FIM, DIR };

if (require.main === module) {
  fs.mkdirSync(DIR, { recursive: true });
  const arquivos = gerar();
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
