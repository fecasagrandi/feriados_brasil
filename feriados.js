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

  // Pontos facultativos de data fixa, repetidos todo ano na portaria do governo federal.
  // O horário muda conforme a portaria: 14h até 2024, 13h em 2025 e 2026.
  const FACULTATIVOS_FIXOS = [
    { mes: 12, dia: 24, nome: "Véspera de Natal", obs: "a partir das 13h" },
    { mes: 12, dia: 31, nome: "Véspera de Ano-Novo", obs: "a partir das 13h" },
  ];

  const UFS = {
    AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
    DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso",
    MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
    PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
    SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
  };

  // Feriados estaduais: estaduais.js (só dados; o formato é conferido por test/estaduais.test.js).
  const ESTADUAIS =
    typeof module !== "undefined" && module.exports ? require("./estaduais.js") : root.FERIADOS_ESTADUAIS;
  if (!ESTADUAIS) throw new Error("estaduais.js precisa ser carregado antes de feriados.js");

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

    for (const f of FACULTATIVOS_FIXOS) {
      lista.push({ data: iso(ano, f.mes, f.dia), nome: f.nome, tipo: "facultativo", abrangencia: "nacional", obs: f.obs });
    }

    if (uf) {
      for (const f of ESTADUAIS[uf] || []) {
        if ((f.desde && ano < f.desde) || (f.ate && ano > f.ate)) continue;
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

  /*
   * Planejador de folgas: blocos de descanso que juntam fim de semana, feriados e
   * poucos dias de férias. Considera trabalho de segunda a sexta; ponto facultativo
   * conta como dia útil (não é folga garantida).
   *
   * Um bloco começa e termina em dia de folga e é maximal (dia útil antes e depois),
   * contém ao menos um feriado e pede de 1 a `maxFerias` dias de férias.
   * Para cada feriado fica o bloco de melhor rendimento (dias de folga ÷ dias de férias).
   */
  function oportunidades(inicio, fim, { uf = null, maxFerias = 4, rendimentoMinimo = 2.5 } = {}) {
    const margem = 10;
    const de = somaDias(inicio, -margem);
    const ate = somaDias(fim, margem);
    const feriadosPorData = new Map();
    for (const f of feriadosEntre(de, ate, { facultativos: false, uf })) {
      if (!feriadosPorData.has(f.data)) feriadosPorData.set(f.data, []);
      feriadosPorData.get(f.data).push(f);
    }

    const n = diasEntre(de, ate) + 1;
    const dias = Array.from({ length: n }, (_, i) => somaDias(de, i));
    const folga = dias.map((d) => {
      const dow = diaDaSemana(d);
      return dow === 0 || dow === 6 || feriadosPorData.has(d);
    });

    const melhorPorFeriado = new Map();
    for (let s = 1; s < n; s++) {
      if (!folga[s] || folga[s - 1]) continue; // começa numa folga logo após um dia útil
      const ferias = [];
      for (let e = s; e < n - 1; e++) {
        if (!folga[e]) {
          ferias.push(dias[e]);
          if (ferias.length > maxFerias) break;
          continue;
        }
        if (folga[e + 1] || ferias.length === 0) continue; // ainda não terminou / feriadão natural
        if (dias[s] < inicio || dias[e] > fim) continue;
        const total = e - s + 1;
        const rendimento = total / ferias.length;
        if (rendimento < rendimentoMinimo) continue;
        const bloco = { inicio: dias[s], fim: dias[e], dias: total, ferias: [...ferias], rendimento };
        for (let k = s; k <= e; k++) {
          if (!feriadosPorData.has(dias[k])) continue;
          const atual = melhorPorFeriado.get(dias[k]);
          if (!atual || rendimento > atual.rendimento || (rendimento === atual.rendimento && total > atual.dias)) {
            melhorPorFeriado.set(dias[k], bloco);
          }
        }
      }
    }

    // Um mesmo bloco pode ser o melhor de vários feriados (Natal + Ano-Novo): junta.
    const unicos = new Map();
    for (const bloco of melhorPorFeriado.values()) unicos.set(bloco.inicio + bloco.fim, bloco);
    return [...unicos.values()]
      .map((b) => {
        const feriados = [];
        for (let d = b.inicio; d <= b.fim; d = somaDias(d, 1)) feriados.push(...(feriadosPorData.get(d) || []));
        return { ...b, feriados };
      })
      .sort((x, y) => x.inicio.localeCompare(y.inicio));
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

  // RFC 5545 §3.1: linha com mais de 75 octetos é dobrada; a continuação começa com um espaço.
  // Conta bytes UTF-8 por caractere, para nunca cortar um "ç" ou "ã" ao meio.
  function dobrar(linha) {
    const octetos = (c) => { const n = c.codePointAt(0); return n < 0x80 ? 1 : n < 0x800 ? 2 : n < 0x10000 ? 3 : 4; };
    const pedacos = [];
    let atual = "";
    let bytes = 0;
    for (const c of linha) {
      const b = octetos(c);
      if (bytes + b > 75) {
        pedacos.push(atual);
        atual = " ";
        bytes = 1;
      }
      atual += c;
      bytes += b;
    }
    pedacos.push(atual);
    return pedacos.join("\r\n");
  }

  // iCalendar (RFC 5545). Eventos de dia inteiro: DTEND é exclusivo, então é o dia seguinte.
  // `nome`: título do calendário quando ele é assinado (X-WR-CALNAME), com atualização diária.
  function paraIcs(lista, agora = new Date(), { nome } = {}) {
    const stamp = agora.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const compacta = (d) => d.replace(/-/g, "");
    const linhas = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//feriados_brasil//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];
    if (nome) {
      linhas.push(`X-WR-CALNAME:${escaparIcs(nome)}`, "REFRESH-INTERVAL;VALUE=DURATION:P1D", "X-PUBLISHED-TTL:P1D");
    }
    for (const f of lista) {
      const facultativo = f.tipo !== "feriado";
      let desc = facultativo
        ? `Ponto facultativo${f.obs ? ` (${f.obs})` : ""}`
        : f.abrangencia === "estadual" ? `Feriado estadual (${f.uf})` : "Feriado nacional";
      if (f.lei) desc += ` · ${f.lei}`;
      linhas.push(
        "BEGIN:VEVENT",
        `UID:${f.data}-${slug(f.nome)}@feriados-brasil`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${compacta(f.data)}`,
        `DTEND;VALUE=DATE:${compacta(somaDias(f.data, 1))}`,
        // No calendário assinado só o título aparece: deixa claro que facultativo não é folga garantida.
        `SUMMARY:${escaparIcs(facultativo ? `${f.nome} (ponto facultativo)` : f.nome)}`,
        `DESCRIPTION:${escaparIcs(desc)}`,
        "TRANSP:TRANSPARENT",
        "END:VEVENT"
      );
    }
    linhas.push("END:VCALENDAR");
    return linhas.map(dobrar).join("\r\n") + "\r\n";
  }

  const api = {
    UFS,
    pascoa,
    oportunidades,
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
