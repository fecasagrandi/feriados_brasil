const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { gerar, ANO_FIM, DIR, REVISOES } = require("../scripts/gerar-calendarios.js");

const { arquivos: gerados, revisoes } = gerar();
const REGENERAR = "rode: node scripts/gerar-calendarios.js";

test("calendários assináveis estão em dia com os dados", () => {
  const noDisco = fs.readdirSync(DIR).filter((f) => f.endsWith(".ics")).sort();
  assert.deepEqual(noDisco, Object.keys(gerados).sort(), `arquivos sobrando ou faltando — ${REGENERAR}`);
  for (const [nome, conteudo] of Object.entries(gerados)) {
    assert.equal(fs.readFileSync(path.join(DIR, nome), "utf8"), conteudo, `calendario/${nome} desatualizado — ${REGENERAR}`);
  }
});

test("histórico de revisões está em dia (senão o SEQUENCE não sobe e a correção não chega)", () => {
  assert.deepEqual(JSON.parse(fs.readFileSync(REVISOES, "utf8")), revisoes, `scripts/revisoes-calendario.json desatualizado — ${REGENERAR}`);
});

test("corrigir a lei de um feriado sobe o SEQUENCE só daquele evento, mantendo o UID", () => {
  const estaduais = require("../estaduais.js");
  const sp = estaduais.SP[0];
  const antes = sp.lei;
  try {
    sp.lei = antes + " (corrigida)";
    const depois = gerar(revisoes).arquivos["SP.ics"];
    const evento = (ics, ano) => ics.split("BEGIN:VEVENT").find((e) => e.includes(`DTSTART;VALUE=DATE:${ano}0709`));
    assert.match(evento(gerados["SP.ics"], 2027), /SEQUENCE:0/);
    assert.match(evento(depois, 2027), /SEQUENCE:1/);
    assert.equal(evento(depois, 2027).match(/^UID:.*$/m)[0], evento(gerados["SP.ics"], 2027).match(/^UID:.*$/m)[0]);
    assert.equal(depois.match(/SEQUENCE:1/g).length, ANO_FIM - 2025 + 1); // um por ano, nenhum outro evento
  } finally {
    sp.lei = antes;
  }
});

test("calendários cobrem pelo menos os próximos 2 anos (lembrete para aumentar ANO_FIM)", () => {
  const minimo = new Date().getFullYear() + 2;
  assert.ok(ANO_FIM >= minimo, `cobertura termina em ${ANO_FIM}: aumente ANO_FIM em scripts/gerar-calendarios.js — ${REGENERAR}`);
});

test("cada calendário é iCalendar válido: nome, linhas ≤ 75 octetos, UIDs únicos", () => {
  assert.equal(Object.keys(gerados).length, 28); // Brasil + 27 UFs
  for (const [nome, ics] of Object.entries(gerados)) {
    assert.match(ics, /^BEGIN:VCALENDAR\r\n/, nome);
    assert.match(ics, /X-WR-CALNAME:Feriadou · /, nome);
    for (const l of ics.split("\r\n")) assert.ok(Buffer.byteLength(l) <= 75, `${nome}: linha longa`);
    const uids = ics.match(/^UID:.*$/gm);
    assert.ok(uids.length > 50, `${nome}: poucos eventos`);
    assert.equal(new Set(uids).size, uids.length, `${nome}: UID repetido`);
  }
  assert.ok(gerados["SP.ics"].includes("SUMMARY:Revolução Constitucionalista"));
  assert.ok(!gerados["brasil.ics"].includes("Revolução Constitucionalista"));
});
