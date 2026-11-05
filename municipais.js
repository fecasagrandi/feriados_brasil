/*
 * Feriados municipais das capitais: SÓ DADOS, sem lógica. Corrigir uma data é editar uma linha aqui.
 * O formato é conferido por test/dados.test.js (rode `npm test`).
 *
 * Só capitais: o Brasil tem 5.570 municípios e não existe fonte oficial única; manter isso
 * na mão não fecha a conta. A página só mostra estes feriados se a pessoa marcar que mora
 * na capital do estado detectado.
 *
 * Critério para entrar: a data aparece em ato oficial (portaria de tribunal, decreto da
 * prefeitura, calendário do MPF) e em pelo menos mais uma fonte independente.
 * O número da lei vem do ato que a cita. Quando nenhum ato cita o número, `lei` fica
 * "a confirmar" e `ato` diz onde a data foi confirmada. Essas entradas estão listadas no
 * README ("Feriados das capitais") para quem puder achar a lei.
 *
 * Campos de cada item (como em estaduais.js):
 *   mes, dia     data fixa                    | pascoa  dias a partir do Domingo de Páscoa (60 = Corpus Christi)
 *   nome         como aparece no site
 *   lei          lei municipal (obrigatório; "a confirmar" exige `ato`)
 *   ato          ato oficial que confirma a data, quando a lei não foi localizada
 *   desde, ate   primeiro e último ano em que vale (opcionais)
 *   fonte        URL do texto oficial da lei (opcional, mas bem-vindo)
 *
 * Sem entrada: DF (não tem municípios) e PA (Belém decretou ponto facultativo no
 * aniversário em 2026 e as fontes divergem sobre Corpus Christi).
 */
