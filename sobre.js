/*
 * O que cada feriado comemora, em linguagem simples, com a fonte de onde veio.
 *
 * Só conteúdo, nenhuma lógica além da busca. Fontes: sempre um órgão público
 * (governo, assembleia, Senado, Câmara, Arquivo Nacional, Agência Brasil), para
 * quem quiser conferir.
 *
 * Chave: "UF:nome" para feriado estadual, ou só o nome. O estadual cai no nome
 * quando não tem texto próprio (ex.: Consciência Negra antes de 2024).
 *
 * Funciona como <script> clássico (window.SobreFeriados) e como CommonJS.
 */
(function (root) {
  "use strict";

  const fonte = (nome, url) => ({ nome, url });

  const CARNAVAL = {
    texto:
      "Festa popular que antecede a Quaresma. O nome viria do italiano \"carne levare\", o adeus à carne antes do jejum. " +
      "Chegou ao Brasil com o entrudo português, em que se jogava água e farinha nas pessoas na rua. " +
      "Não é feriado nacional: é ponto facultativo, e cada estado ou cidade decide.",
    fonte: fonte("Fundação Joaquim Nabuco", "https://pesquisaescolar.fundaj.gov.br/pt-br/artigo/carnaval-origem-e-evolucao/"),
  };

  const EVANGELICO = {
    texto:
      "Homenagem às igrejas evangélicas. Não é feriado nacional: cada lugar que adotou a data criou o seu por lei própria, " +
      "e as datas são diferentes.",
  };

  const SOBRE = {
    // ---------- nacionais ----------
    "Confraternização Universal": {
      texto:
        "Primeiro dia do ano, dedicado à paz e à fraternidade entre os povos. " +
        "Virou feriado em 1935, consagrado à \"fraternidade universal\". Também é o Dia Mundial da Paz.",
      fonte: fonte("Câmara dos Deputados (Lei 108/1935)", "https://www2.camara.leg.br/legin/fed/lei/1930-1939/lei-108-29-outubro-1935-557381-publicacaooriginal-77748-pl.html"),
    },
    "Tiradentes": {
      texto:
        "Lembra Joaquim José da Silva Xavier, o Tiradentes, enforcado no Rio de Janeiro em 21 de abril de 1792 " +
        "por participar da Inconfidência Mineira, conspiração contra os impostos da Coroa portuguesa sobre o ouro. " +
        "Esquecido no Império, virou herói nacional com a República, que fez da data feriado já em 1890.",
      fonte: fonte("Arquivo Nacional", "http://querepublicaeessa.an.gov.br/index.php/que-republica-e-essa/assuntos/temas/78-secoes-anteriores/66-filme/444-tiradentes-21-de-abril-e-o-imaginario-politico"),
    },
    "Dia do Trabalho": {
      texto:
        "Lembra a luta operária pela jornada de 8 horas, marcada pela repressão aos protestos de Chicago em maio de 1886. " +
        "No Brasil, virou feriado em 1924. Na Era Vargas, a data passou a ser usada para anunciar medidas como o salário mínimo e a CLT (1943).",
      fonte: fonte("Senado Notícias", "https://www12.senado.leg.br/noticias/especiais/arquivo-s/brasil-oficializou-dia-do-trabalhador-para-incentivar-festas-e-conter-protestos"),
    },
    "Independência do Brasil": {
      texto:
        "Em 7 de setembro de 1822, às margens do riacho Ipiranga, em São Paulo, D. Pedro declarou o Brasil separado de Portugal. " +
        "Foi o ponto alto de um processo que começou com a vinda da família real, em 1808, e não foi pacífico: " +
        "houve guerra em várias províncias, como a Bahia, até 1823.",
      fonte: fonte("Senado Notícias", "https://www12.senado.leg.br/noticias/infomaterias/2022/09/afinal-a-independencia-do-brasil-foi-revolucionaria-ou-conservadora"),
    },
    "Nossa Senhora Aparecida": {
      texto:
        "Homenageia a padroeira do Brasil. Em 1717, três pescadores acharam no rio Paraíba do Sul, em Guaratinguetá (SP), " +
        "uma pequena imagem de Nossa Senhora: primeiro o corpo, depois a cabeça. A pesca farta que veio em seguida foi tida como o primeiro milagre. " +
        "É feriado nacional desde 1980.",
      fonte: fonte("Condephaat (Governo de SP)", "http://condephaat.sp.gov.br/benstombados/imagem-de-nossa-senhora-aparecida/"),
    },
    "Finados": {
      texto:
        "Dia de lembrar quem já morreu, com visitas aos cemitérios, flores e velas. " +
        "A tradição vem da Igreja Católica, que pôs a data logo depois do Dia de Todos os Santos (1º de novembro), e chegou ao Brasil com os portugueses.",
      fonte: fonte("Prefeitura de Santos", "https://www.santos.sp.gov.br/?q=noticia/finados-celebracao-comecou-ha-mais-de-mil-anos"),
    },
    "Proclamação da República": {
      texto:
        "Em 15 de novembro de 1889, militares liderados pelo marechal Deodoro da Fonseca derrubaram a monarquia de D. Pedro II, no Rio de Janeiro. " +
        "A família imperial foi para o exílio, e um governo provisório conduziu o país até a Constituição de 1891.",
      fonte: fonte("Arquivo Nacional", "https://mapa.an.gov.br/index.php/ultimas-noticias/1728-proclamacao-da-republica"),
    },
    "Consciência Negra": {
      texto:
        "Lembra Zumbi dos Palmares, líder do maior quilombo do Brasil colonial, na Serra da Barriga (hoje Alagoas), morto em 20 de novembro de 1695. " +
        "A data foi proposta em 1971 por um grupo de militantes negros de Porto Alegre. " +
        "Virou feriado nacional em 2024; antes disso, já era feriado em seis estados.",
      fonte: fonte("Agência Brasil", "https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2025-11/20-de-novembro-saiba-origem-da-data-e-quem-foi-zumbi-dos-palmares"),
    },
    "Natal": {
      texto:
        "Celebra o nascimento de Jesus para os cristãos. O 25 de dezembro foi adotado pela Igreja no século IV, " +
        "perto do solstício, que já era data de festas pagãs. Igrejas ortodoxas comemoram em 7 de janeiro, porque seguem o calendário juliano.",
      fonte: fonte("Rádio Câmara", "https://www.camara.leg.br/radio/programas/310955-a-origem-da-celebracao-e-dos-simbolos-natalinos-bloco-1-0648/"),
    },
    "Paixão de Cristo": {
      texto:
        "A Sexta-feira Santa lembra a crucificação e a morte de Jesus, dois dias antes da Páscoa. É dia de procissões, Via Sacra e, para muitos, de jejum de carne. " +
        "Curiosidade: a lei federal a trata como feriado religioso declarado pelos municípios (Lei 9.093/1995), mas na prática vale no país todo.",
      fonte: fonte("Agência Brasil", "https://agenciabrasil.ebc.com.br/geral/noticia/2025-04/saiba-mais-sobre-o-simbolismo-da-sexta-feira-santa"),
    },
    "Carnaval (segunda)": CARNAVAL,
    "Carnaval (terça)": CARNAVAL,
    "Quarta-feira de Cinzas": {
      texto:
        "Encerra o Carnaval e abre a Quaresma, os 40 dias de preparação dos cristãos para a Páscoa. " +
        "Nas missas, os fiéis recebem cinzas na testa como sinal de penitência. É ponto facultativo até as 14h.",
      fonte: fonte("Agência Brasil", "https://agenciabrasil.ebc.com.br/radioagencia-nacional/geral/audio/2026-02/quarta-feira-de-cinzas-entenda-o-significado-da-data"),
    },
    "Corpus Christi": {
      texto:
        "Festa católica do \"Corpo de Cristo\", que celebra a presença de Jesus na Eucaristia, 60 dias depois da Páscoa. " +
        "Em muitas cidades, as ruas ganham tapetes coloridos para a procissão. Não é feriado nacional: é ponto facultativo, e cada estado ou cidade decide.",
      fonte: fonte("Agência Brasil", "https://agenciabrasil.ebc.com.br/economia/noticia/2026-06/corpus-christi-e-feriado-ou-ponto-facultativo-entenda-regras"),
    },
    "Véspera de Natal": {
      texto:
        "Não é feriado. A portaria anual do governo federal dá ponto facultativo à tarde nos órgãos federais (a partir das 13h em 2025 e 2026). " +
        "Empresas, estados e prefeituras decidem por conta própria.",
      fonte: fonte("Ministério da Gestão", "https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026"),
    },
    "Véspera de Ano-Novo": {
      texto:
        "Não é feriado. A portaria anual do governo federal dá ponto facultativo à tarde nos órgãos federais (a partir das 13h em 2025 e 2026). " +
        "Empresas, estados e prefeituras decidem por conta própria.",
      fonte: fonte("Ministério da Gestão", "https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026"),
    },

    // ---------- estaduais ----------
    "AC:Dia do Evangélico": {
      texto: EVANGELICO.texto + " No Acre, é 23 de janeiro, pela Lei 1.538/2004.",
      fonte: fonte("Agência de Notícias do Acre", "https://agencia.ac.gov.br/governo-do-acre-confirma-transferencia-do-feriado-do-dia-do-catolico-e-mantem-o-do-dia-do-evangelico/"),
    },
    "AC:Dia Internacional da Mulher": {
      texto:
        "O Dia Internacional da Mulher, que nasceu no movimento operário do começo do século XX e foi adotado pela ONU nos anos 1970. " +
        "No Acre, é feriado estadual desde 2001.",
      fonte: fonte("Assembleia Legislativa do Acre (Lei 1.411/2001)", "https://app.al.ac.leg.br/legisla-e/legislacao/visualizar/5382"),
    },
    "AC:Aniversário do Acre": {
      texto:
        "Em 15 de junho de 1962, o presidente João Goulart sancionou a lei que transformou o Território do Acre em estado. " +
        "Com isso, os acreanos passaram a eleger o próprio governador e a ter leis e impostos próprios.",
      fonte: fonte("Agência de Notícias do Acre", "https://agencia.ac.gov.br/nos-60-anos-de-elevacao-do-acre-a-categoria-de-estado-conheca-a-saga-do-movimento-autonomista-liderado-por-jose-guiomard-santos/"),
    },
    "AC:Dia da Amazônia": {
      texto:
        "Dia dedicado à maior floresta tropical do mundo e à sua preservação. " +
        "O 5 de setembro lembra a criação da Província do Amazonas por D. Pedro II, em 1850.",
      fonte: fonte("Rádio Senado", "https://www12.senado.leg.br/radio/1/noticia/2025/09/04/5-de-setembro-e-o-dia-da-amazonia"),
    },
    "AC:Tratado de Petrópolis": {
      texto:
        "Em 17 de novembro de 1903, Brasil e Bolívia assinaram o tratado que incorporou o Acre ao Brasil, depois da Revolução Acreana liderada por Plácido de Castro. " +
        "Em troca, o Brasil pagou 2 milhões de libras, cedeu terras em Mato Grosso e se comprometeu a construir a ferrovia Madeira-Mamoré.",
      fonte: fonte("Agência de Notícias do Acre", "https://agencia.ac.gov.br/tratado-de-petropolis-a-certidao-de-nascimento-do-estado-do-acre/"),
    },
    "AL:São João": {
      texto:
        "Dia de São João Batista, o centro das festas juninas, que no Nordeste coincidem com a colheita do milho: fogueira, quadrilha, forró e comida de milho. " +
        "Em Alagoas é feriado estadual desde 1993.",
      fonte: fonte("Agência Brasil", "https://agenciabrasil.ebc.com.br/cultura/noticia/2025-06/com-origem-europeia-festas-juninas-misturam-devocao-comidas-e-dancas"),
    },
    "AL:São Pedro": {
      texto:
        "Dia de São Pedro, que fecha o ciclo das festas juninas, trazidas pelos portugueses e misturadas a tradições indígenas e africanas. " +
        "Em Alagoas é feriado estadual desde 1993.",
      fonte: fonte("Agência Brasil", "https://agenciabrasil.ebc.com.br/cultura/noticia/2025-06/com-origem-europeia-festas-juninas-misturam-devocao-comidas-e-dancas"),
    },
    "AL:Emancipação Política de Alagoas": {
      texto:
        "Em 16 de setembro de 1817, D. João VI separou Alagoas da Capitania de Pernambuco, logo depois da derrota da Revolução Pernambucana. " +
        "Há quem leia o ato como punição aos revoltosos pernambucanos; para os alagoanos, é a data da sua autonomia.",
      fonte: fonte("Governo de Alagoas", "https://dados.al.gov.br/catalogo/dataset/348b8b6d-a41a-41a7-9f93-c8c6eb3aa1fa/resource/e3adff04-27df-4198-b312-4c279b2ca5a3/download/emancipacao-politica-de-alagoas.pdf"),
    },
    "AM:Elevação do Amazonas a Província": {
      texto:
        "Em 5 de setembro de 1850, a antiga Capitania de São José do Rio Negro deixou de pertencer ao Grão-Pará e virou a Província do Amazonas, origem do estado atual. " +
        "O primeiro presidente foi Tenreiro Aranha.",
      fonte: fonte("Agência Brasil", "https://agenciabrasil.ebc.com.br/cultura/noticia/2017-09/amazonas-comemora-elevacao-do-estado-categoria-de-provincia"),
    },
    "AP:Dia de São José": {
      texto:
        "Homenagem a São José, padroeiro do Amapá e de Macapá, devoção que vem da fundação da vila, em 1758. " +
        "No mesmo dia se comemora o aniversário da Fortaleza de São José de Macapá.",
      fonte: fonte("Governo do Amapá", "https://www.amapa.gov.br/noticia/1805/19-de-marco-celebra-dia-de-sao-jose-da-fortaleza-e-do-artesao-amapaense"),
    },
    "AP:Criação do Território Federal do Amapá": {
      texto:
        "Em 13 de setembro de 1943, em plena Segunda Guerra, Getúlio Vargas desmembrou parte do Pará e criou o Território Federal do Amapá, " +
        "para reforçar a fronteira com a Guiana Francesa. O território virou estado com a Constituição de 1988.",
      fonte: fonte("Câmara dos Deputados (Decreto-Lei 5.812/1943)", "https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-5812-13-setembro-1943-415787-publicacaooriginal-1-pe.html"),
    },
    "BA:Independência da Bahia": {
      texto:
        "Em 2 de julho de 1823, as tropas portuguesas deixaram Salvador depois de mais de um ano de guerra, e a Bahia se juntou ao Brasil independente. " +
        "Para os baianos, foi aí que a Independência se completou. O desfile tem o Caboclo e a Cabocla, símbolos da luta popular.",
      fonte: fonte("Câmara dos Deputados", "https://infograficos.camara.leg.br/2-de-julho-independencia-do-brasil-na-bahia/"),
    },
    "CE:Data Magna do Ceará": {
      texto:
        "Em 25 de março de 1884, o Ceará foi a primeira província do Brasil a abolir a escravidão, quatro anos antes da Lei Áurea. " +
        "Um marco do caminho foi a greve dos jangadeiros liderada por Francisco José do Nascimento, o Dragão do Mar, que se recusaram a levar escravizados aos navios.",
      fonte: fonte("Fundação Cultural Palmares", "https://www.gov.br/palmares/pt-br/assuntos/noticias/muito-alem-do-13-de-maio-ha-135-anos-o-ceara-tornava-se-a-primeira-provincia-brasileira-a-abolir-a-escravidao"),
    },
    "DF:Dia do Evangélico": {
      texto:
        EVANGELICO.texto + " No Distrito Federal, é 30 de novembro desde 1995. " +
        "Em 2010, uma lei federal criou o Dia Nacional do Evangélico na mesma data, mas sem feriado.",
      fonte: fonte("Agência Brasília", "https://www.agenciabrasilia.df.gov.br/2018/11/29/o-que-abre-e-o-que-fecha-no-dia-do-evangelico/"),
    },
    "ES:Nossa Senhora da Penha": {
      texto:
        "Homenagem a Nossa Senhora da Penha, padroeira do Espírito Santo, cujo convento no alto de um morro em Vila Velha nasceu de uma ermida erguida pelo frei Pedro Palácios no século XVI. " +
        "A data muda todo ano: é a segunda-feira oito dias depois da Páscoa, quando termina a Festa da Penha.",
      fonte: fonte("Prefeitura de Vila Velha", "https://www.vilavelha.es.gov.br/paginas/cultura-e-turismo-festa-da-penha"),
    },
    "GO:Fundação da Cidade de Goiás": {
      texto:
        "Lembra a antiga Vila Boa, hoje Cidade de Goiás, primeira capital do estado. " +
        "Na data, o governo estadual se transfere simbolicamente para lá, numa solenidade em frente ao Palácio Conde dos Arcos.",
      fonte: fonte("Governo de Goiás", "https://goias.gov.br/casacivil/feriado-da-fundacao-da-cidade-de-goias-sera-celebrado-na-segunda-feira-26-07-veja-o-que-abre-e-o-que-fecha-na-administracao-estadual/"),
    },
    "GO:Pedra Fundamental de Goiânia": {
      texto:
        "Em 24 de outubro de 1933, Pedro Ludovico Teixeira lançou a pedra fundamental de Goiânia, a capital planejada que substituiu a Cidade de Goiás. " +
        "É o aniversário da capital.",
      fonte: fonte("Governo de Goiás", "https://goias.gov.br/cultura/goiani/"),
    },
    "MA:Adesão do Maranhão à Independência": {
      texto:
        "Em 28 de julho de 1823, quase um ano depois do Grito do Ipiranga, São Luís aceitou a Independência, cercada por tropas do Piauí e do Ceará " +
        "e pela esquadra de Lord Cochrane. A elite local resistia por causa dos laços comerciais com Portugal.",
      fonte: fonte("Arquivo Nacional", "https://www.gov.br/arquivonacional/pt-br/sites_eventos/sites-tematicos-1/brasil-oitocentista/especial-bicentenario-da-independencia/longe-das-margens-do-ipiranga-a-independencia-do-maranhao-1"),
    },
    "MS:Criação do Estado": {
      texto:
        "Em 11 de outubro de 1977, o presidente Ernesto Geisel assinou a lei que dividiu Mato Grosso e criou Mato Grosso do Sul, com capital em Campo Grande. " +
        "A divisão era uma reivindicação antiga do sul do estado.",
      fonte: fonte("Assembleia Legislativa de MS", "https://al.ms.gov.br/Paginas/1/historia"),
    },
    "PA:Adesão do Grão-Pará à Independência": {
      texto:
        "Em 15 de agosto de 1823, autoridades do Grão-Pará assinaram em Belém a adesão à Independência, quase um ano depois do 7 de setembro, " +
        "pressionadas por um navio de guerra do capitão John Grenfell. O Pará foi a última província a aderir.",
      fonte: fonte("Assembleia Legislativa do Pará", "https://www.alepa.pa.gov.br/Comunicacao/Noticia/8982/200-anos-de-adesao-da-provincia-do-para-a-independencia-da-republica-do-brasil"),
    },
    "PB:Homenagem a João Pessoa": {
      texto:
        "Lembra João Pessoa, presidente (governador) da Paraíba, assassinado em Recife em 26 de julho de 1930. " +
        "A morte comoveu o país, deu nome à capital e explica o preto da bandeira paraibana, sinal de luto.",
      fonte: fonte("Jornal A União (Governo da PB)", "https://auniao.pb.gov.br/noticias/caderno_politicas/dia-de-homenagens-a-joao-pessoa"),
    },
    "PB:Fundação do Estado": {
      texto:
        "Em 5 de agosto de 1585, os portugueses fundaram a cidade de Nossa Senhora das Neves, hoje João Pessoa, marco do início da Paraíba. " +
        "É também o dia da padroeira, Nossa Senhora das Neves.",
      fonte: fonte("Rádio Câmara", "https://www.camara.leg.br/radio/programas/410488-o-aniversario-da-fundacao-da-paraiba-e-da-emancipacao-de-joao-pessoa/"),
    },
    "PE:Data Magna de Pernambuco": {
      texto:
        "Lembra o início da Revolução Pernambucana de 1817, quando Pernambuco se declarou independente de Portugal e criou um governo republicano " +
        "que durou cerca de dois meses e meio, até ser derrotado pela Coroa. Frei Caneca foi um dos líderes.",
      fonte: fonte("Assembleia Legislativa de PE", "https://www.alepe.pe.gov.br/2018/02/01/data-magna-novo-feriado-estadual-comeca-a-valer-neste-ano/"),
    },
    "PI:Dia do Piauí": {
      texto:
        "Em 19 de outubro de 1822, a Câmara da Vila de Parnaíba aderiu à Independência. " +
        "A reação das tropas portuguesas levou à Batalha do Jenipapo, em Campo Maior, em 1823.",
      fonte: fonte("Rádio Senado", "https://www12.senado.leg.br/radio/1/conexao-senado/2022/10/19/dedo-de-prosa-dia-do-piaui-200-anos-de-independencia"),
    },
    "RJ:Carnaval": {
      texto:
        "No Rio de Janeiro, a terça de Carnaval é feriado estadual desde 2009; a segunda e a Quarta-feira de Cinzas seguem como ponto facultativo. " +
        "A festa chegou ao Brasil com o entrudo português, em que se jogava água e farinha nas pessoas na rua.",
      fonte: CARNAVAL.fonte,
    },
    "RJ:Dia de São Jorge": {
      texto:
        "São Jorge, soldado romano que a tradição diz ter sido morto em 23 de abril de 303 por não renegar a fé, é santo de enorme devoção popular no Rio, " +
        "onde é associado ao orixá Ogum na umbanda e no candomblé. É feriado estadual desde 2008.",
      fonte: fonte("Agência Brasil", "https://agenciabrasil.ebc.com.br/cultura/noticia/2026-04/saiba-mais-sobre-sao-jorge-celebrado-neste-23-de-abril"),
    },
    "RN:Mártires de Cunhaú e Uruaçu": {
      texto:
        "Lembra os católicos mortos em 1645, durante a ocupação holandesa, nos massacres de Cunhaú (16 de julho) e Uruaçu (3 de outubro). " +
        "Trinta deles foram canonizados pelo papa Francisco em 2017.",
      fonte: fonte("Agência Brasil", "https://agenciabrasil.ebc.com.br/internacional/noticia/2017-10/brasil-tem-30-novos-santos-papa-canoniza-martires-de-cunhau-e-uruacu"),
    },
    "RO:Criação do Estado": {
      texto:
        "Em 4 de janeiro de 1982 foi instalado o estado de Rondônia, criado dias antes a partir do antigo território federal. " +
        "O nome homenageia o marechal Rondon, cujas linhas telegráficas ligaram a região ao resto do país.",
      fonte: fonte("Governo de Rondônia", "https://rondonia.ro.gov.br/estado-de-rondonia-comemora-41-anos-de-criacao-com-avanco-no-desenvolvimento/"),
    },
    "RO:Dia do Evangélico": {
      texto:
        EVANGELICO.texto + " Em Rondônia, a Lei 1.026/2001 criou o feriado de 18 de junho, " +
        "mas o STF a declarou inconstitucional em 2020 (ADI 3940), e a data deixou de ser feriado estadual.",
      fonte: fonte("Assembleia Legislativa de RO (Lei 1.026/2001)", "https://sapl.al.ro.leg.br/norma/3003"),
    },
    "RR:Criação do Estado": {
      texto:
        "Em 5 de outubro de 1988, a Constituição Federal transformou o Território Federal de Roraima em estado. " +
        "A Constituição de Roraima chama a data de \"data magna\" do estado.",
      fonte: fonte("Assembleia Legislativa de RR", "https://al.rr.leg.br/2026/10/05/aniversario-de-roraima-38-anos/"),
    },
    "RS:Revolução Farroupilha": {
      texto:
        "Lembra o início da Revolução Farroupilha, em 20 de setembro de 1835, revolta contra o Império motivada sobretudo pelos impostos sobre produtos gaúchos. " +
        "A guerra durou dez anos e terminou num acordo de paz em 1845. É o Dia do Gaúcho, ponto alto da Semana Farroupilha.",
      fonte: fonte("Rádio Senado", "https://www12.senado.leg.br/radio/1/conexao-senado/2022/09/20/dedo-de-prosa-dia-da-revolucao-farroupilha"),
    },
    "SE:Emancipação Política de Sergipe": {
      texto:
        "Em 8 de julho de 1820, D. João VI assinou a carta régia que separou Sergipe da Bahia. " +
        "A Bahia resistiu e chegou a prender o primeiro governador; a autonomia só se firmou depois da Independência.",
      fonte: fonte("Prefeitura de Aracaju", "https://www.aracaju.se.gov.br/noticias/118171/carta_regia_de_dom_joao_vi_marcou_inicio_da_emancipacao_politica_de_sergipe_ha_206_anos.html"),
    },
    "SP:Revolução Constitucionalista": {
      texto:
        "Lembra o início da Revolução Constitucionalista de 1932, quando São Paulo pegou em armas contra o governo provisório de Getúlio Vargas " +
        "para exigir uma nova Constituição. Os paulistas se renderam em outubro, mas a Constituição veio em 1934.",
      fonte: fonte("Agência Brasil", "https://agenciabrasil.ebc.com.br/geral/noticia/2024-07/saiba-o-que-foi-revolucao-constitucionalista-de-1932-em-sao-paulo"),
    },
    "TO:Autonomia do Estado": {
      texto:
        "Em 18 de março de 1809, um alvará de D. João dividiu a Capitania de Goiás e criou a Comarca do Norte, embrião do Tocantins. " +
        "O desembargador Joaquim Theotônio Segurado, que a administrava, liderou em 1821 o primeiro movimento pela separação.",
      fonte: fonte("Governo do Tocantins", "https://www.to.gov.br/secom/noticias/dia-da-autonomia-relembra-processo-para-criacao-do-estado/2bmdnpdn75at"),
    },
    "TO:Nossa Senhora da Natividade": {
      texto:
        "Homenagem a Nossa Senhora da Natividade, padroeira do Tocantins. A imagem chegou à região em 1735 e deu origem à cidade de Natividade. " +
        "O 8 de setembro é, na tradição cristã, o dia do nascimento de Maria.",
      fonte: fonte("Governo do Tocantins", "https://portal.to.gov.br/reas-de-interesse/cultura/manifestacoes-culturais/festa-de-nossa-senhora-da-natividade/"),
    },
    "TO:Criação do Estado": {
      texto:
        "Em 5 de outubro de 1988, a Constituição Federal criou o Tocantins a partir do norte de Goiás, fim de uma luta pela separação que vinha do século XIX. " +
        "Instalado em 1º de janeiro de 1989, é o estado mais novo do país.",
      fonte: fonte("Governo do Tocantins", "https://www.to.gov.br/secult/l-criacao-do-estado-do-tocantins-1988/69ku6myrjrwe"),
    },
  };

  // `f`: item de Feriados.feriadosDoAno. Devolve { texto, fonte } ou null.
  function sobre(f) {
    return (f.uf && SOBRE[`${f.uf}:${f.nome}`]) || SOBRE[f.nome] || null;
  }

  const api = { sobre };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SobreFeriados = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
