// Valida o formato de estaduais.js: quem edita uma data recebe um erro claro em vez de um site quebrado.
const test = require("node:test");
const assert = require("node:assert/strict");
const ESTADUAIS = require("../estaduais.js");
const { UFS } = require("../feriados.js");

const CAMPOS = new Set(["mes", "dia", "pascoa", "nome", "lei", "desde", "ate", "tipo", "fonte"]);
const diasNoMes = (mes) => new Date(Date.UTC(2024, mes, 0)).getUTCDate(); // 2024 é bissexto: aceita 29/02

for (const [uf, itens] of Object.entries(ESTADUAIS)) {
  test(`estaduais.js: ${uf}`, () => {
    assert.ok(Object.hasOwn(UFS, uf), `UF desconhecida: ${uf}`);
    assert.ok(Array.isArray(itens) && itens.length > 0, `${uf}: lista vazia (UF sem feriado não precisa de entrada)`);
    const vistos = new Set();
    for (const f of itens) {
      const onde = `${uf} / ${f.nome || "(sem nome)"}`;
      for (const k of Object.keys(f)) assert.ok(CAMPOS.has(k), `${onde}: campo desconhecido "${k}"`);

      assert.equal(typeof f.nome, "string", `${onde}: nome`);
      assert.ok(f.nome.trim(), `${onde}: nome vazio`);
      assert.equal(typeof f.lei, "string", `${onde}: falta a lei`);
      assert.ok(f.lei.trim(), `${onde}: lei vazia`);

      const fixa = f.mes != null || f.dia != null;
      assert.ok(fixa !== (f.pascoa != null), `${onde}: use mes+dia OU pascoa, não os dois nem nenhum`);
      if (fixa) {
        assert.ok(Number.isInteger(f.mes) && f.mes >= 1 && f.mes <= 12, `${onde}: mes inválido`);
        assert.ok(Number.isInteger(f.dia) && f.dia >= 1 && f.dia <= diasNoMes(f.mes), `${onde}: dia inválido`);
      } else {
        assert.ok(Number.isInteger(f.pascoa) && Math.abs(f.pascoa) <= 70, `${onde}: pascoa inválido`);
      }

      for (const k of ["desde", "ate"]) {
        if (f[k] != null) assert.ok(Number.isInteger(f[k]) && f[k] >= 1583 && f[k] <= 9999, `${onde}: ${k} inválido`);
      }
      if (f.desde != null && f.ate != null) assert.ok(f.desde <= f.ate, `${onde}: desde depois de ate`);
      if (f.tipo != null) assert.ok(["feriado", "facultativo"].includes(f.tipo), `${onde}: tipo inválido`);
      if (f.fonte != null) assert.match(f.fonte, /^https:\/\/\S+$/, `${onde}: fonte deve ser uma URL https`);

      const chave = fixa ? `${f.mes}-${f.dia}-${f.nome}` : `p${f.pascoa}-${f.nome}`;
      assert.ok(!vistos.has(chave), `${onde}: duplicado`);
      vistos.add(chave);
    }
  });
}
