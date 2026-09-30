/*
 * Cálculo dos feriados nacionais do Brasil — sem dependências.
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

  function feriadosDoAno(ano, { facultativos = true } = {}) {
    validarAno(ano);
    const lista = [];

    for (const f of FIXOS) {
      if (f.desde && ano < f.desde) continue;
      lista.push({ data: iso(ano, f.mes, f.dia), nome: f.nome, tipo: "feriado" });
    }

    const p = pascoa(ano);
    for (const f of MOVEIS) {
      if (f.tipo === "facultativo" && !facultativos) continue;
      const item = { data: somaDias(p, f.offset), nome: f.nome, tipo: f.tipo };
      if (f.obs) item.obs = f.obs;
      lista.push(item);
    }

    // Datas podem coincidir (Paixão de Cristo caiu em 21/04 em 2000, junto com Tiradentes).
    // Desempate: feriado antes de facultativo, depois nome — ordenação determinística.
    return lista.sort(
      (x, y) =>
        x.data.localeCompare(y.data) ||
        (x.tipo === y.tipo ? 0 : x.tipo === "feriado" ? -1 : 1) ||
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
      const desc = f.tipo === "feriado" ? "Feriado nacional" : `Ponto facultativo${f.obs ? ` (${f.obs})` : ""}`;
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
