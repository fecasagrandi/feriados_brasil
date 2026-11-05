# Feriadou

Quanto falta para o próximo feriado: contagem regressiva para os feriados nacionais e estaduais, com visual de folhinha de parede (o feriado é o "dia vermelho"). Página estática, sem build e sem dependências: abra o `index.html` no navegador (funciona até via `file://`).

## Feriados nacionais

Nada é digitado à mão — as datas são **calculadas** para qualquer ano entre 1583 e 9999:

- **Fixos**: 1/jan, 21/abr, 1/mai, 7/set, 12/out (desde 1980, Lei 6.802/1980), 2/nov, 15/nov, 20/nov (desde 2024, Lei 14.759/2023) e 25/dez.
- **Móveis**: derivados da Páscoa, calculada pelo algoritmo anônimo gregoriano (Meeus/Jones/Butcher).
  - Paixão de Cristo = Páscoa − 2 dias (**feriado**)
  - Carnaval = Páscoa − 48 e − 47 dias (**ponto facultativo**)
  - Quarta-feira de Cinzas = Páscoa − 46 dias (**ponto facultativo**, até 14h)
  - Corpus Christi = Páscoa + 60 dias (**ponto facultativo**)
- **Vésperas**: 24/12 e 31/12, **ponto facultativo à tarde** (repetido todo ano na portaria federal; a partir das 13h em 2025 e 2026, 14h antes disso).

Carnaval e Corpus Christi **não são feriados nacionais por lei**: são pontos facultativos definidos na portaria anual do governo federal. Por isso aparecem só com a opção "pontos facultativos" ligada.

## Feriados estaduais

Os dados ficam em `estaduais.js`, um arquivo **só de dados** (sem lógica), montado **cruzando fontes**, porque não existe uma base oficial única e as fontes disponíveis divergem:

