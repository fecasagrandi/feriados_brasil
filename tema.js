// Aplica o tema antes do primeiro paint (evita piscar).
// Sempre explícito: o salvo pela pessoa ou, na primeira visita, o do sistema.
(function () {
  var t = null;
  try { t = localStorage.getItem("feriados:tema"); } catch (e) {}
  if (t !== "claro" && t !== "escuro") {
    t = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
  }
  document.documentElement.dataset.theme = t === "escuro" ? "dark" : "light";
  // Esconde a parte calculada até o app.js preencher (evita a página pular). Ver estilo.css.
  document.documentElement.classList.add("carregando");
})();
