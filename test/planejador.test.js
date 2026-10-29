"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const F = require("../feriados.js");

// Implementação ingênua e independente, para conferir a programação dinâmica.
function forcaBruta(inicio, fim, { dias, periodos, uf = null }) {
  const feriados = new Set(F.feriadosEntre(F.somaDias(inicio, -15), F.somaDias(fim, 20), { facultativos: false, uf }).map((f) => f.data));
  const folga = (d) => feriados.has(d) || [0, 6].includes(F.diaDaSemana(d));
  const valido = (d) => !folga(d) && F.diaDaSemana(d) !== 5 && !feriados.has(F.somaDias(d, 1)) && !feriados.has(F.somaDias(d, 2));
  const bloco = (s, L) => {
    let a = s, b = F.somaDias(s, L - 1);
    while (folga(F.somaDias(a, -1))) a = F.somaDias(a, -1);
    while (folga(F.somaDias(b, 1))) b = F.somaDias(b, 1);
    return { a, b, ganho: F.diasEntre(a, b) + 1 - L };
  };
  const starts = [];
  for (let d = inicio; d <= fim; d = F.somaDias(d, 1)) if (valido(d)) starts.push(d);

  let melhor = null;
  const minimo = dias >= 14 ? 5 : dias;
  const maxP = dias >= 14 ? periodos : 1;
  function busca(depoisDe, resto, usados, temGrande, ganho) {
    if (resto === 0) {
      if (dias >= 14 && !temGrande) return;
      if (!melhor || ganho > melhor.ganho || (ganho === melhor.ganho && usados < melhor.usados)) melhor = { ganho, usados };
      return;
    }
    if (usados === maxP) return;
    for (const s of starts) {
      if (depoisDe && F.diasEntre(depoisDe, s) < 2) continue;
      for (let L = minimo; L <= resto; L++) {
        if (F.somaDias(s, L - 1) > fim) break;
        const bl = bloco(s, L);
        if (depoisDe && bl.a <= depoisDe) continue;
        busca(bl.b, resto - L, usados + 1, temGrande || L >= 14, ganho + bl.ganho);
      }
    }
  }
  busca(null, dias, 0, false, 0);
  return melhor;
}

test("planejarFerias: igual à força bruta em janelas curtas", () => {
  const casos = [
    ["2026-12-01", "2027-01-31", 10, 1, null],
    ["2026-12-01", "2027-01-31", 19, 2, null],
    ["2027-01-20", "2027-03-20", 19, 2, "RJ"], // Carnaval é feriado no RJ
    ["2027-03-15", "2027-05-15", 20, 2, "SP"],
    ["2027-10-01", "2027-11-25", 24, 2, null],
  ];
  for (const [ini, fim, dias, periodos, uf] of casos) {
    const r = F.planejarFerias(ini, fim, { dias, periodos, uf });
    const b = forcaBruta(ini, fim, { dias, periodos, uf });
    assert.equal(r.ganho, b.ganho, `${ini}..${fim} ${dias}d/${periodos}p ${uf}`);
    assert.equal(r.periodos.length, b.usados, `${ini}..${fim} ${dias}d/${periodos}p ${uf}: nº de períodos`);
  }
});

test("planejarFerias: respeita as regras da CLT", () => {
  const feriado = (uf) => new Set(F.feriadosEntre("2025-12-01", "2031-01-31", { facultativos: false, uf }).map((f) => f.data));
  for (const uf of [null, "SP", "RJ", "BA"]) {
    const fer = feriado(uf);
    const folga = (d) => fer.has(d) || [0, 6].includes(F.diaDaSemana(d));
    for (const ano of [2026, 2027, 2028, 2029]) {
      for (const [dias, periodos] of [[30, 1], [30, 2], [30, 3], [20, 3], [24, 2], [12, 3]]) {
        const ini = `${ano}-01-01`, fim = `${ano}-12-31`;
        const r = F.planejarFerias(ini, fim, { dias, periodos, uf });
        const ps = r.periodos;
        assert.equal(ps.reduce((s, p) => s + p.dias, 0), dias);
        assert.ok(ps.length <= (dias >= 14 ? periodos : 1));
        if (dias >= 14) assert.ok(ps.some((p) => p.dias >= 14), "um período de 14+ dias");
        for (const p of ps) {
          const dow = F.diaDaSemana(p.inicio);
          assert.ok(dow >= 1 && dow <= 4 && !fer.has(p.inicio), `${p.inicio}: começa em dia útil de seg a qui`);
          assert.ok(!fer.has(F.somaDias(p.inicio, 1)) && !fer.has(F.somaDias(p.inicio, 2)), `${p.inicio}: 2 dias antes de feriado`);
          assert.ok(p.dias >= Math.min(5, dias));
          assert.ok(p.inicio >= ini && p.fim <= fim);
          assert.equal(F.diasEntre(p.inicio, p.fim) + 1, p.dias);
          assert.equal(p.descanso.dias, p.dias + p.ganho);
          assert.ok(!folga(F.somaDias(p.descanso.inicio, -1)) && !folga(p.volta), "descanso é maximal");
        }
        for (let i = 1; i < ps.length; i++) {
          assert.ok(ps[i].descanso.inicio > ps[i - 1].volta, "períodos separados por dia útil");
        }
        assert.equal(r.descanso, dias + r.ganho);
      }
    }
  }
});

test("planejarFerias: 2027, 30 dias em 3 períodos viram 44 de descanso", () => {
  const r = F.planejarFerias("2026-11-28", "2027-11-27", { dias: 30, periodos: 3 });
  assert.equal(r.descanso, 44);
  assert.deepEqual(r.periodos.map((p) => [p.inicio, p.dias]), [["2026-12-28", 20], ["2027-03-29", 5], ["2027-11-08", 5]]);
});

test("planejarFerias: entradas inválidas e janela curta", () => {
  assert.throws(() => F.planejarFerias("2027-01-01", "2027-12-31", { dias: 31 }), RangeError);
  assert.throws(() => F.planejarFerias("2027-01-01", "2027-12-31", { dias: 0 }), RangeError);
  assert.throws(() => F.planejarFerias("2027-01-01", "2027-12-31", { periodos: 4 }), RangeError);
  assert.equal(F.planejarFerias("2027-01-01", "2027-01-20", { dias: 30 }), null);
});
