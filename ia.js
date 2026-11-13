/* ==========================================================================
   Esportes sem Limites — Assistente IA "Tina"
   Arquitetura em duas camadas (ver docs/uso-de-ia.md):
   1) Modo LOCAL (padrão, funciona offline e no GitHub Pages): motor de
      recuperação por similaridade (TF + sinônimos) sobre uma base de
      conhecimento curada pela equipe. Não inventa respostas: se a confiança
      for baixa, encaminha para um humano.
   2) Modo LLM (opcional): se window.MT_IA_ENDPOINT estiver definido, a
      pergunta é enviada a um backend/proxy (ex.: função serverless) que chama
      um modelo de linguagem. A chave da API NUNCA fica no front-end.
   ========================================================================== */
(function () {
  "use strict";
  const Store = window.MTStore;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Base de conhecimento ---------- */
  const KB = [
    { id: "ong", q: "o que é a esportes sem limites ong quem são vocês missão",
      a: "O Esportes sem Limites é uma ONG (fictícia, criada para este projeto acadêmico) que promove a <strong>inclusão de pessoas com deficiência no esporte</strong> — com aulas gratuitas, empréstimo de equipamentos adaptados e formação de professores.",
      link: ["sobre.html", "Conheça a ONG"] },
    { id: "inscrever", q: "como participar inscrever matricular treinar aula gratuita começar quero praticar",
      a: "Para treinar com a gente basta preencher a <strong>inscrição de atleta</strong>. É gratuita, não exige experiência e você pode indicar suas necessidades de acessibilidade. Retornamos em até 5 dias úteis.",
      link: ["participe.html", "Fazer inscrição"] },
    { id: "voluntario", q: "voluntário voluntariado ajudar trabalhar como voluntária tempo",
      a: "Voluntários são essenciais! Precisamos de guias para atletas cegos, apoio em eventos, comunicação, fisioterapia e intérpretes de Libras. Escolha o perfil <strong>Voluntário(a)</strong> no formulário.",
      link: ["participe.html#perfil-voluntario", "Quero ser voluntário(a)"] },
    { id: "doar", q: "doar doação dinheiro pix contribuir ajudar financeiramente apoiar",
      a: "Você pode fazer uma doação única ou mensal a partir de R$ 5. A página de doação mostra o impacto concreto de cada valor. Também aceitamos <strong>doação de equipamentos</strong> (cadeiras, bolas, próteses esportivas).",
      link: ["doe.html", "Fazer uma doação"] },
    { id: "equip", q: "doar equipamento cadeira de rodas esportiva prótese bola usado reaproveitar",
      a: "Recebemos equipamentos esportivos usados em bom estado. Eles passam por revisão na nossa oficina e voltam a circular — isso reduz descarte e barateia o acesso ao esporte (ODS 12).",
      link: ["doe.html#equipamentos", "Como doar equipamentos"] },
    { id: "goalball", q: "goalball gol bola guizo cego visual deficiência visual",
      a: "O <strong>goalball</strong> foi criado em 1946 para reabilitar veteranos de guerra com deficiência visual. Joga-se em silêncio, com uma bola que tem guizos, e todos os atletas usam vendas para igualar as condições.",
      link: ["modalidades.html", "Ver modalidades"] },
    { id: "bocha", q: "bocha paralímpica boccia paralisia cerebral calha bc3",
      a: "A <strong>bocha paralímpica</strong> é disputada por atletas com comprometimento motor severo (como paralisia cerebral). Na classe BC3 o atleta usa uma calha e conta com um assistente.",
      link: ["modalidades.html", "Ver modalidades"] },
    { id: "futebolcegos", q: "futebol de cegos futebol 5 deficiência visual brasil campeão",
      a: "No <strong>futebol de cegos</strong> a bola tem guizos, o goleiro enxerga e um “chamador” orienta o ataque atrás do gol. O Brasil é a maior potência da modalidade, com 5 ouros paralímpicos seguidos (2004 a 2020).",
      link: ["modalidades.html", "Ver modalidades"] },
    { id: "basquete", q: "basquete em cadeira de rodas basquete cadeirante",
      a: "O <strong>basquete em cadeira de rodas</strong> usa a mesma quadra e cesta do convencional. Cada atleta tem uma pontuação funcional (1,0 a 4,5) e a soma em quadra não pode passar de 14 pontos.",
      link: ["modalidades.html", "Ver modalidades"] },
    { id: "volei", q: "vôlei sentado voleibol amputado",
      a: "No <strong>vôlei sentado</strong> a rede é mais baixa e o atleta precisa manter o quadril em contato com o chão ao tocar na bola. É ótimo para pessoas amputadas ou com lesões nos membros inferiores.",
      link: ["modalidades.html", "Ver modalidades"] },
    { id: "natacao", q: "natação nadar piscina s1 s14 classes",
      a: "A <strong>natação paralímpica</strong> tem classes S1 a S10 (deficiência física, do maior ao menor comprometimento), S11 a S13 (deficiência visual) e S14 (deficiência intelectual).",
      link: ["paradesporto.html#classificacao", "Entender a classificação"] },
    { id: "classificacao", q: "classificação funcional classe categoria t11 t20 f como funciona",
      a: "A <strong>classificação funcional</strong> agrupa atletas com níveis parecidos de limitação para garantir disputas justas. As letras indicam a prova (T = pista, F = campo, S = natação) e os números, o tipo e o grau da deficiência.",
      link: ["paradesporto.html#classificacao", "Ver tabela de classes"] },
    { id: "historia", q: "história paralimpíadas origem guttmann stoke mandeville roma 1960",
      a: "Tudo começou em 1948, quando o médico Ludwig Guttmann organizou os Jogos de Stoke Mandeville, na Inglaterra. A primeira Paralimpíada aconteceu em <strong>Roma, 1960</strong>, com cerca de 400 atletas.",
      link: ["paradesporto.html", "Linha do tempo"] },
    { id: "brasil", q: "brasil paris 2024 medalhas resultado desempenho cpb",
      a: "Em <strong>Paris 2024</strong> o Brasil fez sua melhor campanha paralímpica: 89 medalhas (25 de ouro), terminando em 5º lugar no quadro geral.",
      link: ["paradesporto.html", "Saiba mais"] },
    { id: "lei", q: "lei brasileira de inclusão lbi 13146 direito ao esporte legislação",
      a: "A <strong>Lei Brasileira de Inclusão (Lei nº 13.146/2015)</strong> garante à pessoa com deficiência o direito ao esporte e ao lazer em igualdade de oportunidades, incluindo acessibilidade em instalações esportivas.",
      link: ["paradesporto.html#direitos", "Direitos e legislação"] },
    { id: "dados", q: "quantas pessoas com deficiência no brasil ibge dados população",
      a: "Segundo a PNAD Contínua 2022 do IBGE, o Brasil tem cerca de <strong>18,6 milhões</strong> de pessoas com deficiência (8,9% da população com 2 anos ou mais).",
      link: ["index.html#numeros", "Ver números"] },
    { id: "ods", q: "ods agenda 2030 sustentabilidade objetivos desenvolvimento sustentável impacto social",
      a: "Nosso trabalho contribui com os ODS 3 (saúde), 4 (educação), 5 (igualdade de gênero), 10 (redução das desigualdades), 11 (cidades inclusivas), 12 (consumo responsável) e 17 (parcerias).",
      link: ["impacto.html", "Ver impacto e ODS"] },
    { id: "acess", q: "acessibilidade do site libras contraste fonte leitor de tela teclado",
      a: "O site segue a WCAG 2.2 nível AA: navegação por teclado, link para pular ao conteúdo, alto contraste, modo claro, ajuste de fonte, espaçamento de leitura e tradução em Libras pelo VLibras. Os ajustes ficam na barra logo abaixo do menu, em todas as páginas.",
      link: ["contato.html#acessibilidade", "Declaração de acessibilidade"] },
    { id: "eventos", q: "evento eventos agenda festival torneio quando próximo calendário",
      a: "Na agenda você encontra festivais, oficinas e torneios abertos ao público. Clique em <strong>Tenho interesse</strong> para guardar o evento na sua agenda pessoal.",
      link: ["eventos.html", "Ver agenda"] },
    { id: "contato", q: "contato telefone email endereço whatsapp falar com humano atendente",
      a: "Você pode falar com nossa equipe pelo formulário de contato, pelo e-mail contato@esportessemlimites.org (fictício) ou presencialmente no nosso centro esportivo.",
      link: ["contato.html", "Falar com a equipe"] },
    { id: "custo", q: "custa quanto preço pago gratuito grátis mensalidade",
      a: "Todas as atividades para atletas são <strong>gratuitas</strong>. Elas são mantidas por doações, parcerias e editais públicos.",
      link: ["sobre.html#transparencia", "Ver transparência"] },
    { id: "idade", q: "idade criança criancas idoso idosa adolescente menor de idade quantos anos",
      a: "Atendemos a partir dos 6 anos, sem limite de idade. Menores de 18 anos precisam ser inscritos por um responsável. Temos turmas específicas para crianças e para pessoas acima de 60 anos.",
      link: ["participe.html", "Inscrever"] },
    { id: "intelectual", q: "deficiência intelectual autismo tea síndrome de down",
      a: "Sim! Temos turmas para pessoas com deficiência intelectual e autismo (TEA), com grupos menores, rotina previsível e profissionais capacitados. Atletismo, natação e tênis de mesa têm classes paralímpicas para deficiência intelectual.",
      link: ["modalidades.html", "Ver modalidades"] },
    { id: "surdo", q: "surdo surdez auditiva deficiência auditiva surdolimpíadas",
      a: "Pessoas surdas competem nas <strong>Surdolimpíadas</strong> (Deaflympics), realizadas desde 1924. Nas nossas aulas há instrutores fluentes em Libras e sinalização visual de início e fim de jogadas.",
      link: ["paradesporto.html", "Saiba mais"] }
  ];

  const SYN = {
    cadeirante: "cadeira de rodas", cego: "deficiência visual", cega: "deficiência visual", "baixa visão": "deficiência visual",
    pix: "doação", grana: "dinheiro", gratis: "gratuito", oi: "olá", ola: "olá", libras: "libras surdo",
    paraolimpiada: "paralimpíadas", paraolimpíadas: "paralimpíadas", olimpiadas: "paralimpíadas"
  };
  const STOP = new Set("a o e é de da do das dos em no na nos nas um uma uns umas para pra por com que qual quais como se eu me meu minha vocês voce você tem ter há ou ao aos à às é ser sobre mais muito isso esse essa".split(" "));
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ");
  const tokens = (s) => {
    let t = norm(s);
    Object.keys(SYN).forEach((k) => { t = t.replace(new RegExp("\\b" + norm(k) + "\\b", "g"), norm(SYN[k])); });
    return t.split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
  };
  const stem = (w) => w.replace(/(oes|aes|ais|eis|s)$/, "").slice(0, 7);
  const KB_TOKENS = KB.map((k) => new Set(tokens(k.q).map(stem)));

  function localAnswer(question) {
    const qt = tokens(question).map(stem);
    if (!qt.length) return null;
    if (/^(ola|oi|bom dia|boa tarde|boa noite)\b/.test(norm(question).trim()))
      return { a: "Olá! Eu sou a Tina, assistente virtual do Esportes sem Limites. Posso explicar modalidades adaptadas, como participar, doar ou entender a classificação paralímpica.", score: 1 };
    let best = null, bestScore = 0;
    KB.forEach((k, i) => {
      const hits = qt.filter((w) => KB_TOKENS[i].has(w)).length;
      const score = hits / Math.sqrt(qt.length * 0.6 + KB_TOKENS[i].size * 0.4);
      if (score > bestScore) { bestScore = score; best = k; }
    });
    return bestScore >= 0.28 ? Object.assign({ score: bestScore }, best) : null;
  }

  async function llmAnswer(question, history) {
    // Integração opcional com LLM via backend (ver docs/uso-de-ia.md).
    const res = await fetch(window.MT_IA_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history: history.slice(-6) })
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return { a: data.answer, link: null };
  }

  /* ---------- Interface do chat ---------- */
  const chat = $("#chat");
  if (!chat) return;
  const log = $("#chat-log");
  const form = $("#chat-form");
  const input = $("#chat-input");
  const HKEY = "chat-historico";
  let history = Store.get(HKEY, []);

  function addMsg(role, html, link, persist) {
    const li = document.createElement("li");
    li.className = "msg msg--" + role;
    const who = document.createElement("span");
    who.className = "msg__who";
    who.textContent = role === "bot" ? "Tina (assistente IA)" : "Você";
    const p = document.createElement("p");
    if (role === "bot") p.innerHTML = html; else p.textContent = html; // texto do usuário nunca vira HTML (evita XSS)
    li.append(who, p);
    if (link) {
      const lp = document.createElement("p");
      const a = document.createElement("a");
      a.href = link[0]; a.textContent = link[1] + " →";
      lp.appendChild(a); li.appendChild(lp);
    }
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
    if (persist !== false) { history.push({ role, html, link: link || null }); history = history.slice(-40); Store.set(HKEY, history); }
  }

  async function ask(question) {
    question = question.trim();
    if (!question) { input.setAttribute("aria-invalid", "true"); $("#chat-erro").textContent = "⚠ Digite uma pergunta."; input.focus(); return; }
    if (question.length > 300) { $("#chat-erro").textContent = "⚠ Use no máximo 300 caracteres."; return; }
    input.setAttribute("aria-invalid", "false"); $("#chat-erro").textContent = "";
    addMsg("user", question);
    input.value = "";
    const typing = document.createElement("li");
    typing.className = "msg msg--bot msg--typing"; typing.textContent = "Tina está digitando…";
    log.appendChild(typing);
    let ans;
    try {
      if (window.MT_IA_ENDPOINT) ans = await llmAnswer(question, history);
    } catch (e) { ans = null; }
    if (!ans) ans = localAnswer(question);
    await new Promise((r) => setTimeout(r, 450));
    typing.remove();
    if (ans) addMsg("bot", ans.a, ans.link);
    else addMsg("bot", "Ainda não sei responder isso com segurança — e prefiro não inventar. Você pode reformular a pergunta ou falar com uma pessoa da nossa equipe.", ["contato.html", "Falar com a equipe"]);
    // métrica simples de uso (só local) para o relatório de melhorias
    const m = Store.get("chat-metricas", { perguntas: 0, semResposta: 0 });
    m.perguntas++; if (!ans) m.semResposta++;
    Store.set("chat-metricas", m);
  }

  if (history.length) history.forEach((h) => addMsg(h.role, h.html, h.link, false));
  else addMsg("bot", "Olá! Eu sou a <strong>Tina</strong>, assistente virtual do Esportes sem Limites. Pergunte sobre modalidades adaptadas, classificação paralímpica, como participar ou doar.", null, false);

  form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); });
  $$("[data-pergunta]").forEach((b) => b.addEventListener("click", () => ask(b.dataset.pergunta)));
  $("#chat-limpar").addEventListener("click", () => {
    history = []; Store.remove(HKEY); log.innerHTML = "";
    addMsg("bot", "Conversa apagada deste navegador. Como posso ajudar?", null, false);
    input.focus();
  });
  const qp = new URLSearchParams(location.search).get("q");
  if (qp) ask(qp);

  /* ---------- Recomendador de modalidade (sistema baseado em regras) ---------- */
  const rec = $("#form-recomendador");
  if (rec) {
    const MOD = {
      goalball: { nome: "Goalball", por: "é jogado com vendas e bola com guizos — ideal para deficiência visual e para quem gosta de jogo coletivo e estratégico." },
      futebolcegos: { nome: "Futebol de cegos", por: "une o esporte mais popular do país à orientação sonora, com muito contato e trabalho em equipe." },
      bocha: { nome: "Bocha paralímpica", por: "exige precisão e estratégia, com baixa demanda física — ótima para comprometimento motor severo." },
      basquete: { nome: "Basquete em cadeira de rodas", por: "é dinâmico, coletivo e muito acessível para quem usa cadeira de rodas." },
      volei: { nome: "Vôlei sentado", por: "é coletivo e indicado para amputações ou lesões nos membros inferiores." },
      natacao: { nome: "Natação adaptada", por: "tem baixo impacto nas articulações e classes para todos os tipos de deficiência." },
      atletismo: { nome: "Atletismo", por: "oferece provas individuais de pista e campo, com classes para todos os tipos de deficiência." },
      tenismesa: { nome: "Tênis de mesa", por: "desenvolve reflexos e coordenação e pode ser jogado em pé ou na cadeira de rodas." },
      judo: { nome: "Judô", por: "é a luta paralímpica para pessoas com deficiência visual, com os atletas já em contato desde o início." },
      dancas: { nome: "Dança esportiva em cadeira de rodas", por: "une música e movimento, com estilo competitivo ou recreativo." }
    };
    rec.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!window.MTValidate(rec)) return;
      const d = rec.querySelector('input[name="r-def"]:checked').value;
      const estilo = rec.querySelector('input[name="r-estilo"]:checked').value;
      const ritmo = rec.querySelector('input[name="r-ritmo"]:checked').value;
      const score = {};
      const add = (k, n) => { score[k] = (score[k] || 0) + n; };
      const byDef = {
        visual: ["goalball", "futebolcegos", "judo", "atletismo", "natacao"],
        fisica_cadeira: ["basquete", "tenismesa", "atletismo", "dancas", "natacao"],
        fisica_membros: ["volei", "natacao", "atletismo", "tenismesa"],
        motora_severa: ["bocha", "natacao"],
        intelectual: ["natacao", "atletismo", "tenismesa"],
        auditiva: ["atletismo", "natacao", "volei", "judo"],
        nenhuma: ["goalball", "volei", "bocha", "basquete"]
      };
      (byDef[d] || []).forEach((k, i) => add(k, 5 - i * 0.5));
      const coletivo = ["goalball", "futebolcegos", "basquete", "volei"];
      Object.keys(score).forEach((k) => {
        if (estilo === "coletivo" && coletivo.includes(k)) add(k, 2);
        if (estilo === "individual" && !coletivo.includes(k)) add(k, 2);
        if (ritmo === "leve" && ["bocha", "natacao", "tenismesa", "dancas"].includes(k)) add(k, 1.5);
        if (ritmo === "intenso" && ["basquete", "futebolcegos", "atletismo", "judo", "goalball"].includes(k)) add(k, 1.5);
      });
      const top = Object.keys(score).sort((a, b) => score[b] - score[a]).slice(0, 3);
      const out = $("#resultado-recomendador");
      const ol = $("ol", out);
      ol.innerHTML = "";
      top.forEach((k) => {
        const li = document.createElement("li");
        li.innerHTML = "<strong></strong> — <span></span>";
        li.querySelector("strong").textContent = MOD[k].nome;
        li.querySelector("span").textContent = MOD[k].por;
        ol.appendChild(li);
      });
      Store.set("recomendacao", top);
      out.hidden = false; out.focus();
    });
  }
})();
