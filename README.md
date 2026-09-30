# Contagem Regressiva — Feriados do Brasil

Contagem regressiva para os próximos feriados nacionais e estaduais, com visual de folhinha de parede (o feriado é o "dia vermelho"). Página estática, sem build e sem dependências: abra o `index.html` no navegador (funciona até via `file://`).

## Feriados nacionais

Nada é digitado à mão — as datas são **calculadas** para qualquer ano entre 1583 e 9999:

- **Fixos**: 1/jan, 21/abr, 1/mai, 7/set, 12/out (desde 1980, Lei 6.802/1980), 2/nov, 15/nov, 20/nov (desde 2024, Lei 14.759/2023) e 25/dez.
- **Móveis**: derivados da Páscoa, calculada pelo algoritmo anônimo gregoriano (Meeus/Jones/Butcher).
  - Paixão de Cristo = Páscoa − 2 dias (**feriado**)
  - Carnaval = Páscoa − 48 e − 47 dias (**ponto facultativo**)
  - Quarta-feira de Cinzas = Páscoa − 46 dias (**ponto facultativo**, até 14h)
  - Corpus Christi = Páscoa + 60 dias (**ponto facultativo**)

Carnaval e Corpus Christi **não são feriados nacionais por lei**: são pontos facultativos definidos na portaria anual do governo federal. Por isso aparecem só com a opção "pontos facultativos" ligada.

## Feriados estaduais

A tabela `ESTADUAIS` em `feriados.js` foi montada **cruzando fontes**, porque não existe uma base oficial única e as fontes disponíveis divergem:

- [`date-holidays`](https://github.com/commenthol/date-holidays) (dados com lei e data de vigência),
- [`@lfreneda/eh-dia-util`](https://www.npmjs.com/package/@lfreneda/eh-dia-util) (dados com lei citada),
- levantamentos de feriados estaduais de 2026.

Entrou só o que tem **consenso**. Ficaram de fora, até alguém confirmar na legislação estadual:

| UF | Divergência |
|---|---|
| AC | Dia do Evangélico: 12/01 numa fonte, 23/01 em outra. |
| CE | São José (19/03): listado como estadual numa fonte, ausente em outra. |
| PE | Data Magna: 6 de março ou 1º domingo de março; São João (24/06): estadual ou municipal (Recife). |
| PR | Emancipação (19/12): listada pelas bibliotecas, mas levantamentos recentes dizem que o PR não tem feriado estadual. |
| SC | 11/08 e 25/11 são transferidos para o domingo seguinte por lei — não afetam dia útil. |

Sem feriado estadual em dia próprio: MG e DF (o 21/04 coincide com Tiradentes) e MT (tinha só a Consciência Negra, hoje nacional).

Se o estado tiver feriado no mesmo dia de um ponto facultativo nacional (terça de Carnaval no RJ), vale o feriado.

**Achou um erro?** Abra uma issue com o link da lei — é a única coisa que resolve a dúvida.

## Detecção do estado pela localização

Opcional, e só quando a pessoa clica em "usar minha localização":

1. O navegador pede permissão (Geolocation API, precisão baixa).
2. A coordenada vira UF **no próprio navegador**, por point-in-polygon sobre contornos simplificados das UFs (`ufs-geo.js`, ~70 KB com gzip, baixado só nessa hora).
3. A coordenada é descartada; fica salva só a sigla.

Precisão medida contra os 5.564 municípios do IBGE: **5.563 corretos** (o único erro é Dores do Rio Preto/ES, colado na divisa com MG). A UF detectada sempre aparece no seletor, e dá para trocar.

`ufs-geo.js` é gerado por `scripts/gerar-ufs-geo.js` a partir do [geodata-br-states](https://github.com/giuliano-oliveira/geodata-br-states) (MIT, derivado da camada "Estados do Brasil" do LAGEAMB/UFPR).

## Privacidade

- **Sem cookies, sem analytics, sem rastreadores.** Não há banner de cookies porque não há cookies.
- A localização nunca sai do aparelho (ver acima).
- No `localStorage` ficam só: `feriados:uf` (sigla), `feriados:tema` e `feriados:facultativos`. O botão "esquecer" apaga a UF.
- Fontes servidas pelo próprio site (antes vinham do Google Fonts, que recebe o IP de cada visitante).
- A página declara uma **Content-Security-Policy** com `connect-src 'none'` e todos os recursos em `'self'`: o próprio navegador impede que qualquer script envie dados para fora. É uma garantia verificável, não só uma promessa.
- A hospedagem (GitHub Pages) pode registrar IPs de acesso, como qualquer servidor web.

## Recursos

- Contagem regressiva até o feriado escolhido (clique em qualquer um da lista).
- Marcas de "dias riscados" desde o último feriado.
- Etiquetas de **feriadão** (segunda/sexta) e **ponte** (terça/quinta).
- Calendário de qualquer ano, exportável para `.ics` (Google Agenda, Outlook, Apple Calendário).
- Tema claro e escuro (segue o sistema ou escolha manual, salvo no navegador).
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
| `test/` | Testes com o runner nativo do Node (`node:test`). |

Os arquivos `.js` funcionam como `<script>` clássico e como módulo CommonJS, por isso dá para testar no Node sem build.

## Ao alterar qualquer `.js` ou `.css`

```sh
node scripts/versionar.js
```

O GitHub Pages serve cada arquivo com cache de 10 minutos, e cada um expira numa hora diferente. Sem versão na URL, logo após um deploy o navegador pode juntar um `app.js` novo com um `feriados.js` antigo e a página quebra. O script coloca o hash do conteúdo em cada URL; um teste falha no CI se alguém esquecer.

## Testes

```sh
npm test   # ou: node --test
```

Requer Node 18+. Sem dependências para instalar.
