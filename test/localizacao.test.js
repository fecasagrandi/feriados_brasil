const test = require("node:test");
const assert = require("node:assert/strict");
const { ufDoPonto } = require("../localizacao.js");
const GEO = require("../ufs-geo.js");

// [lat, lng] aproximados do centro de cada capital.
const CAPITAIS = {
  AC: [-9.975, -67.81], AL: [-9.666, -35.735], AP: [0.035, -51.07], AM: [-3.119, -60.022],
  BA: [-12.971, -38.501], CE: [-3.732, -38.527], DF: [-15.794, -47.882], ES: [-20.315, -40.312],
  GO: [-16.686, -49.265], MA: [-2.53, -44.302], MT: [-15.601, -56.097], MS: [-20.469, -54.62],
  MG: [-19.917, -43.935], PA: [-1.456, -48.502], PB: [-7.119, -34.845], PR: [-25.428, -49.273],
  PE: [-8.047, -34.877], PI: [-5.089, -42.802], RJ: [-22.907, -43.173], RN: [-5.795, -35.209],
  RS: [-30.035, -51.218], RO: [-8.762, -63.9], RR: [2.82, -60.672], SC: [-27.595, -48.548],
  SP: [-23.551, -46.633], SE: [-10.947, -37.073], TO: [-10.184, -48.334],
};

test("todas as 27 capitais caem na própria UF (inclusive capitais em ilha)", () => {
  assert.equal(Object.keys(GEO).length, 27);
  for (const [uf, [lat, lng]] of Object.entries(CAPITAIS)) {
    assert.equal(ufDoPonto(lat, lng, GEO), uf, uf);
  }
});

test("cidades de divisa separadas por rio: Petrolina (PE) e Juazeiro (BA)", () => {
  assert.equal(ufDoPonto(-9.3889, -40.5027, GEO), "PE");
  assert.equal(ufDoPonto(-9.4297, -40.5089, GEO), "BA");
});

test("Fernando de Noronha é PE (ilha oceânica)", () => {
  assert.equal(ufDoPonto(-3.854, -32.424, GEO), "PE");
});

test("fora do Brasil retorna null", () => {
  assert.equal(ufDoPonto(38.72, -9.14, GEO), null); // Lisboa
  assert.equal(ufDoPonto(-34.6, -58.38, GEO), null); // Buenos Aires
  assert.equal(ufDoPonto(-34.9, -56.16, GEO), null); // Montevidéu
});

test("coordenada inválida retorna null", () => {
  assert.equal(ufDoPonto(NaN, -46, GEO), null);
  assert.equal(ufDoPonto(undefined, undefined, GEO), null);
});
