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
  assert.equal(todos.length, 16);
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

// ---------- feriados estaduais ----------

test("sem UF não entra nenhum feriado estadual", () => {
  assert.ok(F.feriadosDoAno(2026).every((f) => f.abrangencia === "nacional"));
});

test("SP inclui 9 de julho só a partir de 1997", () => {
  const tem = (ano) => F.feriadosDoAno(ano, { uf: "SP" }).some((f) => f.data === `${ano}-07-09`);
  assert.equal(tem(1996), false);
  assert.equal(tem(1997), true);
  const f = F.feriadosDoAno(2026, { uf: "SP" }).find((x) => x.data === "2026-07-09");
  assert.deepEqual(
    { nome: f.nome, tipo: f.tipo, abrangencia: f.abrangencia, uf: f.uf },
    { nome: "Revolução Constitucionalista", tipo: "feriado", abrangencia: "estadual", uf: "SP" }
  );
});

test("ES: Nossa Senhora da Penha é móvel (Páscoa + 8)", () => {
  const f = F.feriadosDoAno(2026, { uf: "ES" }).find((x) => x.nome === "Nossa Senhora da Penha");
  assert.equal(f.data, "2026-04-13"); // Páscoa 05/04 + 8
  assert.equal(F.diaDaSemana(f.data), 1); // sempre segunda
});

test("RJ: terça de Carnaval vira feriado estadual e some o ponto facultativo duplicado", () => {
  const dia = F.feriadosDoAno(2026, { uf: "RJ" }).filter((f) => f.data === "2026-02-17");
  assert.equal(dia.length, 1);
  assert.equal(dia[0].tipo, "feriado");
  assert.equal(dia[0].abrangencia, "estadual");
});

test("24/12 e 31/12 são ponto facultativo a partir das 13h", () => {
  const l = F.feriadosDoAno(2026).filter((f) => f.data === "2026-12-24" || f.data === "2026-12-31");
  assert.deepEqual(l.map((f) => [f.data, f.tipo, f.obs]), [
    ["2026-12-24", "facultativo", "a partir das 13h"],
    ["2026-12-31", "facultativo", "a partir das 13h"],
  ]);
  const ics = F.paraIcs(l, new Date(0));
  assert.ok(ics.includes("DESCRIPTION:Ponto facultativo (a partir das 13h)"));
});

test("todo feriado estadual cita a lei (1990 a 2030)", () => {
  for (const uf of Object.keys(F.UFS)) {
    for (let ano = 1990; ano <= 2030; ano++) {
      for (const f of F.feriadosDoAno(ano, { uf }).filter((f) => f.abrangencia === "estadual")) {
        assert.ok(f.lei, `${uf} ${f.data} ${f.nome}`);
      }
    }
  }
});

test("AC: Tratado de Petrópolis é feriado (Lei 57/1965)", () => {
  const f = F.feriadosDoAno(2026, { uf: "AC", facultativos: false }).find((f) => f.nome === "Tratado de Petrópolis");
  assert.equal(f.data, "2026-11-17");
  assert.equal(f.lei, "Lei 57/1965");
});

test("Consciência Negra estadual antes de 2024, só nacional depois", () => {
  const vinteNov = (uf, ano) =>
    F.feriadosDoAno(ano, { uf }).filter((f) => f.data === `${ano}-11-20`).map((f) => f.abrangencia);
  assert.deepEqual(vinteNov("RJ", 2020), ["estadual"]);
  assert.deepEqual(vinteNov("MT", 2002), []); // lei de 27/12/2002
  assert.deepEqual(vinteNov("MT", 2003), ["estadual"]);
  assert.deepEqual(vinteNov("SP", 2022), []);
  assert.deepEqual(vinteNov("SP", 2023), ["estadual"]);
  assert.deepEqual(vinteNov("BA", 2020), []);
  for (const uf of ["AL", "AM", "AP", "MT", "RJ", "SP"]) assert.deepEqual(vinteNov(uf, 2026), ["nacional"], uf);
});

test("RJ: terça de Carnaval só é feriado a partir de 2009 (lei de 14/05/2008)", () => {
  const terca = (ano) => F.feriadosDoAno(ano, { uf: "RJ" }).find((f) => f.nome.startsWith("Carnaval") && f.data === F.somaDias(F.pascoa(ano), -47));
  assert.equal(terca(2008).abrangencia, "nacional");
  assert.equal(terca(2009).abrangencia, "estadual");
});

test("todas as 27 UFs funcionam e nenhuma gera feriado duplicado", () => {
  assert.equal(Object.keys(F.UFS).length, 27);
  for (const uf of Object.keys(F.UFS)) {
    const l = F.feriadosDoAno(2026, { uf });
    const chaves = l.map((f) => f.data + f.nome);
    assert.equal(new Set(chaves).size, chaves.length, uf);
    for (let i = 1; i < l.length; i++) assert.ok(l[i - 1].data <= l[i].data, uf);
  }
});