- [`date-holidays`](https://github.com/commenthol/date-holidays) (dados com lei e data de vigência),
- [`@lfreneda/eh-dia-util`](https://www.npmjs.com/package/@lfreneda/eh-dia-util) (dados com lei citada),
- levantamentos de feriados estaduais de 2026.

Critério: entra quando **duas fontes independentes concordam e citam a lei**. As divergências encontradas e como foram resolvidas:

| UF | Situação |
|---|---|
| AC | Dia do Evangélico em **23/01** (Lei 1.538/2004). Uma biblioteca tinha 12/01 com vigência a partir de 29/01/2004 — a data da própria lei, provável erro de digitação. **Incluído.** |
| PE | Data Magna em **6 de março**, data fixa desde a Lei 16.059/2017 (a regra antiga era o 1º domingo de março). **Incluído a partir de 2017.** São João (24/06) é municipal (Recife): entra só como feriado da capital. |
| PR | 19/12 foi **revogado** como feriado pela Lei 18.384/2014 (virou só data comemorativa). Fora. |
| SC | 11/08 e 25/11 são **transferidos para o domingo** (Lei 12.906/2004): não afetam dia útil. Fora. |
| CE | São José (19/03): só encontrada como data comemorativa (Lei 18.390/2023), sem lei clara de feriado. **Fora, pendente de confirmação.** |
| AC | Tratado de Petrópolis (17/11): `date-holidays` marca como facultativo, mas os calendários oficiais citam **feriado estadual, Lei 57/1965**. **Feriado.** Ele e o Dia da Amazônia (Lei 243/1968) seguem com vigência a partir de 2012 e 2004, como no `date-holidays`, porque não foi possível confirmar se valiam antes. |
| AL | Emancipação Política (16/09): os decretos anuais citam em bloco as Leis 5.247/1991, 5.508/1993, 5.509/1993 e 5.724/1995. As outras três são de São João, São Pedro e Zumbi; a **Lei 5.247/1991** foi atribuída ao 16/09 por eliminação. |
| RJ | Terça de Carnaval: a Lei 5.243 é de 14/05/2008, depois do Carnaval daquele ano. **Vale a partir de 2009.** |
| RR, RS, SE | A base é a própria Constituição estadual (art. 9º, art. 6º e art. 269), não uma lei ordinária. |
| RO | Dia do Evangélico (18/06, Lei 1.026/2001): o STF declarou a lei inconstitucional (ADI 3940, publicada em 2020), e o decreto estadual de 2026 já não traz a data. **Vale de 2002 a 2019.** |

**Consciência Negra (20/11) antes de 2024.** Antes da lei nacional, seis estados já tinham o feriado: AL (Lei 5.724/1995), RJ (Lei 4.007/2002), MT (Lei 7.879/2002, de 27/12, então a partir de 2003), AP (Lei 1.169/2007, a partir de 2008 porque a data da lei não foi confirmada), AM (Lei 84/2010) e SP (Lei 17.746/2023, só 2023). Calendários de anos passados desses estados incluem a data; de 2024 em diante ela aparece uma vez só, como nacional.

Todo feriado estadual cita a lei (ou o artigo da Constituição estadual), e um teste falha se aparecer um sem citação.

Sem feriado estadual em dia próprio: MG e DF (o 21/04 coincide com Tiradentes) e MT (tinha só a Consciência Negra, hoje nacional).

Ressalva honesta: as leis acima foram localizadas por busca, não lidas no texto original. Quem tiver acesso aos portais das assembleias pode confirmar e abrir uma issue.

Se o estado tiver feriado no mesmo dia de um ponto facultativo nacional (terça de Carnaval no RJ), vale o feriado.

**Achou um erro?** Use o formulário [Erro de data](https://github.com/fecasagrandi/feriados_brasil/issues/new?template=erro-de-data.yml): ele pede a lei e o link do texto oficial, que é o que resolve a dúvida.

**Quer corrigir você mesmo?** Edite a linha da UF em `estaduais.js` ou `municipais.js` (os campos estão explicados no topo do arquivo; `fonte` aceita o link da lei) e rode `npm test`. O `test/dados.test.js` acusa campo errado, data impossível, lei faltando ou item duplicado, com a UF e o nome do feriado na mensagem. Depois rode `node scripts/gerar-calendarios.js` (regera os `.ics` e sobe o `SEQUENCE` dos eventos que mudaram, para a correção chegar a quem assinou) e `node scripts/versionar.js`.

Por que não um `.json`: a página não pode usar `fetch` (a política de segurança tem `connect-src 'none'`, e `file://` bloqueia de qualquer jeito). Um `.js` só com o objeto dá no mesmo para quem edita.

## Feriados das capitais

Feriado municipal depende de lei de cada um dos 5.570 municípios, e não existe base oficial única. Por isso o site cobre **só as capitais**, e só para quem marca "moro em …" depois que o estado é detectado. Morar na região metropolitana não vale: Guarulhos não tem o feriado de São Paulo.

Os dados ficam em `municipais.js` (só dados, mesmo formato de `estaduais.js`, validados por `test/dados.test.js`). Lei federal 9.093/1995: cada município pode ter até 4 feriados religiosos (contando a Sexta-feira Santa) e a data de fundação. Por isso Corpus Christi, ponto facultativo nacional, é feriado em boa parte das capitais. Quando a capital decreta feriado no dia de um ponto facultativo nacional, vale o feriado.

Critério: a data aparece em **ato oficial** (portaria de tribunal, decreto da prefeitura, calendário do MPF) e em pelo menos mais uma fonte. O número da lei vem do ato que a cita.

**A confirmar** (data confirmada por ato oficial, mas sem o número da lei localizado). Aparecem no site e no `.ics` como "lei a confirmar":

| Capital | Data | Onde a data foi confirmada |
|---|---|---|
| Macapá | 04/02 Aniversário | calendários do TSE e do MPF |
| Goiânia | 24/05 Nossa Senhora Auxiliadora | calendário do TJGO |
| Campo Grande | 13/06 Santo Antônio, 26/08 Aniversário | Justiça Federal e TJMS |
| Cuiabá | 08/04 Aniversário | decreto municipal de 2026 |
| Teresina | 16/08 Aniversário | Lei 5.573/2021 (antecipou o feriado de 2021) |
| Rio de Janeiro | 20/01 São Sebastião | Agência Brasil e prefeitura. Uma única fonte cita a Lei 1.271/1988 |
| Natal | 06/01 Santos Reis, 21/11 Nossa Senhora da Apresentação | prefeitura e TCE-RN |

**Fora, por divergência:**

| Capital | Situação |
|---|---|
| Brasília | O DF não tem municípios. |
| Belém | Em 2026 a prefeitura decretou **ponto facultativo** no aniversário (12/01). Corpus Christi aparece como feriado e como facultativo, conforme a fonte. |
| Cuiabá | 08/12 (Lei 5.576/2012) foi contestado na Justiça pela CDL, desfecho não localizado. Corpus Christi divergente. |
| Boa Vista | Corpus Christi está como feriado no decreto de 2026, mas sem lei; os 4 religiosos da Lei 104/1984 já fecham o limite. |
| Porto Velho | 24/01 e 24/05 só em calendários privados, sem ato oficial. |
| Aracaju | 08/12 só em calendário privado. |
| Vitória | Corpus Christi: o decreto de 2009 e a antecipação de 2021 tratam como feriado (Lei 1.732/1967); um guia de 2026 diz facultativo. **Mantido como feriado**, vale conferir. |

Ressalva honesta: tudo isso veio de **busca**, não da leitura do texto original das leis (o ambiente onde o levantamento foi feito não abria os portais das câmaras). Atos de tribunais e do MPF citam as leis, mas às vezes divergem entre si (João Pessoa: Lei 8.805/1999 ou 13.768/2019 para São João). Se você mora numa capital e sabe que algo está errado, o formulário [Erro de data](https://github.com/fecasagrandi/feriados_brasil/issues/new?template=erro-de-data.yml) tem a opção "Feriado municipal (capital)".

## O que cada feriado comemora

Ao escolher um feriado, aparece um parágrafo curto sobre o que ele lembra, com link para a fonte. Os textos ficam em `sobre.js` e as fontes são sempre de órgãos públicos (governos, assembleias, Senado, Câmara, Arquivo Nacional, Agência Brasil). Um teste garante que todo feriado, nacional ou estadual, tem texto e fonte.

## Detecção do estado pela localização

Opcional, e só quando a pessoa toca no ícone de localização (canto superior direito). Não há pedido de permissão ao abrir a página:

1. O navegador pede permissão (Geolocation API, precisão baixa).
2. A coordenada vira UF **no próprio navegador**, por point-in-polygon sobre contornos simplificados das UFs (`ufs-geo.js`, ~70 KB com gzip, baixado só nessa hora).
3. A coordenada é descartada; fica salva só a sigla.

Precisão medida contra os 5.564 municípios do IBGE: **5.563 corretos** (o único erro é Dores do Rio Preto/ES, colado na divisa com MG). A UF detectada aparece ao lado do ícone. Se a permissão for negada, a página segue só com os feriados nacionais.

`ufs-geo.js` é gerado por `scripts/gerar-ufs-geo.js` a partir do [geodata-br-states](https://github.com/giuliano-oliveira/geodata-br-states) (MIT, derivado da camada "Estados do Brasil" do LAGEAMB/UFPR).

## Privacidade

- **Sem cookies, sem analytics, sem rastreadores.** Não há banner de cookies porque não há cookies.
- A localização nunca sai do aparelho (ver acima).
- No `localStorage` ficam só: `feriados:uf` (sigla), `feriados:capital` (se marcou que mora na capital), `feriados:tema` e `feriados:facultativos`. O "×" ao lado da sigla apaga a UF e a marca da capital.
- Fontes servidas pelo próprio site (antes vinham do Google Fonts, que recebe o IP de cada visitante).
- A página declara uma **Content-Security-Policy** com `connect-src 'none'` e todos os recursos em `'self'`: o próprio navegador impede que qualquer script envie dados para fora. É uma garantia verificável, não só uma promessa.
- A hospedagem (GitHub Pages) pode registrar IPs de acesso, como qualquer servidor web.

## Recursos

- Contagem regressiva até o feriado escolhido (clique em qualquer um da lista).
- Marcas de "dias riscados" desde o último feriado.
- Etiquetas de **feriadão** (segunda/sexta) e **ponte** (terça/quinta).
- **Planejador de folgas**: as emendas dos próximos 12 meses que rendem mais dias de descanso por dia de férias (mínimo 2,5×), já com os feriados do estado.
- **Planejador de férias (CLT)**: onde marcar 30 (ou 20, 24…) dias de férias em até 3 períodos para colar o máximo de folga antes e depois. Segue as regras da CLT (art. 134 e 135): dias corridos, um período de 14+ dias e os outros de 5+, não começa nos 2 dias antes de feriado ou domingo, aviso de 30 dias. É programação dinâmica, conferida contra força bruta nos testes.
- **Feriados da capital**: com o estado detectado, a opção "moro em …" inclui os feriados municipais da capital (25 capitais; ver "Feriados das capitais").
- Calendário de qualquer ano, exportável para `.ics` (Google Agenda, Outlook, Apple Calendário).
- **Calendário assinável** por estado: o botão "assinar" copia o link de `calendario/<UF>.ics`, `calendario/<UF>-capital.ics` (ou `brasil.ics`). Assinado no Google Agenda (*Outras agendas › Do URL*), Outlook ou Apple, ele **se atualiza sozinho** quando uma data é corrigida. Pontos facultativos vêm marcados no título.
- Tema claro e escuro num botão (sol/lua). A primeira visita abre no tema do sistema; depois vale a escolha, salva no navegador.
- Animações respeitam `prefers-reduced-motion`.

## Estrutura

| Arquivo | O que é |
|---|---|
| `feriados.js` | Cálculo das datas (nacionais, estaduais e das capitais) e exportação `.ics`. Lógica pura. |
| `estaduais.js`, `municipais.js` | Feriados estaduais e das capitais: só dados, validados por `test/dados.test.js`. |
| `localizacao.js` | Coordenada → UF (point-in-polygon). Lógica pura. |
| `sobre.js` | O que cada feriado comemora, com a fonte. Só conteúdo. |
| `ufs-geo.js` | Contornos das UFs (gerado). |
| `app.js`, `tema.js`, `estilo.css`, `index.html` | Interface. |
| `fontes/` | Barlow Condensed e DM Mono (SIL OFL 1.1, licenças na pasta). |
| `scripts/gerar-ufs-geo.js` | Regenera `ufs-geo.js`. |
| `scripts/versionar.js` | Atualiza o `?v=<hash>` dos assets (cache busting). |
| `scripts/gerar-calendarios.js`, `calendario/` | Calendários assináveis (Brasil, 27 UFs e 25 capitais, 2025–2030). |
| `scripts/gerar-og.js`, `og.png` | Imagem da prévia de link (1200×630). A URL absoluta dela está no `index.html`: atualize se o endereço do site mudar. |
| `test/` | Testes de unidade (`node:test`). |
| `e2e/`, `playwright.config.js` | Testes de ponta a ponta (Playwright). |
| `scripts/servidor.js` | Servidor estático local, sem dependências. |

Os arquivos `.js` funcionam como `<script>` clássico e como módulo CommonJS, por isso dá para testar no Node sem build.

## Desempenho

Medido no Chromium com rede 4G lenta simulada (150 ms de latência, 1,6 Mbps), CPU 4× mais lenta, HTTP/2 e gzip como no GitHub Pages; mediana de 15 carregamentos:

| | Antes | Depois |
|---|---|---|
| FCP | 740 ms | 652 ms |
| LCP | 3.344 ms | 996 ms |
| CLS | 0,71 | 0 |

O que fez diferença:

- **CSS antes de qualquer script** e scripts no `<head>` com `defer`: no fim do `<body>`, o Chrome os baixava um depois do outro, com prioridade baixa, atrás das fontes.
- **Conteúdo calculado invisível até o primeiro render** (classe `carregando`, posta pelo `tema.js` e tirada pelo `app.js`): a página pintava traços e listas vazias e pulava quando o JS preenchia. Se o `app.js` falhar, a animação CSS mostra tudo depois de 4 s.
- **Preload das duas fontes principais**, para estarem prontas no primeiro render (sem troca de fonte, sem pulo).
- **Animação de entrada a partir de opacidade 0,01**, não 0: o Chrome ignora elemento invisível no LCP.

O que não vale a pena aqui: minificar (o gzip do GitHub Pages já reduz os scripts a ~1/3; a economia seria menos de 1 KB e exigiria build) e cabeçalhos de cache longos (o GitHub Pages fixa `max-age=600`; depois disso o navegador só revalida e recebe `304`, sem baixar de novo).

## Ao alterar qualquer `.js` ou `.css`

```sh
node scripts/gerar-calendarios.js   # se mexeu em datas (feriados.js ou estaduais.js)
node scripts/versionar.js
```

Os dois têm teste que falha no CI se forem esquecidos. O dos calendários também falha quando a cobertura fica a menos de 2 anos do fim (hoje, 2030): é o lembrete para aumentar `ANO_FIM` no script.

O GitHub Pages serve cada arquivo com cache de 10 minutos, e cada um expira numa hora diferente. Sem versão na URL, logo após um deploy o navegador pode juntar um `app.js` novo com um `feriados.js` antigo e a página quebra. O script coloca o hash do conteúdo em cada URL; um teste falha no CI se alguém esquecer.

## Testes

```sh
npm test            # unidade: datas, UFs, .ics, cache busting (node:test, sem dependências)
npm ci && npm run test:e2e   # ponta a ponta: a página num Chromium de verdade (Playwright)
npm run servir      # servidor local em http://127.0.0.1:4173
```

Os testes de ponta a ponta (`e2e/`) cobrem o que já quebrou ou o que a página promete: nenhuma requisição externa, mapa das UFs só sob demanda, "é hoje", virada do ano, aviso de versões misturadas, localização (SP, negada, fora do Brasil, esquecer), tema, rolagem horizontal em 3 larguras, logo do topo e proporção da bandeira. Foram validados reintroduzindo bugs antigos e conferindo que falham.

O CI roda os dois em todo PR. Requer Node 18+.

## Autor

Feito por **Felipe Moreira Casagrandi** ([@fecasagrandi](https://github.com/fecasagrandi)).
