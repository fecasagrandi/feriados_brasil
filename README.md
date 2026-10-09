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
- **Vésperas**: 24/12 e 31/12, **ponto facultativo a partir das 14h** (repetido todo ano na portaria federal).

Carnaval e Corpus Christi **não são feriados nacionais por lei**: são pontos facultativos definidos na portaria anual do governo federal. Por isso aparecem só com a opção "pontos facultativos" ligada.

## Feriados estaduais

A tabela `ESTADUAIS` em `feriados.js` foi montada **cruzando fontes**, porque não existe uma base oficial única e as fontes disponíveis divergem:

- [`date-holidays`](https://github.com/commenthol/date-holidays) (dados com lei e data de vigência),
- [`@lfreneda/eh-dia-util`](https://www.npmjs.com/package/@lfreneda/eh-dia-util) (dados com lei citada),
- levantamentos de feriados estaduais de 2026.

Critério: entra quando **duas fontes independentes concordam e citam a lei**. As divergências encontradas e como foram resolvidas:

| UF | Situação |
|---|---|
| AC | Dia do Evangélico em **23/01** (Lei 1.538/2004). Uma biblioteca tinha 12/01 com vigência a partir de 29/01/2004 — a data da própria lei, provável erro de digitação. **Incluído.** |
| PE | Data Magna em **6 de março**, data fixa desde a Lei 16.059/2017 (a regra antiga era o 1º domingo de março). **Incluído a partir de 2017.** São João (24/06) é municipal (Recife): fora. |
| PR | 19/12 foi **revogado** como feriado pela Lei 18.384/2014 (virou só data comemorativa). Fora. |
| SC | 11/08 e 25/11 são **transferidos para o domingo** (Lei 12.906/2004): não afetam dia útil. Fora. |
| CE | São José (19/03): só encontrada como data comemorativa (Lei 18.390/2023), sem lei clara de feriado. **Fora, pendente de confirmação.** |
| AC | Tratado de Petrópolis (17/11): `date-holidays` marca como facultativo, mas os calendários oficiais citam **feriado estadual, Lei 57/1965**. **Feriado.** Ele e o Dia da Amazônia (Lei 243/1968) seguem com vigência a partir de 2012 e 2004, como no `date-holidays`, porque não foi possível confirmar se valiam antes. |
| AL | Emancipação Política (16/09): os decretos anuais citam em bloco as Leis 5.247/1991, 5.508/1993, 5.509/1993 e 5.724/1995. As outras três são de São João, São Pedro e Zumbi; a **Lei 5.247/1991** foi atribuída ao 16/09 por eliminação. |
| RJ | Terça de Carnaval: a Lei 5.243 é de 14/05/2008, depois do Carnaval daquele ano. **Vale a partir de 2009.** |
| RR, RS, SE | A base é a própria Constituição estadual (art. 9º, art. 6º e art. 269), não uma lei ordinária. |

**Consciência Negra (20/11) antes de 2024.** Antes da lei nacional, seis estados já tinham o feriado: AL (Lei 5.724/1995), RJ (Lei 4.007/2002), MT (Lei 7.879/2002, de 27/12, então a partir de 2003), AP (Lei 1.169/2007, a partir de 2008 porque a data da lei não foi confirmada), AM (Lei 84/2010) e SP (Lei 17.746/2023, só 2023). Calendários de anos passados desses estados incluem a data; de 2024 em diante ela aparece uma vez só, como nacional.

Todo feriado estadual cita a lei (ou o artigo da Constituição estadual), e um teste falha se aparecer um sem citação.

Sem feriado estadual em dia próprio: MG e DF (o 21/04 coincide com Tiradentes) e MT (tinha só a Consciência Negra, hoje nacional).

Ressalva honesta: as leis acima foram localizadas por busca, não lidas no texto original. Quem tiver acesso aos portais das assembleias pode confirmar e abrir uma issue.

Se o estado tiver feriado no mesmo dia de um ponto facultativo nacional (terça de Carnaval no RJ), vale o feriado.

**Achou um erro?** Abra uma issue com o link da lei — é a única coisa que resolve a dúvida.

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
- No `localStorage` ficam só: `feriados:uf` (sigla), `feriados:tema` e `feriados:facultativos`. O "×" ao lado da sigla apaga a UF.
- Fontes servidas pelo próprio site (antes vinham do Google Fonts, que recebe o IP de cada visitante).
- A página declara uma **Content-Security-Policy** com `connect-src 'none'` e todos os recursos em `'self'`: o próprio navegador impede que qualquer script envie dados para fora. É uma garantia verificável, não só uma promessa.
- A hospedagem (GitHub Pages) pode registrar IPs de acesso, como qualquer servidor web.

## Recursos

- Contagem regressiva até o feriado escolhido (clique em qualquer um da lista).
- Marcas de "dias riscados" desde o último feriado.
- Etiquetas de **feriadão** (segunda/sexta) e **ponte** (terça/quinta).
- **Planejador de folgas**: as emendas dos próximos 12 meses que rendem mais dias de descanso por dia de férias (mínimo 2,5×), já com os feriados do estado.
- Calendário de qualquer ano, exportável para `.ics` (Google Agenda, Outlook, Apple Calendário).
- Tema claro e escuro num botão (sol/lua). A primeira visita abre no tema do sistema; depois vale a escolha, salva no navegador.
- Animações respeitam `prefers-reduced-motion`.

## Estrutura

| Arquivo | O que é |
|---|---|
| `feriados.js` | Cálculo das datas (nacionais e estaduais) e exportação `.ics`. Lógica pura. |
| `localizacao.js` | Coordenada → UF (point-in-polygon). Lógica pura. |
| `ufs-geo.js` | Contornos das UFs (gerado). |
| `app.js`, `tema.js`, `estilo.css`, `index.html` | Interface. |
| `fontes/` | Barlow Condensed e DM Mono (SIL OFL 1.1, licenças na pasta). |
| `scripts/gerar-ufs-geo.js` | Regenera `ufs-geo.js`. |
| `scripts/versionar.js` | Atualiza o `?v=<hash>` dos assets (cache busting). |
| `scripts/gerar-og.js`, `og.png` | Imagem da prévia de link (1200×630). A URL absoluta dela está no `index.html`: atualize se o endereço do site mudar. |
| `test/` | Testes de unidade (`node:test`). |
| `e2e/`, `playwright.config.js` | Testes de ponta a ponta (Playwright). |
| `scripts/servidor.js` | Servidor estático local, sem dependências. |

Os arquivos `.js` funcionam como `<script>` clássico e como módulo CommonJS, por isso dá para testar no Node sem build.

## Ao alterar qualquer `.js` ou `.css`

```sh
node scripts/versionar.js
```

O GitHub Pages serve cada arquivo com cache de 10 minutos, e cada um expira numa hora diferente. Sem versão na URL, logo após um deploy o navegador pode juntar um `app.js` novo com um `feriados.js` antigo e a página quebra. O script coloca o hash do conteúdo em cada URL; um teste falha no CI se alguém esquecer.

## Testes

```sh
npm test            # unidade: datas, UFs, .ics, cache busting (node:test, sem dependências)
npm ci && npm run test:e2e   # ponta a ponta: a página num Chromium de verdade (Playwright)
npm run servir      # servidor local em http://127.0.0.1:4173
```

Os testes de ponta a ponta (`e2e/`) cobrem o que já quebrou ou o que a página promete: nenhuma requisição externa, mapa das UFs só sob demanda, "é hoje", virada do ano, aviso de versões misturadas, localização (SP, negada, fora do Brasil, esquecer), tema, rolagem horizontal em 3 larguras, logo do topo e proporção da bandeira. Foram validados reintroduzindo bugs antigos e conferindo que falham.

O CI roda os dois em todo PR. Requer Node 18+.