test("UF inválida lança RangeError", () => {
  for (const ruim of ["XX", "sp", "", 35]) {
    assert.throws(() => F.feriadosDoAno(2026, { uf: ruim }), RangeError);
  }
});

test("paraIcs descreve feriado estadual com a UF", () => {
  const ics = F.paraIcs(F.feriadosDoAno(2026, { uf: "SP" }), new Date(0));
  assert.ok(ics.includes("SUMMARY:Revolução Constitucionalista\r\nDESCRIPTION:Feriado estadual (SP)"));
});

test("divergências resolvidas: AC 23/01 (Lei 1.538/2004), PE 06/03 desde 2017, PR e SC sem feriado útil", () => {
  const de = (uf, ano) => F.feriadosDoAno(ano, { uf, facultativos: false }).filter((f) => f.abrangencia === "estadual");
  assert.ok(de("AC", 2026).some((f) => f.data === "2026-01-23" && f.nome === "Dia do Evangélico"));
  assert.ok(de("PE", 2026).some((f) => f.data === "2026-03-06"));
  assert.ok(!de("PE", 2016).some((f) => f.data === "2016-03-06"));
  assert.deepEqual(de("PR", 2026), []);
  assert.deepEqual(de("SC", 2026), []);
});

// ---------- planejador de folgas ----------

test("planejador: sugestões de 30/09/2026 a 30/09/2027 (conferidas à mão)", () => {
  const r = F.oportunidades("2026-09-30", "2027-09-30").map((o) => [o.inicio, o.fim, o.dias, o.ferias.length]);
  assert.deepEqual(r, [
    ["2026-12-25", "2027-01-03", 10, 4], // Natal (sex) + Ano-Novo (sex): 28 a 31/12 de férias
    ["2027-04-17", "2027-04-21", 5, 2], // Tiradentes (qua): 19 e 20/04
    ["2027-09-04", "2027-09-07", 4, 1], // Independência (ter): 06/09
  ]);
});

test("planejador: férias só em dias úteis, bloco começa e termina em folga", () => {
  for (const o of F.oportunidades("2026-01-01", "2030-12-31", { uf: "SP" })) {
    for (const d of o.ferias) {
      const dow = F.diaDaSemana(d);
      assert.ok(dow >= 1 && dow <= 5, `${d} não é dia útil`);
    }
    assert.ok(o.feriados.length > 0);
    assert.equal(o.dias, F.diasEntre(o.inicio, o.fim) + 1);
    assert.ok(o.dias / o.ferias.length >= 2.5);
  }
});

test("planejador: ponto facultativo não conta como folga, mas feriado estadual conta", () => {
  // Carnaval 2027: terça 09/02 é facultativo no país, mas feriado estadual no RJ
  const temCarnaval = (opts) => F.oportunidades("2027-01-15", "2027-03-01", opts).some((o) => o.inicio <= "2027-02-09" && o.fim >= "2027-02-09");
  assert.equal(temCarnaval({}), false);
  assert.equal(temCarnaval({ uf: "RJ" }), true); // segunda 08/02 de férias: sáb 06 a ter 09
});

// ---------- o que cada feriado comemora ----------

const S = require("../sobre.js");

test("todo feriado, nacional ou estadual, tem texto e fonte (1990 a 2030)", () => {
  const vistos = new Set();
  for (const uf of [null, ...Object.keys(F.UFS)]) {
    for (let ano = 1990; ano <= 2030; ano++) {
      for (const f of F.feriadosDoAno(ano, { uf })) {
        const chave = `${f.uf || ""}:${f.nome}`;
        if (vistos.has(chave)) continue;
        vistos.add(chave);
        const s = S.sobre(f);
        assert.ok(s, `sem texto: ${chave}`);
        assert.ok(s.texto.length > 40, chave);
        assert.match(s.fonte.url, /^https?:\/\/[^/]*\.(gov|leg)\.br\/|^https?:\/\/[^/]*ebc\.com\.br\//, chave);
      }
    }
  }
});

test("estadual com nome igual ao nacional usa o texto nacional (Consciência Negra antes de 2024)", () => {
  const f = F.feriadosDoAno(2020, { uf: "RJ" }).find((f) => f.data === "2020-11-20");
  assert.equal(S.sobre(f), S.sobre({ nome: "Consciência Negra" }));
});

test("RO: Dia do Evangélico (18/06) só até 2019, derrubado pelo STF", () => {
  const tem = (ano) => F.feriadosDoAno(ano, { uf: "RO" }).some((f) => f.nome === "Dia do Evangélico");
  assert.equal(tem(2019), true);
  assert.equal(tem(2020), false);
});
