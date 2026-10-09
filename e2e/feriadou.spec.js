// Cada teste aqui corresponde a algo que já quebrou ou a uma promessa feita na página.
const { test, expect } = require("@playwright/test");

const ORIGEM = "http://127.0.0.1:4173/";

// Abre a página com relógio controlado e registra requisições externas e erros.
async function abrir(page, { quando = "2026-09-30T14:00:00", antes } = {}) {
  const externas = [];
  const erros = [];
  page.on("request", (r) => {
    if (!r.url().startsWith(ORIGEM) && !r.url().startsWith("data:")) externas.push(r.url());
  });
  page.on("pageerror", (e) => erros.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
  if (antes) await antes();
  await page.clock.install({ time: new Date(quando) });
  await page.goto("/");
  await page.clock.runFor(2000);
  return { externas, erros };
}

test("carrega sem erros e sem nenhuma requisição para outros domínios", async ({ page }) => {
  const { externas, erros } = await abrir(page);
  await expect(page.locator("#hnome")).toHaveText("Nossa Senhora Aparecida");
  await expect(page).toHaveTitle("12d · Nossa Senhora Aparecida · Feriadou");
  expect(externas).toEqual([]);
  expect(erros).toEqual([]);
});

test("contornos das UFs só são baixados se a pessoa pedir a localização", async ({ page }) => {
  const baixados = [];
  page.on("request", (r) => { if (r.url().includes("ufs-geo")) baixados.push(r.url()); });
  await abrir(page);
  expect(baixados).toEqual([]);
});

test("no dia do feriado mostra 'é hoje' em vez da contagem", async ({ page }) => {
  await abrir(page, { quando: "2026-10-12T10:00:00" });
  await expect(page.locator(".hoje-msg")).toBeVisible();
  await expect(page.locator(".countdown")).toBeHidden();
  await expect(page).toHaveTitle(/^hoje · /);
});

test("vira o ano sozinha à meia-noite", async ({ page }) => {
  await abrir(page, { quando: "2026-12-31T23:59:58" });
  await page.clock.runFor(4000);
  await expect(page.locator("#hnome")).toHaveText("Confraternização Universal");
});

test("versões misturadas no cache mostram aviso em vez de quebrar", async ({ page }) => {
  await page.route("**/feriados.js*", (r) => r.fulfill({ contentType: "text/javascript", body: "window.Feriados = {};" }));
  const { erros } = await abrir(page);
  await expect(page.locator("#hnome")).toHaveText("página desatualizada");
  expect(erros).toEqual([]);
});

test.describe("localização", () => {
  test.use({ permissions: ["geolocation"], geolocation: { latitude: -23.55, longitude: -46.63 } });

  test("detecta SP no aparelho, guarda só a sigla e inclui o 9 de julho", async ({ page }) => {
    const { externas } = await abrir(page);
    const antes = await page.locator("#geo svg").boundingBox();
    await page.locator("#geo").click();
    await expect(page.locator("#geo-uf")).toHaveText("SP");

    // o pino não se mexe: o "×" não pode surgir embaixo do cursor
    const depois = await page.locator("#geo svg").boundingBox();
    expect(Math.round(depois.x)).toBe(Math.round(antes.x));

    const armazenado = await page.evaluate(() => ({ ...localStorage }));
    expect(armazenado).toEqual({ "feriados:uf": "SP" });
    await expect(page.locator("#calendario")).toContainText("Revolução Constitucionalista");
    expect(externas).toEqual([]);

    await page.reload();
    await expect(page.locator("#geo-uf")).toHaveText("SP");
    await page.locator("#esquecer").click();
    await expect(page.locator("#geo-uf")).toHaveText("");
    expect(await page.evaluate(() => localStorage.getItem("feriados:uf"))).toBeNull();
  });
});

test.describe("localização fora do Brasil", () => {
  test.use({ permissions: ["geolocation"], geolocation: { latitude: 38.72, longitude: -9.14 } });

  test("Lisboa avisa e segue só com os nacionais", async ({ page }) => {
    await abrir(page);
    await page.locator("#geo").click();
    await expect(page.locator("#geo-status")).toContainText("fora do Brasil");
    await expect(page.locator("#geo-uf")).toHaveText("");
  });
});

test("permissão negada explica como liberar", async ({ page }) => {
  await abrir(page, {
    antes: () =>
      page.addInitScript(() => {
        navigator.geolocation.getCurrentPosition = (_ok, falha) => setTimeout(() => falha({ code: 1 }), 20);
      }),
  });
  await page.locator("#geo").click();
  await expect(page.locator("#geo-status")).toContainText("permissão negada");
});

test.describe("tema", () => {
  test.use({ colorScheme: "light" });

  test("primeira visita segue o sistema; o botão alterna e a escolha persiste", async ({ page }) => {
    await abrir(page);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(page.locator("#tema")).toHaveAttribute("aria-label", "mudar para tema escuro");
    await page.locator("#tema").click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
  });
});

for (const largura of [390, 820, 1280]) {
  test(`sem rolagem horizontal em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await abrir(page);
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(sobra).toBe(0);
  });
}

test("logo do topo não herda estilo de outros componentes", async ({ page }) => {
  await abrir(page);
  const fundo = await page.locator(".logo").evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(fundo).toBe("rgba(0, 0, 0, 0)");
});

test("bandeira do rodapé mantém a proporção oficial 10:7", async ({ page }) => {
  await abrir(page);
  const caixa = await page.locator(".bandeira").boundingBox();
  expect(caixa.width / caixa.height).toBeCloseTo(10 / 7, 2);
});

test("prévia de link: meta tags Open Graph e imagem 1200x630 servida pelo site", async ({ page, request }) => {
  await abrir(page);
  const meta = (p) => page.locator(`meta[property="${p}"]`).getAttribute("content");
  expect(await meta("og:title")).toContain("Feriadou");
  const imagem = new URL(await meta("og:image"));
  expect(imagem.protocol).toBe("https:"); // WhatsApp exige URL absoluta
  expect(imagem.searchParams.get("v")).toMatch(/^[0-9a-f]{8}$/);

  const resposta = await request.get(imagem.pathname.replace(/^\/feriados_brasil/, "") + imagem.search);
  expect(resposta.status()).toBe(200);
  const png = await resposta.body();
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]); // largura e altura do cabeçalho IHDR
});

test("planejador mostra as emendas dos próximos 12 meses", async ({ page }) => {
  await abrir(page);
  const linhas = page.locator("#folgas .folga");
  await expect(linhas).toHaveCount(3);
  await expect(linhas.nth(0)).toContainText("Natal + Confraternização Universal");
  await expect(linhas.nth(0)).toContainText("25 dez a 3 jan · férias em 28, 29, 30 e 31 dez");
  await expect(linhas.nth(0)).toContainText("4 dias de férias");
  await expect(linhas.nth(2)).toContainText("1 dia de férias");
});

test("planejador não repete o mês quando a emenda cabe num mês só", async ({ page }) => {
  await abrir(page);
  await expect(page.locator("#folgas .folga").nth(1)).toContainText("17 a 21 abr · férias em 19 e 20 abr");
});

test("mostra o que o feriado comemora, com link para a fonte, e troca ao escolher outro", async ({ page }) => {
  await abrir(page);
  const sobre = page.locator("#hsobre");
  await expect(sobre).toContainText("três pescadores");
  const fonte = sobre.locator("a.fonte");
  await expect(fonte).toHaveAttribute("href", /\.gov\.br\//);
  await expect(fonte).toHaveAttribute("rel", "noopener noreferrer");

  await page.locator("#proximos .linha", { hasText: "Finados" }).click();
  await expect(sobre).toContainText("cemitérios");
});

test("sem sobre.js (cache misturado) a página segue, só sem o texto", async ({ page }) => {
  await page.route("**/sobre.js*", (r) => r.fulfill({ contentType: "text/javascript", body: "" }));
  const { erros } = await abrir(page);
  await expect(page.locator("#hnome")).toHaveText("Nossa Senhora Aparecida");
  await expect(page.locator("#hsobre")).toBeHidden();
  expect(erros).toEqual([]);
});
