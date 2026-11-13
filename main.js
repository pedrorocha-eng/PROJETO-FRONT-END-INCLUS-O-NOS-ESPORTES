/* ==========================================================================
   Esportes sem Limites — JavaScript principal (sem frameworks, sem dependências)
   Módulos: Store (localStorage) · Preferências de acessibilidade · Menu ·
            Busca no site · Validação de formulários · Rascunho automático ·
            Newsletter · Módulos por página (data-page no <body>)
   ========================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Store: wrapper seguro para localStorage ---------- */
  const Store = {
    prefix: "esl:",
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(this.prefix + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(this.prefix + key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    },
    remove(key) { try { localStorage.removeItem(this.prefix + key); } catch (e) { /* sem storage */ } }
  };
  window.MTStore = Store;

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- Toast acessível (role=status) ---------- */
  let toastTimer;
  function toast(message) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); el.hidden = true;
      document.body.appendChild(el);
    }
    el.textContent = message; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 4500);
  }
  window.MTToast = toast;

  /* ---------- 1. Preferências de acessibilidade (persistidas) ---------- */
  const root = document.documentElement;
  const defaults = { scale: 1, theme: "auto", contrast: "normal", readable: "off", motion: "on" };
  let prefs = Object.assign({}, defaults, Store.get("prefs", {}));

  function applyPrefs() {
    root.style.setProperty("--font-scale", prefs.scale);
    if (prefs.theme === "auto") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", prefs.theme);
    root.setAttribute("data-contrast", prefs.contrast);
    root.setAttribute("data-readable", prefs.readable);
    root.setAttribute("data-motion", prefs.motion);
    const set = (id, on) => { const b = $(id); if (b) b.setAttribute("aria-pressed", String(on)); };
    set("#a11y-contrast", prefs.contrast === "high");
    set("#a11y-dark", prefs.theme === "light");
    set("#a11y-readable", prefs.readable === "on");
    set("#a11y-motion", prefs.motion === "off");
  }
  function savePrefs(msg) { Store.set("prefs", prefs); applyPrefs(); if (msg) toast(msg); }
  applyPrefs();

  const a11yActions = {
    "a11y-font-up": () => { prefs.scale = Math.min(1.5, +(prefs.scale + 0.125).toFixed(3)); savePrefs("Fonte aumentada para " + Math.round(prefs.scale * 100) + "%"); },
    "a11y-font-down": () => { prefs.scale = Math.max(0.875, +(prefs.scale - 0.125).toFixed(3)); savePrefs("Fonte reduzida para " + Math.round(prefs.scale * 100) + "%"); },
    "a11y-contrast": () => { prefs.contrast = prefs.contrast === "high" ? "normal" : "high"; savePrefs(prefs.contrast === "high" ? "Alto contraste ativado" : "Alto contraste desativado"); },
    "a11y-dark": () => { prefs.theme = prefs.theme === "light" ? "auto" : "light"; savePrefs(prefs.theme === "light" ? "Modo claro ativado" : "Modo escuro ativado"); },
    "a11y-readable": () => { prefs.readable = prefs.readable === "on" ? "off" : "on"; savePrefs(prefs.readable === "on" ? "Espaçamento de leitura ampliado" : "Espaçamento padrão"); },
    "a11y-motion": () => { prefs.motion = prefs.motion === "off" ? "on" : "off"; savePrefs(prefs.motion === "off" ? "Animações pausadas" : "Animações reativadas"); },
    "a11y-reset": () => { prefs = Object.assign({}, defaults); savePrefs("Preferências de acessibilidade restauradas"); }
  };
  Object.keys(a11yActions).forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", a11yActions[id]);
  });

  /* ---------- 2. Menu responsivo (painel de tela cheia no mobile) ---------- */
  const toggle = $(".nav__toggle");
  const panel = $("#painel-menu");
  const mq = window.matchMedia("(max-width: 1080px)");
  if (toggle && panel) {
    const label = $(".nav__toggle-label", toggle);
    const header = $(".site-header");
    // Tudo que fica "atrás" do menu aberto deixa de ser alcançável (teclado e leitor de tela)
    const behind = () => $$("body > *:not(.site-header):not(script):not(.skip-link)");
    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
    const setOpen = (open, opts) => {
      opts = opts || {};
      toggle.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "Fechar" : "Menu";
      panel.dataset.open = String(open);
      document.body.classList.toggle("menu-open", open && mq.matches);
      behind().forEach((el) => { el.inert = open && mq.matches; });
      if (open) {
        document.documentElement.style.setProperty("--header-h", header.getBoundingClientRect().height + "px");
        const current = $('a[aria-current="page"]', panel) || $("a", panel);
        if (current && !opts.silent) current.focus();
      } else if (opts.returnFocus) toggle.focus();
    };
    setOpen(false, { silent: true });
    toggle.addEventListener("click", () => setOpen(!isOpen()));
    // Fecha ao escolher um link (inclusive âncoras da mesma página)
    $$("a", panel).forEach((a) => a.addEventListener("click", () => { if (mq.matches) setOpen(false); }));
    document.addEventListener("keydown", (e) => {
      if (!isOpen() || !mq.matches) return;
      if (e.key === "Escape") { setOpen(false, { returnFocus: true }); return; }
      if (e.key === "Tab") { // mantém o foco dentro do cabeçalho enquanto o menu está aberto
        const f = $$("a[href], button:not([disabled]), input", header).filter((el) => el.offsetParent !== null);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // Ao girar a tela / redimensionar para desktop, garante estado limpo
    const onChange = () => { if (!mq.matches) setOpen(false, { silent: true }); };
    if (mq.addEventListener) mq.addEventListener("change", onChange); else mq.addListener(onChange);
  }

  /* ---------- 2.1 Painel de acessibilidade (mobile) ---------- */
  const a11yToggle = $(".a11y-toggle");
  const a11yTools = $("#a11y-tools");
  if (a11yToggle && a11yTools) {
    const setA11y = (open) => {
      a11yToggle.setAttribute("aria-expanded", String(open));
      a11yTools.dataset.open = String(open || !mq.matches);
    };
    setA11y(false);
    a11yToggle.addEventListener("click", () => setA11y(a11yToggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("click", (e) => {
      if (mq.matches && a11yToggle.getAttribute("aria-expanded") === "true" && !e.target.closest(".a11y-group")) setA11y(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && a11yToggle.getAttribute("aria-expanded") === "true") { setA11y(false); a11yToggle.focus(); }
    });
    const onA11yChange = () => setA11y(false);
    if (mq.addEventListener) mq.addEventListener("change", onA11yChange); else mq.addListener(onA11yChange);
  }

  /* ---------- 3. Busca no site (índice local) ---------- */
  const SITE_INDEX = [
    { url: "index.html", title: "Início", text: "inclusão esporte pessoas com deficiência ong esportes sem limites números" },
    { url: "sobre.html", title: "Sobre a ONG", text: "missão visão valores equipe história transparência" },
    { url: "modalidades.html", title: "Modalidades adaptadas", text: "goalball bocha basquete cadeira de rodas vôlei sentado natação atletismo futebol de cegos parabadminton judô tênis de mesa" },
    { url: "paradesporto.html", title: "Paradesporto: história e classificação", text: "paralimpíadas guttmann stoke mandeville classificação funcional classes t11 s14 lei brasileira de inclusão" },
    { url: "eventos.html", title: "Agenda de eventos", text: "eventos oficinas festival torneio calendário inscrição" },
    { url: "participe.html", title: "Participe: atleta ou voluntário", text: "inscrição voluntário atleta formulário cadastro" },
    { url: "doe.html", title: "Doe", text: "doação pix equipamentos cadeira esportiva transparência" },
    { url: "impacto.html", title: "Impacto social e ODS", text: "ods agenda 2030 sustentabilidade impacto social saúde educação desigualdade" },
    { url: "assistente.html", title: "Assistente IA", text: "inteligência artificial chat dúvidas recomendação modalidade" },
    { url: "contato.html", title: "Contato e acessibilidade", text: "contato faq perguntas frequentes endereço declaração de acessibilidade" }
  ];
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const searchInput = $("#busca-site");
  const searchResults = $("#busca-resultados");
  if (searchInput && searchResults) {
    const render = () => {
      const q = norm(searchInput.value.trim());
      searchResults.innerHTML = "";
      const status = $("#busca-status");
      if (q.length < 2) { searchResults.hidden = true; if (status) status.textContent = ""; return; }
      const hits = SITE_INDEX.filter((p) => norm(p.title + " " + p.text).includes(q));
      const items = hits.length ? hits : [{ url: "assistente.html?q=" + encodeURIComponent(searchInput.value.trim()), title: "Perguntar à Assistente IA", text: "Nenhuma página encontrada — tente a assistente" }];
      items.forEach((p) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = p.url; a.textContent = p.title;
        const small = document.createElement("small"); small.textContent = p.text.split(" ").slice(0, 6).join(" ") + "…";
        a.appendChild(small); li.appendChild(a); searchResults.appendChild(li);
      });
      searchResults.hidden = false;
      if (status) status.textContent = hits.length + " página(s) encontrada(s). Use a seta para baixo para navegar.";
    };
    searchInput.addEventListener("input", render);
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { searchInput.value = ""; render(); }
      if (e.key === "ArrowDown") { const first = $("a", searchResults); if (first) { e.preventDefault(); first.focus(); } }
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".search")) searchResults.hidden = true; });
    $("#form-busca").addEventListener("submit", (e) => {
      e.preventDefault();
      const first = $("a", searchResults);
      if (first) window.location.href = first.getAttribute("href");
    });
  }

  /* ---------- 4. Validação de formulários (WCAG 3.3.1 / 3.3.3) ---------- */
  const validators = {
    required: (v, el) => {
      if (el.type === "checkbox") return el.checked || "Este campo é obrigatório.";
      return v.trim() !== "" || "Preencha este campo.";
    },
    email: (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Informe um e-mail válido, como nome@exemplo.com.",
    phone: (v) => v === "" || v.replace(/\D/g, "").length >= 10 || "Informe o telefone com DDD (10 ou 11 dígitos).",
    minlen: (v, el) => v === "" || v.trim().length >= +el.dataset.minlen || "Use pelo menos " + el.dataset.minlen + " caracteres.",
    name: (v) => v === "" || /^[A-Za-zÀ-ÿ'\s-]{3,}$/.test(v.trim()) && v.trim().includes(" ") || "Informe nome e sobrenome.",
    age: (v, el) => {
      if (!v) return true;
      const birth = new Date(v + "T00:00:00");
      if (isNaN(birth)) return "Data inválida.";
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      if (birth > today) return "A data não pode estar no futuro.";
      const min = +(el.dataset.minAge || 0);
      return age >= min || "É necessário ter pelo menos " + min + " anos (menores devem ser inscritos pelo responsável).";
    },
    amount: (v) => v === "" || (+v.replace(",", ".") >= 5) || "O valor mínimo é R$ 5,00."
  };

  function fieldWrapper(el) { return el.closest(".field") || el.parentElement; }
  function errorEl(el) {
    const id = (el.name || el.id) + "-erro";
    let err = document.getElementById(id);
    if (!err) {
      err = document.createElement("p");
      err.id = id; err.className = "error-msg";
      fieldWrapper(el).appendChild(err);
    }
    const describedby = (el.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
    if (!describedby.includes(id)) { describedby.push(id); el.setAttribute("aria-describedby", describedby.join(" ")); }
    return err;
  }
  function validateField(el) {
    const rules = (el.dataset.validate || "").split(" ").filter(Boolean);
    if (el.required && !rules.includes("required")) rules.unshift("required");
    let message = "";
    // grupo de radio obrigatório
    if (el.type === "radio") {
      const group = $$('input[name="' + el.name + '"]', el.form);
      if (group.some((r) => r.required) && !group.some((r) => r.checked)) message = "Escolha uma opção.";
    } else {
      for (const rule of rules) {
        if (!validators[rule]) continue;
        const r = validators[rule](el.value || "", el);
        if (r !== true) { message = r; break; }
      }
    }
    const err = errorEl(el);
    err.textContent = message;
    el.setAttribute("aria-invalid", message ? "true" : "false");
    fieldWrapper(el).classList.toggle("field--error", !!message);
    return !message;
  }
  function validateForm(form) {
    const seenRadio = new Set();
    const fields = $$("input, select, textarea", form).filter((el) => {
      if (el.type === "submit" || el.type === "button" || el.type === "hidden" || el.disabled) return false;
      if (!(el.required || el.dataset.validate)) return false;
      if (el.type === "radio") { if (seenRadio.has(el.name)) return false; seenRadio.add(el.name); }
      return true;
    });
    const invalid = fields.filter((el) => !validateField(el));
    const summary = $(".form-summary", form);
    if (summary) {
      const list = $("ul", summary);
      list.innerHTML = "";
      invalid.forEach((el) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        const legend = el.closest("fieldset") ? el.closest("fieldset").querySelector("legend") : null;
        const label = (el.type === "radio" || el.type === "checkbox") && legend ? legend : (form.querySelector('label[for="' + el.id + '"]') || legend);
        a.href = "#" + el.id;
        a.textContent = (label ? label.textContent.replace(/\*/g, "").replace(/\s+/g, " ").trim() : el.name) + ": " + document.getElementById((el.name || el.id) + "-erro").textContent;
        a.addEventListener("click", (e) => { e.preventDefault(); el.focus(); });
        li.appendChild(a); list.appendChild(li);
      });
      summary.hidden = invalid.length === 0;
      if (invalid.length) { summary.focus(); }
    } else if (invalid.length) { invalid[0].focus(); }
    return invalid.length === 0;
  }
  window.MTValidate = validateForm;

  $$("form[data-validate-form]").forEach((form) => {
    form.setAttribute("novalidate", "");
    // valida ao sair do campo (blur) e corrige em tempo real após o 1º erro
    form.addEventListener("focusout", (e) => {
      const el = e.target;
      if ((el.required || el.dataset.validate) && el.type !== "radio" && el.value !== "") validateField(el);
    });
    form.addEventListener("input", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true") validateField(e.target);
    });
    form.addEventListener("change", (e) => { if (e.target.type === "radio" || e.target.type === "checkbox") validateField(e.target); });
  });

  /* Máscara simples de telefone */
  $$('input[data-mask="phone"]').forEach((el) => {
    el.addEventListener("input", () => {
      const d = el.value.replace(/\D/g, "").slice(0, 11);
      let out = d;
      if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) out = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
      el.value = out;
    });
  });

  /* Contador de caracteres */
  $$("textarea[maxlength]").forEach((ta) => {
    const counter = document.getElementById(ta.id + "-contador");
    if (!counter) return;
    const update = () => { counter.textContent = ta.value.length + " de " + ta.maxLength + " caracteres"; };
    ta.addEventListener("input", update); update();
  });

  /* ---------- 5. Rascunho automático (localStorage) ---------- */
  $$("form[data-autosave]").forEach((form) => {
    const key = "draft:" + form.dataset.autosave;
    const draft = Store.get(key, null);
    const status = $(".draft-status", form);
    if (draft) {
      Object.keys(draft).forEach((name) => {
        const els = $$('[name="' + name + '"]', form);
        els.forEach((el) => {
          if (el.type === "checkbox") el.checked = Array.isArray(draft[name]) ? draft[name].includes(el.value) : !!draft[name];
          else if (el.type === "radio") el.checked = el.value === draft[name];
          else el.value = draft[name];
        });
      });
      if (status) status.textContent = "Rascunho recuperado deste navegador.";
      form.dispatchEvent(new Event("draft-restored"));
    }
    let t;
    form.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const data = {};
        $$("input, select, textarea", form).forEach((el) => {
          if (!el.name || el.type === "submit" || el.dataset.noSave !== undefined) return;
          if (el.type === "checkbox") {
            const group = $$('input[type="checkbox"][name="' + el.name + '"]', form);
            data[el.name] = group.length > 1 ? group.filter((c) => c.checked).map((c) => c.value) : el.checked;
          } else if (el.type === "radio") { if (el.checked) data[el.name] = el.value; }
          else data[el.name] = el.value;
        });
        Store.set(key, data);
        if (status) status.textContent = "Rascunho salvo automaticamente às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + ".";
      }, 400);
    });
    form.addEventListener("reset", () => { Store.remove(key); if (status) status.textContent = "Rascunho apagado."; });
  });

  /* ---------- 6. Newsletter do rodapé ---------- */
  const news = $("#form-newsletter");
  if (news) {
    news.setAttribute("novalidate", "");
    const msg = $("#newsletter-msg");
    if (Store.get("newsletter", null)) msg.textContent = "Você já está inscrito(a) com " + Store.get("newsletter").email + ".";
    news.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#newsletter-email");
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      input.setAttribute("aria-invalid", String(!ok));
      if (!ok) { msg.textContent = "⚠ Informe um e-mail válido."; input.focus(); return; }
      Store.set("newsletter", { email: input.value.trim(), date: new Date().toISOString() });
      msg.textContent = "Inscrição confirmada! Você receberá a agenda mensal de eventos inclusivos.";
      news.reset();
    });
  }

  /* ---------- 7. Ano atual no rodapé ---------- */
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ======================= MÓDULOS POR PÁGINA ======================= */
  const page = document.body.dataset.page;

  /* --- Início: contadores animados --- */
  function countUp() {
    const els = $$("[data-count]");
    if (!els.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || prefs.motion === "off";
    const fmt = (n, el) => (el.dataset.prefix || "") + Math.round(n).toLocaleString("pt-BR") + (el.dataset.suffix || "");
    const run = (el) => {
      const target = +el.dataset.count;
      if (reduce) { el.textContent = fmt(target, el); return; }
      const start = performance.now(), dur = 1200;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)), el);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
      }, { threshold: 0.4 });
      els.forEach((el) => io.observe(el));
    } else els.forEach(run);
  }
  countUp();

  /* --- Filtros genéricos (modalidades e eventos) --- */
  function setupFilter(opts) {
    const items = $$(opts.items);
    const chips = $$(opts.chips);
    const search = opts.search ? $(opts.search) : null;
    const counter = $(opts.counter);
    const empty = $(opts.empty);
    let active = Store.get(opts.storeKey, "todos");
    if (!chips.some((c) => c.dataset.filter === active)) active = "todos";
    const apply = () => {
      const q = search ? norm(search.value.trim()) : "";
      let visible = 0;
      items.forEach((it) => {
        const tags = (it.dataset.tags || "").split(" ");
        const okTag = active === "todos" || tags.includes(active);
        const okText = !q || norm(it.textContent).includes(q);
        const show = okTag && okText;
        it.hidden = !show;
        if (show) visible++;
      });
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === active)));
      if (counter) counter.textContent = visible + (visible === 1 ? " resultado encontrado" : " resultados encontrados");
      if (empty) empty.hidden = visible !== 0;
    };
    chips.forEach((c) => c.addEventListener("click", () => { active = c.dataset.filter; Store.set(opts.storeKey, active); apply(); }));
    if (search) search.addEventListener("input", apply);
    apply();
  }

  if (page === "modalidades") {
    setupFilter({ items: "[data-modalidade]", chips: "[data-filter]", search: "#busca-modalidade", counter: "#contador-modalidades", empty: "#sem-modalidades", storeKey: "filtro-modalidades" });
    // Favoritar modalidades
    const favs = new Set(Store.get("modalidades-favoritas", []));
    const favCount = $("#total-favoritas");
    const updateFavs = () => { if (favCount) favCount.textContent = favs.size; };
    $$("[data-fav]").forEach((btn) => {
      const id = btn.dataset.fav;
      const name = btn.dataset.name;
      const sync = () => {
        const on = favs.has(id);
        btn.setAttribute("aria-pressed", String(on));
        btn.textContent = on ? "Salva ✓" : "Salvar";
        btn.setAttribute("aria-label", (on ? "Remover " : "Salvar ") + name + (on ? " das favoritas" : " nas favoritas"));
      };
      sync();
      btn.addEventListener("click", () => {
        favs.has(id) ? favs.delete(id) : favs.add(id);
        Store.set("modalidades-favoritas", Array.from(favs));
        sync(); updateFavs();
        toast(favs.has(id) ? name + " salva nas suas favoritas." : name + " removida das favoritas.");
      });
    });
    updateFavs();
  }

  if (page === "eventos") {
    setupFilter({ items: "[data-evento]", chips: "[data-filter]", counter: "#contador-eventos", empty: "#sem-eventos", storeKey: "filtro-eventos" });
    const saved = Store.get("eventos-salvos", {});
    const list = $("#minha-agenda");
    const emptyAgenda = $("#agenda-vazia");
    const renderAgenda = () => {
      list.innerHTML = "";
      const ids = Object.keys(saved);
      emptyAgenda.hidden = ids.length > 0;
      ids.forEach((id) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.innerHTML = "<strong></strong><br><small class='muted'></small>";
        span.querySelector("strong").textContent = saved[id].title;
        span.querySelector("small").textContent = saved[id].date;
        const rm = document.createElement("button");
        rm.type = "button"; rm.className = "btn btn--outline btn--sm"; rm.textContent = "Remover";
        rm.setAttribute("aria-label", "Remover " + saved[id].title + " da minha agenda");
        rm.addEventListener("click", () => { delete saved[id]; Store.set("eventos-salvos", saved); renderAgenda(); syncButtons(); toast("Evento removido da sua agenda."); });
        li.append(span, rm); list.appendChild(li);
      });
    };
    const syncButtons = () => $$("[data-save-event]").forEach((b) => {
      const on = !!saved[b.dataset.saveEvent];
      b.setAttribute("aria-pressed", String(on));
      b.textContent = on ? "Na minha agenda ✓" : "Tenho interesse";
    });
    $$("[data-save-event]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.saveEvent;
      if (saved[id]) delete saved[id];
      else saved[id] = { title: b.dataset.title, date: b.dataset.date };
      Store.set("eventos-salvos", saved);
      syncButtons(); renderAgenda();
      toast(saved[id] ? "“" + b.dataset.title + "” adicionado à sua agenda." : "Evento removido da sua agenda.");
    }));
    syncButtons(); renderAgenda();
  }

  /* --- Participe: inscrição de atleta / voluntário --- */
  if (page === "participe") {
    const form = $("#form-inscricao");
    const perfil = () => (form.querySelector('input[name="perfil"]:checked') || {}).value;
    const blocoAtleta = $("#bloco-atleta");
    const blocoVol = $("#bloco-voluntario");
    const syncPerfil = () => {
      const p = perfil();
      blocoAtleta.hidden = p !== "atleta";
      blocoVol.hidden = p !== "voluntario";
      $$("[data-required-when]", form).forEach((el) => {
        const on = el.dataset.requiredWhen === p;
        el.required = on;
        if (!on) { el.setAttribute("aria-invalid", "false"); const err = document.getElementById(el.name + "-erro"); if (err) err.textContent = ""; fieldWrapper(el).classList.remove("field--error"); }
      });
    };
    $$('input[name="perfil"]', form).forEach((r) => r.addEventListener("change", syncPerfil));
    form.addEventListener("draft-restored", syncPerfil);
    syncPerfil();

    const renderInscricoes = () => {
      const all = Store.get("inscricoes", []);
      const box = $("#minhas-inscricoes");
      const list = $("ul", box);
      list.innerHTML = "";
      box.hidden = all.length === 0;
      all.forEach((i) => {
        const li = document.createElement("li");
        li.textContent = i.protocolo + " — " + (i.perfil === "atleta" ? "Atleta" : "Voluntário(a)") + " — " + i.nome + " (" + new Date(i.data).toLocaleDateString("pt-BR") + ")";
        list.appendChild(li);
      });
    };
    renderInscricoes();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const fd = new FormData(form);
      const protocolo = "MT-" + Date.now().toString(36).toUpperCase().slice(-6);
      const registro = {
        protocolo, perfil: fd.get("perfil"), nome: fd.get("nome"), email: fd.get("email"),
        modalidade: fd.get("modalidade") || "", disponibilidade: fd.getAll("disponibilidade"), data: new Date().toISOString()
      };
      const all = Store.get("inscricoes", []); all.push(registro); Store.set("inscricoes", all);
      Store.remove("draft:inscricao");
      const res = $("#resultado-inscricao");
      $("#protocolo", res).textContent = protocolo;
      $("#resultado-nome", res).textContent = registro.nome.split(" ")[0];
      res.hidden = false; res.focus();
      form.reset(); syncPerfil(); renderInscricoes();
      const st = $(".draft-status", form); if (st) st.textContent = "";
    });
  }

  /* --- Doe: simulador de doação --- */
  if (page === "doe") {
    const form = $("#form-doacao");
    const outro = $("#valor-outro");
    const impacto = $("#impacto-doacao");
    const tabela = [
      [500, "mantém uma turma de bocha adaptada por um mês inteiro"],
      [200, "garante transporte acessível para 10 atletas irem a uma competição"],
      [100, "compra uma bola de goalball com guizo oficial"],
      [50, "cobre o lanche de uma turma após o treino"],
      [20, "paga a manutenção de uma cadeira esportiva por uma semana"],
      [5, "ajuda a imprimir materiais em braille e fonte ampliada"]
    ];
    const valorAtual = () => {
      const r = form.querySelector('input[name="valor"]:checked');
      if (r && r.value !== "outro") return +r.value;
      return +(outro.value || "0").replace(",", ".");
    };
    const updateImpacto = () => {
      const v = valorAtual();
      const item = tabela.find((t) => v >= t[0]);
      impacto.textContent = item ? "Com R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) + " você " + item[1] + "." : "Escolha um valor para ver o impacto da sua doação.";
    };
    $$('input[name="valor"]', form).forEach((r) => r.addEventListener("change", () => {
      const isOutro = r.value === "outro" && r.checked;
      outro.disabled = !isOutro;
      if (isOutro) outro.focus();
      updateImpacto();
    }));
    outro.addEventListener("input", updateImpacto);
    updateImpacto();

    const renderHistorico = () => {
      const h = Store.get("doacoes", []);
      const box = $("#historico-doacoes");
      $("ul", box).innerHTML = "";
      box.hidden = h.length === 0;
      let total = 0;
      h.forEach((d) => {
        total += d.valor;
        const li = document.createElement("li");
        li.innerHTML = "<span></span><strong></strong>";
        li.firstChild.textContent = new Date(d.data).toLocaleDateString("pt-BR") + " · " + (d.tipo === "mensal" ? "Mensal" : "Única") + " · " + d.destino;
        li.lastChild.textContent = d.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        $("ul", box).appendChild(li);
      });
      $("#total-doado").textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };
    renderHistorico();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (outro.disabled) outro.removeAttribute("data-validate"); else outro.setAttribute("data-validate", "required amount");
      if (!validateForm(form)) return;
      const v = valorAtual();
      if (!v || v < 5) { toast("O valor mínimo é R$ 5,00."); return; }
      const h = Store.get("doacoes", []);
      h.push({ valor: v, tipo: form.querySelector('input[name="tipo"]:checked').value, destino: $("#destino").selectedOptions[0].text, data: new Date().toISOString() });
      Store.set("doacoes", h);
      renderHistorico();
      const res = $("#resultado-doacao");
      $("#resultado-valor").textContent = v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      res.hidden = false; res.focus();
    });
  }

  /* --- Contato: busca no FAQ + formulário --- */
  if (page === "contato") {
    const faqSearch = $("#busca-faq");
    const items = $$(".accordion details");
    const vazio = $("#faq-vazio");
    faqSearch.addEventListener("input", () => {
      const q = norm(faqSearch.value.trim());
      let n = 0;
      items.forEach((d) => {
        const show = !q || norm(d.textContent).includes(q);
        d.hidden = !show; if (show) n++;
        if (q && show) d.open = true;
        if (!q) d.open = false;
      });
      vazio.hidden = n > 0;
      $("#faq-contador").textContent = q ? n + " pergunta(s) encontrada(s)" : "";
    });
    const form = $("#form-contato");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const msgs = Store.get("mensagens", []);
      msgs.push({ assunto: $("#assunto").value, data: new Date().toISOString() });
      Store.set("mensagens", msgs);
      Store.remove("draft:contato");
      form.reset();
      const ok = $("#contato-ok"); ok.hidden = false; ok.focus();
    });
  }

  /* --- Impacto: calculadora de pegada / compromisso ODS --- */
  if (page === "impacto") {
    const form = $("#form-compromisso");
    const lista = $("#compromissos-lista");
    const render = () => {
      const c = Store.get("compromissos", []);
      lista.innerHTML = "";
      c.forEach((t) => { const li = document.createElement("li"); li.textContent = t; lista.appendChild(li); });
      $("#total-compromissos").textContent = c.length;
    };
    render();
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const marcados = $$('input[name="compromisso"]:checked', form).map((c) => c.value);
      const err = $("#compromisso-erro");
      if (!marcados.length) { err.textContent = "Selecione pelo menos um compromisso."; $('input[name="compromisso"]', form).focus(); return; }
      err.textContent = "";
      Store.set("compromissos", marcados);
      render();
      toast("Obrigado! Seus " + marcados.length + " compromisso(s) com os ODS foram salvos.");
    });
    const salvos = Store.get("compromissos", []);
    $$('input[name="compromisso"]', form).forEach((c) => { c.checked = salvos.includes(c.value); });
  }
})();
