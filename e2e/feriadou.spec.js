// Cada teste aqui corresponde a algo que já quebrou ou a uma promessa feita na página.
const { test, expect } = require("@playwright/test");

const ORIGEM = "http://localhost:4173/";

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
