(function () {
  "use strict";

  const F = window.Feriados;
  const $ = (id) => document.getElementById(id);

  // Arquivos de versões diferentes (cache logo após um deploy): avisar em vez de quebrar em silêncio.
  if (!F || !F.UFS || !window.Localizacao) {
    $("hnome").textContent = "página desatualizada";
    $("hmeta").textContent = "recarregue com Ctrl+Shift+R (ou Cmd+Shift+R no Mac).";
    return;
  }

  const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  const MESES_LONGOS = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const SEMANA = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
  const QTD_PROXIMOS = 6;
  const MAX_MARCAS = 150;
  const K_FAC = "feriados:facultativos";
  const K_TEMA = "feriados:tema";
  const K_UF = "feriados:uf";

  const state = {
    facultativos: ler(K_FAC) === "1",
    uf: Object.prototype.hasOwnProperty.call(F.UFS, ler(K_UF) || "") ? ler(K_UF) : null,
    tema: document.documentElement.dataset.theme === "dark" ? "escuro" : "claro", // definido por tema.js
    selecionado: null, // objeto do feriado; null = o próximo
    ano: null,
    dia: null,         // "hoje" usado no último render
    proximos: [],
    ultimo: null,      // último feriado antes de hoje
    alvoAnterior: null,
  };

  function ler(k) { try { return localStorage.getItem(k); } catch { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, v); } catch { /* modo privado etc. */ } }
  function apagar(k) { try { localStorage.removeItem(k); } catch { /* idem */ } }

  const reduzMovimento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const opcoes = () => ({ facultativos: state.facultativos, uf: state.uf });
  const mesmo = (a, b) => !!a && !!b && a.data === b.data && a.nome === b.nome;
  const pad = (n) => String(n).padStart(2, "0");
  const partes = (data) => data.split("-").map(Number);

  function el(tag, cls, texto) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function hojeIso() {
    const d = new Date();
    return F.iso(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  // Meia-noite no fuso de quem está vendo a página.
  function meiaNoiteLocal(data) {
    const [a, m, d] = partes(data);
    return new Date(a, m - 1, d).getTime();
  }

  // ["2026-12-28", "2026-12-29", "2027-01-04"] → "28 e 29 dez, 4 jan"
  function listaDatas(datas) {
    const grupos = [];
    for (const d of datas) {
      const [, m, dia] = partes(d);
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.m === m) ultimo.dias.push(dia);
      else grupos.push({ m, dias: [dia] });
    }
    const juntar = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}` : String(xs[0]));
    return grupos.map((g) => `${juntar(g.dias)} ${MESES[g.m - 1]}`).join(", ");
  }

  function folga(o) {
    const [, mi, di] = partes(o.inicio);
    const [, mf, df] = partes(o.fim);
    const nomes = [...new Set(o.feriados.map((f) => f.nome))].join(" + ");
    const n = o.ferias.length;

    const el = document.createElement("div");
    el.className = "linha folga revela";

    const total = el.appendChild(document.createElement("span"));
    total.className = "l-data";
    total.append(Object.assign(document.createElement("span"), { className: "l-dia", textContent: String(o.dias) }),
      Object.assign(document.createElement("span"), { className: "l-mes", textContent: "dias" }));

    const meio = el.appendChild(document.createElement("span"));
    meio.className = "l-meio";
    meio.append(
      Object.assign(document.createElement("span"), { className: "l-nome", textContent: nomes }),
      Object.assign(document.createElement("span"), {
        className: "l-sem",
        textContent: `${mi === mf ? di : `${di} ${MESES[mi - 1]}`} a ${df} ${MESES[mf - 1]} · férias em ${listaDatas(o.ferias)}`,
      })
    );

    el.append(Object.assign(document.createElement("span"), {
      className: "l-quando",
      textContent: `${n} dia${n > 1 ? "s" : ""} de férias`,
    }));
    return el;
  }

  function quando(dias) {
    if (dias === 0) return "hoje";
    if (dias === 1) return "amanhã";
    if (dias === -1) return "ontem";
    return dias > 0 ? `em ${dias} dias` : `há ${-dias} dias`;
  }

  function tagsDe(f) {
    const t = [];
    if (f.abrangencia === "estadual") t.push(el("span", "tag", `estadual · ${f.uf}`));
    if (f.tipo === "facultativo") t.push(el("span", "tag", f.obs ? `facultativo ${f.obs}` : "facultativo"));
    const c = F.classificar(f.data);
    if (c === "feriadão" || c === "ponte") t.push(el("span", "tag forte", c));
    else if (c === "fim de semana") t.push(el("span", "tag", "cai no fim de semana"));
    return t;
  }

  const alvo = () => state.selecionado || state.proximos[0];

  // ---------- listas ----------

  function linha(f, hoje, i) {
    const [, m, d] = partes(f.data);
    const dias = F.diasEntre(hoje, f.data);
    const ativa = mesmo(f, alvo());

    const b = el("button", "linha revela" + (f.tipo === "facultativo" ? " facultativo" : "") + (ativa ? " ativa" : ""));
    b.type = "button";
    b.disabled = dias < 0;
    b.setAttribute("aria-pressed", String(ativa));
    b.style.setProperty("--d", 7 + Math.min(i, 8));

    const data = el("span", "l-data");
    data.append(el("span", "l-dia", String(d)), el("span", "l-mes", MESES[m - 1]));

    const meio = el("span", "l-meio");
    meio.append(el("span", "l-nome", f.nome), ...tagsDe(f), el("span", "l-sem", SEMANA[F.diaDaSemana(f.data)]));

    b.append(data, meio, el("span", "l-quando", quando(dias)));
    b.addEventListener("click", () => {
      state.selecionado = f;
      render();
    });
    return b;
  }

  // ---------- folhinha ----------

  function arrancarFolha() {
    if (reduzMovimento()) return;
    const folha = $("folha");
    const copia = folha.cloneNode(true);
    copia.removeAttribute("id");
    copia.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    copia.classList.add("caindo");
    folha.parentNode.append(copia);
    copia
      .animate(
        [
          { transform: "none", opacity: 1 },
          { transform: "translateY(10px) rotateX(-18deg) rotate(4deg)", opacity: 1, offset: 0.3 },
          { transform: "translateY(130px) rotateX(-40deg) rotate(16deg)", opacity: 0 },
        ],
        { duration: 700, easing: "cubic-bezier(0.5, 0, 0.75, 0)", fill: "forwards" }
      )
      .finished.then(() => copia.remove(), () => copia.remove());
  }

  function preencherHeroi(f, hoje) {
    const [a, m, d] = partes(f.data);
    $("folha").classList.toggle("facultativo", f.tipo === "facultativo");
    $("f-mes").textContent = `${MESES[m - 1]} ${a}`;
    $("f-dia").textContent = String(d);
    $("f-sem").textContent = SEMANA[F.diaDaSemana(f.data)].split("-")[0];

    const escolhido = state.selecionado && !mesmo(state.selecionado, state.proximos[0]);
    $("hrotulo").textContent = f.data === hoje ? "hoje é feriado" : escolhido ? "selecionado" : "próximo feriado";
    $("voltar").hidden = !escolhido;

    $("hnome").textContent = f.nome;
    $("hmeta").replaceChildren(
      document.createTextNode(`${d} de ${MESES_LONGOS[m - 1]}, ${SEMANA[F.diaDaSemana(f.data)]}`),
      ...tagsDe(f)
    );
  }

  // Uma marca por dia entre o último feriado e o alvo: dá para "riscar" os dias.
  function renderMarcas(f, hoje, animar) {
    const box = $("marcas");
    const ult = state.ultimo;
    if (!ult) { box.replaceChildren(); return; }

    const total = F.diasEntre(ult.data, f.data);
    const passados = F.diasEntre(ult.data, hoje); // a marca i representa o dia ult+i+1
    box.className = "marcas" + (animar && !reduzMovimento() ? " anima" : "");

    if (total <= MAX_MARCAS) {
      const marcas = [];
      for (let i = 0; i < total; i++) {
        const mk = el("span", "marca");
        if (i === total - 1) mk.classList.add("alvo");
        else if (i === passados - 1) mk.classList.add("hoje");
        else if (i < passados - 1) mk.classList.add("feita");
        mk.style.animationDelay = Math.min(i * 7, 700) + "ms";
        marcas.push(mk);
      }
      box.replaceChildren(...marcas);
    } else {
      const barra = el("span", "barra");
      const fill = el("span", "barra-fill");
      fill.style.display = "block";
      fill.style.width = ((passados / total) * 100).toFixed(1) + "%";
      barra.append(fill);
      box.replaceChildren(barra);
    }

    const [, um, ud] = partes(ult.data);
    $("leg-desde").textContent = `desde ${ult.nome.toLowerCase()} (${ud} ${MESES[um - 1]})`;
    $("leg-conta").textContent = f.data === hoje ? "chegou" : `dia ${passados} de ${total}`;
  }

  // ---------- render: só quando algo muda (dia, seleção, filtro, ano) ----------

  function render() {
    const hoje = hojeIso();
    const primeiro = state.dia === null;
    state.dia = hoje;
    if (state.ano === null) state.ano = partes(hoje)[0];

    // Janela de ~1 ano em cada direção: sempre contém ao menos um 1º de janeiro.
    state.proximos = F.feriadosEntre(hoje, F.somaDias(hoje, 400), opcoes()).slice(0, QTD_PROXIMOS);
    const passados = F.feriadosEntre(F.somaDias(hoje, -400), F.somaDias(hoje, -1), opcoes());
    state.ultimo = passados[passados.length - 1] || null;

    const s = state.selecionado;
    const filtrado = (s && s.tipo === "facultativo" && !state.facultativos) || (s && s.uf && s.uf !== state.uf);
    if (s && (s.data < hoje || filtrado)) {
      state.selecionado = null;
    }

    $("proximos").replaceChildren(...state.proximos.map((f, i) => linha(f, hoje, i)));
    $("calendario").replaceChildren(...F.feriadosDoAno(state.ano, opcoes()).map((f, i) => linha(f, hoje, i)));
    const emendas = F.oportunidades(hoje, F.somaDias(hoje, 365), { uf: state.uf });
    $("folgas").replaceChildren(
      ...(emendas.length ? emendas.map(folga) : [Object.assign(document.createElement("p"), { className: "lista-vazia", textContent: "nenhuma emenda boa nos próximos 12 meses." })])
    );
    $("ano").textContent = state.ano;
    $("facultativos").checked = state.facultativos;

    const f = alvo();
    const mudou = !primeiro && !mesmo(state.alvoAnterior, f);
    if (mudou) arrancarFolha();
    preencherHeroi(f, hoje);
    renderMarcas(f, hoje, primeiro || mudou);
    state.alvoAnterior = f;

    const dias = F.diasEntre(hoje, f.data);
    document.title = `${dias === 0 ? "hoje" : dias + "d"} · ${f.nome} · Feriadou`;

    tick();
  }

  // ---------- contador: todo segundo, só mexe em texto ----------

  function setNum(id, valor) {
    const n = $(id);
    if (n.textContent === valor) return;
    const antes = n.textContent;
    n.textContent = valor;
    if (antes !== "--" && !reduzMovimento()) {
      n.animate(
        [{ transform: "translateY(-60%)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 360, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)" }
      );
    }
  }

  function tick() {
    const hoje = hojeIso();
    if (hoje !== state.dia) return render(); // virou o dia

    const f = alvo();
    const ehHoje = f.data === hoje;
    document.body.classList.toggle("is-today", ehHoje);
    if (ehHoje) return;

    const totalSec = Math.max(0, Math.floor((meiaNoiteLocal(f.data) - Date.now()) / 1000));
    setNum("days", pad(Math.floor(totalSec / 86400)));
    setNum("hours", pad(Math.floor((totalSec % 86400) / 3600)));
    setNum("mins", pad(Math.floor((totalSec % 3600) / 60)));
    setNum("secs", pad(totalSec % 60));
  }

  // ---------- tema ----------

  function aplicarTema() {
    const r = document.documentElement;
    const escuro = state.tema === "escuro";
    r.dataset.theme = escuro ? "dark" : "light";
    const proximo = escuro ? "claro" : "escuro";
    $("tema").setAttribute("aria-label", `mudar para tema ${proximo}`);
    $("tema").title = `tema ${proximo}`;

    const bg = getComputedStyle(r).getPropertyValue("--bg").trim();
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { m.content = bg; });
  }

  $("tema").addEventListener("click", () => {
    state.tema = state.tema === "escuro" ? "claro" : "escuro";
    gravar(K_TEMA, state.tema);
    if (document.startViewTransition && !reduzMovimento()) document.startViewTransition(aplicarTema);
    else aplicarTema();
  });

  // ---------- demais controles ----------

  $("facultativos").addEventListener("change", (e) => {
    state.facultativos = e.target.checked;
    gravar(K_FAC, state.facultativos ? "1" : "0");
    render();
  });

  $("voltar").addEventListener("click", () => {
    state.selecionado = null;
    render();
  });

  function mudarAno(delta) {
    const novo = Math.min(9999, Math.max(1583, state.ano + delta));
    if (novo === state.ano) return;
    state.ano = novo;
    render();
    if (!reduzMovimento()) {
      $("calendario").animate(
        [{ transform: `translateX(${delta * 16}px)`, opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 300, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
      );
    }
  }
  $("ano-ant").addEventListener("click", () => mudarAno(-1));
  $("ano-prox").addEventListener("click", () => mudarAno(1));

  $("ics").addEventListener("click", () => {
    const ics = F.paraIcs(F.feriadosDoAno(state.ano, opcoes()));
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = el("a");
    a.href = url;
    a.download = `feriados-${state.ano}${state.uf ? "-" + state.uf : ""}.ics`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // ---------- estado (UF) pela localização ----------

  let timerToast = null;
  function avisar(msg) {
    const t = $("geo-status");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(timerToast);
    timerToast = setTimeout(() => { t.hidden = true; }, 5000);
  }

  function mostrarUf() {
    $("local").classList.toggle("ativo", !!state.uf);
    $("geo-uf").textContent = state.uf || "";
    $("esquecer").hidden = !state.uf;
    $("geo").setAttribute(
      "aria-label",
      state.uf
        ? `estado: ${F.UFS[state.uf]}. toque para atualizar pela localização`
        : "usar minha localização para incluir os feriados do meu estado"
    );
  }

  function definirUf(uf) {
    state.uf = uf || null;
    if (state.uf) gravar(K_UF, state.uf);
    else apagar(K_UF);
    mostrarUf();
    render();
  }

  $("esquecer").addEventListener("click", () => {
    definirUf(null);
    avisar("estado apagado deste navegador. mostrando só os feriados nacionais.");
  });

  // Os contornos das UFs (~70 KB) só são baixados se a pessoa pedir a localização.
  function carregarMapa() {
    if (window.UFS_GEO) return Promise.resolve();
    return new Promise((ok, falha) => {
      const s = document.createElement("script");
      s.src = "ufs-geo.js?v=416dd7dd";
      s.onload = ok;
      s.onerror = () => falha(new Error("mapa"));
      document.head.append(s);
    });
  }

  function pedirPosicao() {
    return new Promise((ok, falha) =>
      navigator.geolocation.getCurrentPosition(ok, falha, {
        enableHighAccuracy: false, // precisão de estado basta; poupa bateria e é menos invasivo
        timeout: 15000,
        maximumAge: 60 * 60 * 1000,
      })
    );
  }

  $("geo").addEventListener("click", async () => {
    if (!("geolocation" in navigator) || !window.isSecureContext) {
      avisar("este navegador não oferece localização aqui.");
      return;
    }
    const local = $("local");
    if (local.classList.contains("buscando")) return;
    local.classList.add("buscando");
    try {
      const [pos] = await Promise.all([pedirPosicao(), carregarMapa()]);
      // A coordenada vive só nesta função: vira sigla e é descartada.
      const uf = window.Localizacao.ufDoPonto(pos.coords.latitude, pos.coords.longitude, window.UFS_GEO);
      if (!uf) {
        avisar("parece que você está fora do Brasil. mostrando só os feriados nacionais.");
        return;
      }
      definirUf(uf);
      avisar(`${F.UFS[uf]}: feriados estaduais incluídos. só a sigla fica salva neste navegador.`);
    } catch (e) {
      const porCodigo = {
        1: "permissão negada. para liberar, use o ícone de cadeado ao lado do endereço.",
        2: "não foi possível obter a localização agora.",
        3: "a localização demorou demais. tente de novo.",
      };
      avisar(porCodigo[e && e.code] || "não deu para descobrir o estado.");
    } finally {
      local.classList.remove("buscando");
    }
  });

  mostrarUf();

  aplicarTema();
  render();
  setInterval(tick, 1000);
  setTimeout(() => document.body.classList.remove("entrando"), 1800);
})();
