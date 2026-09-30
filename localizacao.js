/*
 * Descobre a UF de uma coordenada, 100% no navegador: nenhuma coordenada sai do aparelho.
 *
 * Point-in-polygon por ray casting sobre os contornos de ufs-geo.js.
 * Contornos são simplificados (~1 km), então perto de divisas o resultado
 * pode errar — por isso a interface sempre mostra a UF detectada e deixa trocar.
 */
(function (root) {
  "use strict";

  // Ray casting: conta quantas arestas um raio horizontal a partir do ponto cruza.
  function dentroDoAnel(x, y, anel) {
    let dentro = false;
    for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
      const [xi, yi] = anel[i];
      const [xj, yj] = anel[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
    }
    return dentro;
  }

  // GeoJSON: primeiro anel é o contorno, os demais são buracos.
  function dentroDoPoligono(x, y, aneis) {
    if (!dentroDoAnel(x, y, aneis[0])) return false;
    for (let k = 1; k < aneis.length; k++) if (dentroDoAnel(x, y, aneis[k])) return false;
    return true;
  }

  // Distância (em graus, aproximação plana) do ponto ao segmento a-b.
  function distSeg(x, y, [x1, y1], [x2, y2]) {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2)) : 0;
    return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
  }

  // Até ~20 km da borda ainda conta: a simplificação "empurra" parte da costa para o mar.
  const RAIO_COSTA = 0.2;

  function ufDoPonto(lat, lng, geo) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    for (const uf in geo) {
      for (const aneis of geo[uf]) {
        if (dentroDoPoligono(lng, lat, aneis)) return uf;
      }
    }

    let melhor = null, menor = RAIO_COSTA;
    for (const uf in geo) {
      for (const aneis of geo[uf]) {
        const anel = aneis[0];
        for (let i = 1; i < anel.length; i++) {
          const d = distSeg(lng, lat, anel[i - 1], anel[i]);
          if (d < menor) { menor = d; melhor = uf; }
        }
      }
    }
    return melhor; // null = fora do Brasil
  }

  const api = { ufDoPonto };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Localizacao = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
