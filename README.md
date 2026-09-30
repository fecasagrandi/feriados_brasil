# Feriados Nacionais do Brasil

Contagem regressiva para os próximos feriados nacionais. Página estática, sem build e sem dependências: abra o `index.html` no navegador (funciona até via `file://`).

## Como as datas são obtidas

Nada é digitado à mão — as datas são **calculadas** para qualquer ano entre 1583 e 9999:

- **Fixos**: 1/jan, 21/abr, 1/mai, 7/set, 12/out (desde 1980, Lei 6.802/1980), 2/nov, 15/nov, 20/nov (desde 2024, Lei 14.759/2023) e 25/dez.
- **Móveis**: derivados da Páscoa, calculada pelo algoritmo anônimo gregoriano (Meeus/Jones/Butcher).
  - Paixão de Cristo = Páscoa − 2 dias (**feriado**)
  - Carnaval = Páscoa − 48 e − 47 dias (**ponto facultativo**)
  - Quarta-feira de Cinzas = Páscoa − 46 dias (**ponto facultativo**, até 14h)
  - Corpus Christi = Páscoa + 60 dias (**ponto facultativo**)

Carnaval e Corpus Christi **não são feriados nacionais por lei**: são pontos facultativos definidos na portaria anual do governo federal. Por isso aparecem só com a opção "pontos facultativos" ligada. Feriados estaduais e municipais não estão incluídos.

## Estrutura

| Arquivo | O que é |
|---|---|
| `feriados.js` | Lógica pura (cálculo das datas). Funciona como `<script>` e como módulo CommonJS. |
| `index.html` | Interface. |
| `test/feriados.test.js` | Testes com o runner nativo do Node (`node:test`). |

## Testes

```sh
npm test   # ou: node --test
```

Requer Node 18+. Sem dependências para instalar.
