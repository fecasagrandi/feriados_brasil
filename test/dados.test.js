// Valida o formato de estaduais.js e municipais.js: quem edita uma data recebe um erro claro
// em vez de um site quebrado.
const test = require("node:test");
const assert = require("node:assert/strict");
const ESTADUAIS = require("../estaduais.js");
const MUNICIPAIS = require("../municipais.js");
const { UFS } = require("../feriados.js");

const CAMPOS = new Set(["mes", "dia", "pascoa", "nome", "lei", "desde", "ate", "tipo", "fonte"]);
const CAMPOS_MUNICIPAIS = new Set([...CAMPOS, "ato"]);
// Ano não bissexto: um feriado fixo em 29/02 viraria 01/03 nos outros anos, então é recusado.
const diasNoMes = (mes) => new Date(Date.UTC(2023, mes, 0)).getUTCDate();

function validar(rotulo, itens, campos) {
  assert.ok(Array.isArray(itens) && itens.length > 0, `${rotulo}: lista vazia (sem feriado não precisa de entrada)`);
  const vistos = new Set();
  for (const f of itens) {
    const onde = `${rotulo} / ${f.nome || "(sem nome)"}`;
    for (const k of Object.keys(f)) assert.ok(campos.has(k), `${onde}: campo desconhecido "${k}"`);

    assert.equal(typeof f.nome, "string", `${onde}: nome`);
    assert.ok(f.nome.trim(), `${onde}: nome vazio`);
    assert.equal(typeof f.lei, "string", `${onde}: falta a lei`);
    assert.ok(f.lei.trim(), `${onde}: lei vazia`);
    if (f.lei === "a confirmar") assert.ok(typeof f.ato === "string" && f.ato.trim(), `${onde}: sem lei, diga em \`ato\` onde a data foi confirmada`);
    if (f.ato != null) assert.equal(f.lei, "a confirmar", `${onde}: \`ato\` só quando a lei está "a confirmar"`);

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
}

for (const [uf, itens] of Object.entries(ESTADUAIS)) {
  test(`estaduais.js: ${uf}`, () => {
    assert.ok(Object.hasOwn(UFS, uf), `UF desconhecida: ${uf}`);
    validar(uf, itens, CAMPOS);
  });
}

for (const [uf, capital] of Object.entries(MUNICIPAIS)) {
  test(`municipais.js: ${uf}`, () => {
    assert.ok(Object.hasOwn(UFS, uf), `UF desconhecida: ${uf}`);
    assert.deepEqual(Object.keys(capital).sort(), ["cidade", "feriados"], `${uf}: use { cidade, feriados }`);
    assert.ok(typeof capital.cidade === "string" && capital.cidade.trim(), `${uf}: falta o nome da cidade`);
    validar(`${uf} (${capital.cidade})`, capital.feriados, CAMPOS_MUNICIPAIS);
    for (const f of capital.feriados) assert.ok(f.tipo == null, `${uf} / ${f.nome}: municipal é sempre feriado`);
  });
}

test("municipais.js: toda data \"a confirmar\" está listada no README, para quem puder achar a lei", () => {
  const readme = require("node:fs").readFileSync(require("node:path").join(__dirname, "..", "README.md"), "utf8");
  const secao = readme.split("## Feriados das capitais")[1].split("\n## ")[0];
  for (const { cidade, feriados } of Object.values(MUNICIPAIS)) {
    for (const f of feriados.filter((x) => x.lei === "a confirmar")) {
      const dia = `${String(f.dia).padStart(2, "0")}/${String(f.mes).padStart(2, "0")}`;
      const linha = secao.split("\n").find((l) => l.startsWith(`| ${cidade} |`) && l.includes(dia));
      assert.ok(linha, `README: falta "${cidade}" com ${dia} na tabela "A confirmar"`);
    }
  }
});
