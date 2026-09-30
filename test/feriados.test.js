const test = require("node:test");
const assert = require("node:assert/strict");
const F = require("../feriados.js");

test("Páscoa: datas conhecidas, incluindo os extremos (22/mar e 25/abr)", () => {
  const casos = {
    1818: "1818-03-22",
    1943: "1943-04-25",
    2000: "2000-04-23",
    2019: "2019-04-21",
    2024: "2024-03-31",
    2025: "2025-04-20",
    2026: "2026-04-05",
    2027: "2027-03-28",
    2038: "2038-04-25",
    2285: "2285-03-22",
  };
  for (const [ano, esperado] of Object.entries(casos)) {
    assert.equal(F.pascoa(Number(ano)), esperado, `Páscoa de ${ano}`);
  }
});

test("Páscoa sempre cai num domingo entre 22/mar e 25/abr", () => {
  for (let ano = 1583; ano <= 3000; ano++) {
    const p = F.pascoa(ano);
    assert.equal(F.diaDaSemana(p), 0, `${p} não é domingo`);
    const mmdd = p.slice(5);
    assert.ok(mmdd >= "03-22" && mmdd <= "04-25", `${p} fora da janela`);
  }
});

test("2026: datas móveis corretas (regressão do Carnaval em 03/03)", () => {
  const por = Object.fromEntries(F.feriadosDoAno(2026).map((f) => [f.nome, f.data]));
  assert.equal(por["Carnaval (terça)"], "2026-02-17");
  assert.equal(por["Paixão de Cristo"], "2026-04-03");
  assert.equal(por["Corpus Christi"], "2026-06-04");
});

test("Carnaval e Corpus Christi são ponto facultativo; Paixão de Cristo é feriado", () => {
  const tipo = Object.fromEntries(F.feriadosDoAno(2026).map((f) => [f.nome, f.tipo]));
  assert.equal(tipo["Carnaval (terça)"], "facultativo");
  assert.equal(tipo["Corpus Christi"], "facultativo");
  assert.equal(tipo["Paixão de Cristo"], "feriado");
});

test("facultativos: false remove só os pontos facultativos", () => {
  const todos = F.feriadosDoAno(2026);
  const soFeriados = F.feriadosDoAno(2026, { facultativos: false });
  assert.equal(todos.length, 14);
  assert.equal(soFeriados.length, 10);
  assert.ok(soFeriados.every((f) => f.tipo === "feriado"));
});

test("Consciência Negra só é nacional a partir de 2024", () => {
  const tem = (ano) => F.feriadosDoAno(ano).some((f) => f.nome === "Consciência Negra");
  assert.equal(tem(2023), false);
  assert.equal(tem(2024), true);
});

test("lista vem ordenada, inclusive quando datas coincidem (2000)", () => {
  const l = F.feriadosDoAno(2000);
  for (let i = 1; i < l.length; i++) assert.ok(l[i - 1].data <= l[i].data);
  const dia21 = l.filter((f) => f.data === "2000-04-21").map((f) => f.nome);
  assert.deepEqual(dia21, ["Paixão de Cristo", "Tiradentes"]);
});

test("feriadosEntre atravessa a virada de ano e é inclusivo", () => {
  const l = F.feriadosEntre("2026-12-25", "2027-01-01", { facultativos: false });
  assert.deepEqual(
    l.map((f) => f.data),
    ["2026-12-25", "2027-01-01"]
  );
});

test("diasEntre conta dias de calendário, inclusive em ano bissexto", () => {
  assert.equal(F.diasEntre("2026-09-30", "2026-10-12"), 12);
  assert.equal(F.diasEntre("2028-02-28", "2028-03-01"), 2);
  assert.equal(F.diasEntre("2026-10-12", "2026-09-30"), -12);
});

test("classificar: impacto no calendário útil", () => {
  assert.equal(F.classificar("2026-10-12"), "feriadão"); // segunda
  assert.equal(F.classificar("2026-11-20"), "feriadão"); // sexta
  assert.equal(F.classificar("2026-12-25"), "feriadão"); // sexta
  assert.equal(F.classificar("2026-04-21"), "ponte"); // terça
  assert.equal(F.classificar("2026-11-15"), "fim de semana"); // domingo
  assert.equal(F.classificar("2026-11-18"), null); // quarta
});

test("ano inválido lança RangeError", () => {
  for (const ruim of [1582, 10000, 2026.5, "2026", NaN]) {
    assert.throws(() => F.feriadosDoAno(ruim), RangeError);
  }
});

test("paraIcs gera iCalendar válido (CRLF, DTEND exclusivo, linhas ≤ 75 octetos)", () => {
  const lista = F.feriadosDoAno(2026);
  const ics = F.paraIcs(lista, new Date("2026-09-30T18:25:11.123Z"));
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.ok(!/[^\r]\n/.test(ics), "toda quebra de linha deve ser CRLF");
  assert.equal(ics.match(/BEGIN:VEVENT/g).length, lista.length);
  assert.ok(ics.includes("DTSTAMP:20260930T182511Z"));
  assert.ok(ics.includes("DTSTART;VALUE=DATE:20261225\r\nDTEND;VALUE=DATE:20261226"));
  assert.ok(ics.includes("UID:2026-02-18-quarta-feira-de-cinzas@feriados-brasil"));
  assert.ok(ics.includes("DESCRIPTION:Ponto facultativo (até 14h)"));
  for (const linha of ics.split("\r\n")) {
    assert.ok(Buffer.byteLength(linha) <= 75, `linha longa demais: ${linha}`);
  }
});

test("paraIcs escapa caracteres especiais do iCalendar", () => {
  const ics = F.paraIcs([{ data: "2026-01-01", nome: "a,b;c\\d", tipo: "feriado" }], new Date(0));
  assert.ok(ics.includes(String.raw`SUMMARY:a\,b\;c\\d`));
});
