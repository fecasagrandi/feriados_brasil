/*
 * Cálculo dos feriados nacionais e estaduais do Brasil — sem dependências.
 *
 * Datas são strings ISO "AAAA-MM-DD". Toda a aritmética de datas é feita em UTC,
 * então o resultado não depende do fuso nem de horário de verão do navegador.
 *
 * Funciona como <script> clássico (expõe window.Feriados) e como módulo CommonJS
 * (require("./feriados.js")), para poder ser testado com `node --test`.
 */
(function (root) {
  "use strict";

  // Fixos. `desde`: primeiro ano em que vale como feriado nacional.
  const FIXOS = [
    { mes: 1, dia: 1, nome: "Confraternização Universal" },
    { mes: 4, dia: 21, nome: "Tiradentes" },
    { mes: 5, dia: 1, nome: "Dia do Trabalho" },
    { mes: 9, dia: 7, nome: "Independência do Brasil" },
    { mes: 10, dia: 12, nome: "Nossa Senhora Aparecida", desde: 1980 }, // Lei 6.802/1980
    { mes: 11, dia: 2, nome: "Finados" },
    { mes: 11, dia: 15, nome: "Proclamação da República" },
    { mes: 11, dia: 20, nome: "Consciência Negra", desde: 2024 }, // Lei 14.759/2023
    { mes: 12, dia: 25, nome: "Natal" },
  ];

  // Móveis, em dias a partir do Domingo de Páscoa.
  const MOVEIS = [
    { offset: -48, nome: "Carnaval (segunda)", tipo: "facultativo" },
    { offset: -47, nome: "Carnaval (terça)", tipo: "facultativo" },
    { offset: -46, nome: "Quarta-feira de Cinzas", tipo: "facultativo", obs: "até 14h" },
    { offset: -2, nome: "Paixão de Cristo", tipo: "feriado" },
    { offset: 60, nome: "Corpus Christi", tipo: "facultativo" },
  ];

  const UFS = {
    AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
    DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso",
    MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
    PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
    SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
  };

  /*
   * Feriados estaduais. Entram só os que têm consenso entre as fontes consultadas
   * (date-holidays, eh-dia-util e levantamentos de 2026); divergências estão no README.
   * Sem entrada = sem feriado estadual em dia próprio (ex.: MG e DF têm o 21/04,
   * que coincide com Tiradentes; MT tinha só a Consciência Negra, hoje nacional).
   * `pascoa`: dias a partir do Domingo de Páscoa, no lugar de mes/dia.
   */
  const ESTADUAIS = {
    AC: [
      { mes: 3, dia: 8, nome: "Dia Internacional da Mulher", desde: 2001 },
      { mes: 6, dia: 15, nome: "Aniversário do Acre", desde: 1964 },
      { mes: 9, dia: 5, nome: "Dia da Amazônia", desde: 2004 },
      { mes: 11, dia: 17, nome: "Tratado de Petrópolis", desde: 2012, tipo: "facultativo" },
    ],
    AL: [
      { mes: 6, dia: 24, nome: "São João", desde: 1993, lei: "Lei 5.508/1993" },
      { mes: 6, dia: 29, nome: "São Pedro", desde: 1993, lei: "Lei 5.509/1993" },
      { mes: 9, dia: 16, nome: "Emancipação Política de Alagoas" },
    ],
    AM: [{ mes: 9, dia: 5, nome: "Elevação do Amazonas a Província", desde: 1977, lei: "Lei 25/1977" }],
    AP: [
      { mes: 3, dia: 19, nome: "Dia de São José", desde: 2002, lei: "Lei 667/2002" },
      { mes: 9, dia: 13, nome: "Criação do Território Federal do Amapá", lei: "Constituição estadual, art. 335" },
    ],
    BA: [{ mes: 7, dia: 2, nome: "Independência da Bahia", lei: "Constituição estadual, art. 6º" }],
    CE: [{ mes: 3, dia: 25, nome: "Data Magna do Ceará", desde: 2011, lei: "Constituição estadual, art. 18" }],
    DF: [{ mes: 11, dia: 30, nome: "Dia do Evangélico", desde: 1995, lei: "Lei distrital 963/1995" }],
    ES: [{ pascoa: 8, nome: "Nossa Senhora da Penha", desde: 2019, lei: "Lei 11.010/2019" }],
    GO: [
      { mes: 7, dia: 26, nome: "Fundação da Cidade de Goiás", lei: "Lei 20.756/2020" },
      { mes: 10, dia: 24, nome: "Pedra Fundamental de Goiânia", lei: "Lei 20.756/2020" },
    ],
    MA: [{ mes: 7, dia: 28, nome: "Adesão do Maranhão à Independência", desde: 1964, lei: "Lei 2.457/1964" }],
    MS: [{ mes: 10, dia: 11, nome: "Criação do Estado", desde: 1979, lei: "Lei 10/1979" }],
    PA: [{ mes: 8, dia: 15, nome: "Adesão do Grão-Pará à Independência", desde: 1996, lei: "Lei 5.999/1996" }],
    PB: [
      { mes: 7, dia: 26, nome: "Homenagem a João Pessoa", desde: 1967, lei: "Lei 3.489/1967" },
      { mes: 8, dia: 5, nome: "Fundação do Estado", desde: 1967, lei: "Lei 3.489/1967" },
    ],
    PI: [{ mes: 10, dia: 19, nome: "Dia do Piauí" }],
    RJ: [
      { pascoa: -47, nome: "Carnaval", desde: 2008 },
      { mes: 4, dia: 23, nome: "Dia de São Jorge", desde: 2008 },
    ],
    RN: [{ mes: 10, dia: 3, nome: "Mártires de Cunhaú e Uruaçu", desde: 2006 }],
    RO: [
      { mes: 1, dia: 4, nome: "Criação do Estado", desde: 2010, lei: "Lei 2.291/2010" },
      { mes: 6, dia: 18, nome: "Dia do Evangélico", desde: 2001, lei: "Lei 1.026/2001" },
    ],
    RR: [{ mes: 10, dia: 5, nome: "Criação do Estado" }],
    RS: [{ mes: 9, dia: 20, nome: "Revolução Farroupilha" }],
    SE: [{ mes: 7, dia: 8, nome: "Emancipação Política de Sergipe" }],
    SP: [{ mes: 7, dia: 9, nome: "Revolução Constitucionalista", desde: 1997, lei: "Lei 9.497/1997" }],
    TO: [
      { mes: 3, dia: 18, nome: "Autonomia do Estado", desde: 1998, lei: "Lei 960/1998" },
      { mes: 9, dia: 8, nome: "Nossa Senhora da Natividade", desde: 1993, lei: "Lei 627/1993" },
      { mes: 10, dia: 5, nome: "Criação do Estado", desde: 1989, lei: "Lei 98/1989" },
    ],
  };

  const ANO_MIN = 1583; // primeiro ano completo do calendário gregoriano
  const ANO_MAX = 9999; // limite do formato AAAA

  function validarAno(ano) {
    if (!Number.isInteger(ano) || ano < ANO_MIN || ano > ANO_MAX) {
      throw new RangeError(`ano inválido: ${ano} (esperado inteiro entre ${ANO_MIN} e ${ANO_MAX})`);
    }
  }

  // Date.UTC normaliza estouros (ex.: dia 32 vira dia 1 do mês seguinte).
  function iso(ano, mes, dia) {
    return new Date(Date.UTC(ano, mes - 1, dia)).toISOString().slice(0, 10);
  }

  function partes(data) {
    return data.split("-").map(Number);
  }

  function somaDias(data, n) {
    const [a, m, d] = partes(data);
    return iso(a, m, d + n);
  }

  // Diferença em dias de calendário (b − a). Sempre inteira: não há DST em UTC.
  function diasEntre(a, b) {
    const [a1, m1, d1] = partes(a);
    const [a2, m2, d2] = partes(b);
    return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000);
  }

  // 0 = domingo … 6 = sábado
  function diaDaSemana(data) {
    const [a, m, d] = partes(data);
    return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
  }

  // Algoritmo anônimo gregoriano (Meeus/Jones/Butcher).
  function pascoa(ano) {
    validarAno(ano);
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    return iso(ano, mes, dia);
  }

  function validarUf(uf) {
    if (uf != null && !Object.prototype.hasOwnProperty.call(UFS, uf)) {
      throw new RangeError(`UF inválida: ${uf}`);
    }
  }

  const PESO_TIPO = { feriado: 0, facultativo: 1 };
  const PESO_ABRANGENCIA = { nacional: 0, estadual: 1 };

  // `uf`: sigla (ex.: "SP") para incluir os feriados estaduais; null/omitido = só nacionais.
  function feriadosDoAno(ano, { facultativos = true, uf = null } = {}) {
    validarAno(ano);
    validarUf(uf);
    const p = pascoa(ano);
    let lista = [];

    for (const f of FIXOS) {
      if (f.desde && ano < f.desde) continue;
      lista.push({ data: iso(ano, f.mes, f.dia), nome: f.nome, tipo: "feriado", abrangencia: "nacional" });
    }

    for (const f of MOVEIS) {
      const item = { data: somaDias(p, f.offset), nome: f.nome, tipo: f.tipo, abrangencia: "nacional" };
      if (f.obs) item.obs = f.obs;
      lista.push(item);
    }

    if (uf) {
      for (const f of ESTADUAIS[uf] || []) {
        if (f.desde && ano < f.desde) continue;
        const data = f.pascoa != null ? somaDias(p, f.pascoa) : iso(ano, f.mes, f.dia);
        const item = { data, nome: f.nome, tipo: f.tipo || "feriado", abrangencia: "estadual", uf };
        if (f.lei) item.lei = f.lei;
        lista.push(item);
      }
      // Onde o estado decreta feriado, o ponto facultativo nacional do mesmo dia deixa
      // de fazer sentido (ex.: terça de Carnaval no RJ).
      const feriadosEstaduais = new Set(
        lista.filter((f) => f.abrangencia === "estadual" && f.tipo === "feriado").map((f) => f.data)
      );
      lista = lista.filter(
        (f) => !(f.abrangencia === "nacional" && f.tipo === "facultativo" && feriadosEstaduais.has(f.data))
      );
    }

    if (!facultativos) lista = lista.filter((f) => f.tipo === "feriado");

    // Datas podem coincidir (Paixão de Cristo caiu em 21/04 em 2000, junto com Tiradentes).
    // Desempate: feriado antes de facultativo, nacional antes de estadual, depois nome.
    return lista.sort(
      (x, y) =>
        x.data.localeCompare(y.data) ||
        PESO_TIPO[x.tipo] - PESO_TIPO[y.tipo] ||
        PESO_ABRANGENCIA[x.abrangencia] - PESO_ABRANGENCIA[y.abrangencia] ||
        x.nome.localeCompare(y.nome)
    );
  }

  // Feriados com data em [inicio, fim], inclusive.
  function feriadosEntre(inicio, fim, opcoes) {
    const anoIni = partes(inicio)[0];
    const anoFim = partes(fim)[0];
    const res = [];
    for (let ano = anoIni; ano <= anoFim; ano++) {
      for (const f of feriadosDoAno(ano, opcoes)) {
        if (f.data >= inicio && f.data <= fim) res.push(f);
      }
    }
    return res;
  }

  // Impacto no calendário de quem trabalha de segunda a sexta.
  function classificar(data) {
    const dow = diaDaSemana(data);
    if (dow === 0 || dow === 6) return "fim de semana";
    if (dow === 1 || dow === 5) return "feriadão";
    if (dow === 2 || dow === 4) return "ponte";
    return null; // quarta
  }

  function slug(s) {
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function escaparIcs(s) {
    return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }

  // iCalendar (RFC 5545). Eventos de dia inteiro: DTEND é exclusivo, então é o dia seguinte.
  function paraIcs(lista, agora = new Date()) {
    const stamp = agora.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const compacta = (d) => d.replace(/-/g, "");
    const linhas = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//feriados_brasil//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];
    for (const f of lista) {
      const desc =
        f.tipo === "feriado"
          ? f.abrangencia === "estadual" ? `Feriado estadual (${f.uf})` : "Feriado nacional"
          : `Ponto facultativo${f.obs ? ` (${f.obs})` : ""}`;
      linhas.push(
        "BEGIN:VEVENT",
        `UID:${f.data}-${slug(f.nome)}@feriados-brasil`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${compacta(f.data)}`,
        `DTEND;VALUE=DATE:${compacta(somaDias(f.data, 1))}`,
        `SUMMARY:${escaparIcs(f.nome)}`,
        `DESCRIPTION:${escaparIcs(desc)}`,
        "TRANSP:TRANSPARENT",
        "END:VEVENT"
      );
    }
    linhas.push("END:VCALENDAR");
    return linhas.join("\r\n") + "\r\n";
  }

  const api = {
    UFS,
    pascoa,
    paraIcs,
    feriadosDoAno,
    feriadosEntre,
    classificar,
    diaDaSemana,
    diasEntre,
    somaDias,
    iso,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Feriados = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
