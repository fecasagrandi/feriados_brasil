/*
 * Feriados estaduais: SÓ DADOS, sem lógica. Corrigir uma data é editar uma linha aqui.
 * O formato é conferido por test/estaduais.test.js (rode `npm test`).
 *
 * Critério para entrar: duas fontes independentes concordando e citando a lei.
 * Divergências e decisões estão no README ("Feriados estaduais").
 *
 * Campos de cada item:
 *   mes, dia     data fixa                    | pascoa  dias a partir do Domingo de Páscoa (data móvel)
 *   nome         como aparece no site
 *   lei          lei, decreto ou artigo da constituição estadual (obrigatório)
 *   desde, ate   primeiro e último ano em que vale (opcionais)
 *   tipo         "feriado" (padrão) ou "facultativo"
 *   fonte        URL do texto oficial da lei (opcional, mas bem-vindo)
 *
 * UF sem entrada não tem feriado estadual em dia útil próprio: MG (21/04 coincide com
 * Tiradentes), PR (19/12 revogado pela Lei 18.384/2014) e SC (Lei 12.906/2004 transfere as
 * datas para o domingo). Os 20/11 estaduais param em 2023 porque a partir de 2024 a data é
 * feriado nacional (Lei 14.759/2023).
 */
(function (root) {
  var ESTADUAIS = {
  AC: [
    { mes: 1, dia: 23, nome: "Dia do Evangélico", desde: 2004, lei: "Lei 1.538/2004" },
    { mes: 3, dia: 8, nome: "Dia Internacional da Mulher", desde: 2001, lei: "Lei 1.411/2001" },
    { mes: 6, dia: 15, nome: "Aniversário do Acre", desde: 1964, lei: "Lei 14/1964" },
    { mes: 9, dia: 5, nome: "Dia da Amazônia", desde: 2004, lei: "Lei 243/1968" },
    { mes: 11, dia: 17, nome: "Tratado de Petrópolis", desde: 2012, lei: "Lei 57/1965" },
  ],
  AL: [
    { mes: 6, dia: 24, nome: "São João", desde: 1993, lei: "Lei 5.508/1993" },
    { mes: 6, dia: 29, nome: "São Pedro", desde: 1993, lei: "Lei 5.509/1993" },
    { mes: 9, dia: 16, nome: "Emancipação Política de Alagoas", lei: "Lei 5.247/1991" },
    { mes: 11, dia: 20, nome: "Consciência Negra", desde: 1995, ate: 2023, lei: "Lei 5.724/1995" },
  ],
  AM: [
    { mes: 9, dia: 5, nome: "Elevação do Amazonas a Província", desde: 1977, lei: "Lei 25/1977" },
    { mes: 11, dia: 20, nome: "Consciência Negra", desde: 2010, ate: 2023, lei: "Lei 84/2010" },
  ],
  AP: [
    { mes: 3, dia: 19, nome: "Dia de São José", desde: 2002, lei: "Lei 667/2002" },
    { mes: 9, dia: 13, nome: "Criação do Território Federal do Amapá", lei: "Constituição estadual, art. 335" },
    { mes: 11, dia: 20, nome: "Consciência Negra", desde: 2008, ate: 2023, lei: "Lei 1.169/2007" },
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
  MT: [{ mes: 11, dia: 20, nome: "Consciência Negra", desde: 2003, ate: 2023, lei: "Lei 7.879/2002" }],
  MS: [{ mes: 10, dia: 11, nome: "Criação do Estado", desde: 1979, lei: "Lei 10/1979" }],
  PA: [{ mes: 8, dia: 15, nome: "Adesão do Grão-Pará à Independência", desde: 1996, lei: "Lei 5.999/1996" }],
  PB: [
    { mes: 7, dia: 26, nome: "Homenagem a João Pessoa", desde: 1967, lei: "Lei 3.489/1967" },
    { mes: 8, dia: 5, nome: "Fundação do Estado", desde: 1967, lei: "Lei 3.489/1967" },
  ],
  PE: [{ mes: 3, dia: 6, nome: "Data Magna de Pernambuco", desde: 2017, lei: "Lei 16.059/2017" }],
  PI: [{ mes: 10, dia: 19, nome: "Dia do Piauí", lei: "Lei 176/1937" }],
  RJ: [
    { pascoa: -47, nome: "Carnaval", desde: 2009, lei: "Lei 5.243/2008" },
    { mes: 4, dia: 23, nome: "Dia de São Jorge", desde: 2008, lei: "Lei 5.198/2008" },
    { mes: 11, dia: 20, nome: "Consciência Negra", desde: 2002, ate: 2023, lei: "Lei 4.007/2002" },
  ],
  RN: [{ mes: 10, dia: 3, nome: "Mártires de Cunhaú e Uruaçu", desde: 2006, lei: "Lei 8.913/2006" }],
  RO: [
    { mes: 1, dia: 4, nome: "Criação do Estado", desde: 2010, lei: "Lei 2.291/2010" },
    // Declarada inconstitucional pelo STF (ADI 3940, publicada em 2020).
    { mes: 6, dia: 18, nome: "Dia do Evangélico", desde: 2002, ate: 2019, lei: "Lei 1.026/2001" },
  ],
  RR: [{ mes: 10, dia: 5, nome: "Criação do Estado", lei: "Constituição estadual, art. 9º" }],
  RS: [{ mes: 9, dia: 20, nome: "Revolução Farroupilha", lei: "Constituição estadual, art. 6º" }],
  SE: [{ mes: 7, dia: 8, nome: "Emancipação Política de Sergipe", lei: "Constituição estadual, art. 269" }],
  SP: [
    { mes: 7, dia: 9, nome: "Revolução Constitucionalista", desde: 1997, lei: "Lei 9.497/1997" },
    { mes: 11, dia: 20, nome: "Consciência Negra", desde: 2023, ate: 2023, lei: "Lei 17.746/2023" },
  ],
  TO: [
    { mes: 3, dia: 18, nome: "Autonomia do Estado", desde: 1998, lei: "Lei 960/1998" },
    { mes: 9, dia: 8, nome: "Nossa Senhora da Natividade", desde: 1993, lei: "Lei 627/1993" },
    { mes: 10, dia: 5, nome: "Criação do Estado", desde: 1989, lei: "Lei 98/1989" },
  ],
};
  if (typeof module !== "undefined" && module.exports) module.exports = ESTADUAIS;
  else root.FERIADOS_ESTADUAIS = ESTADUAIS;
})(typeof globalThis !== "undefined" ? globalThis : this);
