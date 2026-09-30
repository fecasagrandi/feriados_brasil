try {
  var t = localStorage.getItem("feriados:tema");
  if (t === "claro") document.documentElement.dataset.theme = "light";
  if (t === "escuro") document.documentElement.dataset.theme = "dark";
} catch (e) {}
