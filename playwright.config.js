// Testes de ponta a ponta: a página de verdade, num Chromium de verdade.
// Localmente, PLAYWRIGHT_CHROMIUM_PATH permite usar um Chromium já instalado.
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "node scripts/servidor.js 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