(function (root) {
  var MUNICIPAIS = {
  AC: { cidade: "Rio Branco", feriados: [
    { mes: 12, dia: 28, nome: "Aniversário de Rio Branco", lei: "Lei 1.609/2006" },
  ] },
  AL: { cidade: "Maceió", feriados: [
    { pascoa: 60, nome: "Corpus Christi", lei: "Lei 1.391/1967" },
    { mes: 8, dia: 27, nome: "Nossa Senhora dos Prazeres", lei: "Lei 1.391/1967" },
    { mes: 12, dia: 8, nome: "Nossa Senhora da Conceição", lei: "Lei 1.391/1967" },
  ] },
  AM: { cidade: "Manaus", feriados: [
    { pascoa: 60, nome: "Corpus Christi", desde: 2006, lei: "Lei 970/2006" },
    { mes: 10, dia: 24, nome: "Aniversário de Manaus", desde: 1991, lei: "Lei 101/1991" },
    { mes: 12, dia: 8, nome: "Nossa Senhora da Conceição", desde: 1999, lei: "Lei 496/1999" },
  ] },
  AP: { cidade: "Macapá", feriados: [
    { mes: 2, dia: 4, nome: "Aniversário de Macapá", lei: "a confirmar", ato: "calendários de feriados do TSE e do MPF" },
  ] },
  BA: { cidade: "Salvador", feriados: [
    { pascoa: 60, nome: "Corpus Christi", lei: "Lei 1.997/1967" },
    { mes: 6, dia: 24, nome: "São João", lei: "Lei 1.997/1967" },
    { mes: 12, dia: 8, nome: "Nossa Senhora da Conceição da Praia", lei: "Lei 1.997/1967" },
  ] },
  CE: { cidade: "Fortaleza", feriados: [
    { pascoa: 60, nome: "Corpus Christi", desde: 2004, lei: "Lei 8.796/2003" },
    { mes: 8, dia: 15, nome: "Nossa Senhora da Assunção", desde: 2004, lei: "Lei 8.796/2003" },
  ] },
  ES: { cidade: "Vitória", feriados: [
    { pascoa: 60, nome: "Corpus Christi", lei: "Lei 1.732/1967" },
    { mes: 9, dia: 8, nome: "Nossa Senhora da Vitória", lei: "Lei 1.732/1967" },
  ] },
  GO: { cidade: "Goiânia", feriados: [
    // 24/10 (aniversário) já está em estaduais.js como feriado estadual.
    { mes: 5, dia: 24, nome: "Nossa Senhora Auxiliadora", lei: "a confirmar", ato: "calendário de feriados do TJGO" },
  ] },
  MA: { cidade: "São Luís", feriados: [
    // A Lei 3.432/1996 trocou Corpus Christi pelo aniversário da cidade.
    { mes: 6, dia: 29, nome: "São Pedro", lei: "Lei 3.432/1996" },
    { mes: 9, dia: 8, nome: "Aniversário de São Luís", desde: 1996, lei: "Lei 3.432/1996" },
    { mes: 12, dia: 8, nome: "Nossa Senhora da Conceição", lei: "Lei 3.432/1996" },
  ] },
  MG: { cidade: "Belo Horizonte", feriados: [
    { pascoa: 60, nome: "Corpus Christi", lei: "Lei 11.397/2022" },
    { mes: 8, dia: 15, nome: "Assunção de Nossa Senhora", lei: "Lei 11.397/2022" },
    { mes: 12, dia: 8, nome: "Imaculada Conceição", lei: "Lei 11.397/2022" },
  ] },
  MS: { cidade: "Campo Grande", feriados: [
    { mes: 6, dia: 13, nome: "Santo Antônio", lei: "a confirmar", ato: "calendários da Justiça Federal e do TJMS; um calendário cita a Lei 3.901/2001" },
    { mes: 8, dia: 26, nome: "Aniversário de Campo Grande", lei: "a confirmar", ato: "calendários da Justiça Federal e do TJMS" },
  ] },
  MT: { cidade: "Cuiabá", feriados: [
    { mes: 4, dia: 8, nome: "Aniversário de Cuiabá", lei: "a confirmar", ato: "decreto municipal de feriados de 2026" },
  ] },
  PB: { cidade: "João Pessoa", feriados: [
    { mes: 6, dia: 24, nome: "São João", lei: "Lei 8.805/1999" },
    // 05/08 também é feriado estadual (Fundação do Estado).
    { mes: 8, dia: 5, nome: "Nossa Senhora das Neves", lei: "Lei 8.805/1999" },
    { mes: 12, dia: 8, nome: "Nossa Senhora da Conceição", lei: "Lei 8.805/1999" },
  ] },
  PE: { cidade: "Recife", feriados: [
    { mes: 6, dia: 24, nome: "São João", lei: "Lei 9.777/1967" },
    { mes: 7, dia: 16, nome: "Nossa Senhora do Carmo", lei: "Lei 9.777/1967" },
    { mes: 12, dia: 8, nome: "Nossa Senhora da Conceição", lei: "Lei 9.777/1967" },
  ] },
  PI: { cidade: "Teresina", feriados: [
    { mes: 8, dia: 16, nome: "Aniversário de Teresina", lei: "a confirmar", ato: "Lei 5.573/2021, que antecipou o feriado de 2021" },
  ] },
  PR: { cidade: "Curitiba", feriados: [
    { pascoa: 60, nome: "Corpus Christi", lei: "Lei 3.015/1967" },
    { mes: 9, dia: 8, nome: "Nossa Senhora da Luz dos Pinhais", lei: "Lei 3.015/1967" },
  ] },
  RJ: { cidade: "Rio de Janeiro", feriados: [
    { mes: 1, dia: 20, nome: "São Sebastião", lei: "a confirmar", ato: "lei do calendário oficial do município, art. 8º; um calendário cita a Lei 1.271/1988" },
  ] },
  RN: { cidade: "Natal", feriados: [
    { mes: 1, dia: 6, nome: "Santos Reis", lei: "a confirmar", ato: "Decreto municipal 13.643/2025 (calendário de 2026)" },
    { mes: 11, dia: 21, nome: "Nossa Senhora da Apresentação", lei: "a confirmar", ato: "portaria de feriados do TCE-RN" },
  ] },
  RO: { cidade: "Porto Velho", feriados: [
    { mes: 10, dia: 2, nome: "Criação do Município de Porto Velho", lei: "Lei 190/1980" },
  ] },
  RR: { cidade: "Boa Vista", feriados: [
    { mes: 1, dia: 20, nome: "São Sebastião", lei: "Lei 104/1984" },
    { mes: 6, dia: 29, nome: "São Pedro", lei: "Lei 104/1984" },
    { mes: 7, dia: 9, nome: "Aniversário de Boa Vista", desde: 1990, lei: "Lei 227/1990" },
    { mes: 12, dia: 8, nome: "Nossa Senhora da Conceição", lei: "Lei 104/1984" },
  ] },
  RS: { cidade: "Porto Alegre", feriados: [
    { mes: 2, dia: 2, nome: "Nossa Senhora dos Navegantes", lei: "Lei 3.033/1967" },
    { pascoa: 60, nome: "Corpus Christi", lei: "Lei 3.033/1967" },
  ] },
  SC: { cidade: "Florianópolis", feriados: [
    { mes: 3, dia: 23, nome: "Aniversário de Florianópolis", lei: "Lei 832/1967" },
    { pascoa: 60, nome: "Corpus Christi", lei: "Lei 832/1967" },
  ] },
  SE: { cidade: "Aracaju", feriados: [
    { mes: 3, dia: 17, nome: "Aniversário de Aracaju", desde: 2009, lei: "Lei 3.805/2009" },
    { pascoa: 60, nome: "Corpus Christi", desde: 2009, lei: "Lei 3.805/2009" },
    { mes: 6, dia: 24, nome: "São João", desde: 2009, lei: "Lei 3.805/2009" },
  ] },
  SP: { cidade: "São Paulo", feriados: [
    { mes: 1, dia: 25, nome: "Aniversário de São Paulo", lei: "Lei 14.485/2007", fonte: "https://saopaulo.sp.leg.br/iah/fulltext/leis/L14485.pdf" },
    { pascoa: 60, nome: "Corpus Christi", lei: "Lei 14.485/2007", fonte: "https://saopaulo.sp.leg.br/iah/fulltext/leis/L14485.pdf" },
  ] },
  TO: { cidade: "Palmas", feriados: [
    { mes: 5, dia: 20, nome: "Aniversário de Palmas", desde: 1991, lei: "Lei 108/1991" },
  ] },
  };
  if (typeof module !== "undefined" && module.exports) module.exports = MUNICIPAIS;
  else root.FERIADOS_MUNICIPAIS = MUNICIPAIS;
})(typeof globalThis !== "undefined" ? globalThis : this);
