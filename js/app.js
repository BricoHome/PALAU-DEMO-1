/* ==========================================================
   EFC Palau-Saverdera · demo web
   Todo el contenido sale de los archivos de /data (JSON).
   Este archivo solo los lee y los pinta. No hace falta tocarlo.
   ========================================================== */
(function () {
  "use strict";

  /* ---------- utilidades ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const isHome = document.body.classList.contains("page-home");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  const FILES = ["site", "i18n", "teams", "players", "matches", "standings", "news", "sponsors", "members"];
  const D = {};
  const S = { lang: "ca", squadTeam: null, calTeam: "all", standTeam: null, reveal: true, countersDone: false };
  let lenis = null;
  let motion = false;

  /* ---------- movimiento: se decide al instante para evitar parpadeos ---------- */
  motion = !!(window.gsap && window.ScrollTrigger && !reduce);
  if (motion) {
    root.classList.add("anim");
    const h = $("#heroTitle");
    if (h) {
      h.innerHTML = h.textContent.trim().split(/\s+/).map((w) => '<span class="w"><span>' + esc(w) + "</span></span>").join("");
    }
  }

  /* ---------- idioma y textos ---------- */
  try { const l = localStorage.getItem("efc-lang"); if (l === "ca" || l === "es") S.lang = l; } catch (e) {}
  const t = (k) => (D.i18n[S.lang] && D.i18n[S.lang][k]) || (D.i18n.ca && D.i18n.ca[k]) || k;
  const L = (o) => (o && typeof o === "object" ? (o[S.lang] != null ? o[S.lang] : o.ca) || "" : o == null ? "" : o);
  const loc = () => (S.lang === "es" ? "es-ES" : "ca-ES");
  const rv = () => (S.reveal ? " data-reveal" : "");
  const teamById = (id) => D.teams.find((x) => x.id === id);

  /* ---------- fechas y partidos ---------- */
  const when = (m) => new Date(m.date + "T" + (m.time || "00:00") + ":00");
  const played = (m) => m.scoreFor != null && m.scoreAgainst != null;
  const upcoming = (team) =>
    D.matches.filter((m) => !played(m) && when(m) >= new Date() && (!team || team === "all" || m.team === team)).sort((a, b) => when(a) - when(b));
  const results = (team) =>
    D.matches.filter((m) => played(m) && (!team || team === "all" || m.team === team)).sort((a, b) => when(b) - when(a));
  const monthShort = (d) => d.toLocaleDateString(loc(), { month: "short" }).replace(".", "");
  const initials = (n) => n.replace(/\[.*?\]/g, "").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  function matchRow(m, showTeam) {
    const us = D.site.shortName;
    const h = m.home ? us : m.opponent;
    const a = m.home ? m.opponent : us;
    const d = when(m);
    let end;
    if (played(m)) {
      const hs = m.home ? m.scoreFor : m.scoreAgainst;
      const as = m.home ? m.scoreAgainst : m.scoreFor;
      const r = m.scoreFor > m.scoreAgainst ? "w" : m.scoreFor < m.scoreAgainst ? "l" : "d";
      end = '<span class="res ' + r + '">' + { w: "G", d: "E", l: "P" }[r] + "</span><span>" + hs + " - " + as + "</span>";
    } else {
      end = "<span>" + esc(m.time || "") + "</span>";
    }
    const tm = teamById(m.team);
    const sub = [d.toLocaleDateString(loc(), { weekday: "long" }), showTeam && tm ? L(tm.name) : "", m.venue].filter(Boolean).map(esc).join(" · ");
    return (
      '<li class="mrow"><div class="mdate"><b>' + d.getDate() + "</b><span>" + esc(monthShort(d)) + '</span></div>' +
      '<div class="mmain"><div class="mvs">' + esc(h) + " <i>vs</i> " + esc(a) + '</div><div class="msub">' + sub + "</div></div>" +
      '<div class="mend">' + end + "</div></li>"
    );
  }

  /* ---------- cabecera, pie y WhatsApp ---------- */
  function buildChrome() {
    const p = isHome ? "" : "index.html";
    const links = [["noticies", "nav_news"], ["equips", "nav_teams"], ["calendari", "nav_calendar"], ["classificacio", "nav_standings"], ["cantera", "nav_youth"], ["patrocinadors", "nav_sponsors"], ["contacte", "nav_contact"]];
    const nav = links.map((l) => '<a href="' + p + "#" + l[0] + '" data-i18n="' + l[1] + '"></a>').join("") +
      '<a class="btn btn-yellow" href="' + p + '#soci" data-i18n="nav_member"></a>';
    $("#chrome-header").innerHTML =
      '<header class="site-header" id="header"><div class="demo-strip" data-demo data-i18n="demo_banner"></div>' +
      '<div class="wrap bar"><a class="brand" href="' + (isHome ? "#inici" : "index.html") + '"><img src="assets/img/logo.png" alt="" width="40" height="62">' +
      '<span class="brand-text">Elit Futbol Club<b>Palau-saverdera</b></span></a>' +
      '<nav class="nav" id="nav" aria-label="Menu">' + nav + "</nav>" +
      '<div class="bar-actions"><button class="lang" id="langBtn" type="button"></button>' +
      '<button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button></div></div></header>';

    const yr = new Date().getFullYear();
    $("#chrome-footer").innerHTML =
      '<footer class="footer"><div class="wrap"><div class="f-grid">' +
      '<div class="f-brand"><img src="assets/img/logo.png" alt="" width="54" height="84" loading="lazy"><div><strong>' + esc(D.site.name) + "</strong><small>" + esc(D.site.address) + "</small></div></div>" +
      '<div><h4 data-i18n="footer_links"></h4><ul>' + links.slice(0, 4).map((l) => '<li><a href="' + p + "#" + l[0] + '" data-i18n="' + l[1] + '"></a></li>').join("") + "</ul></div>" +
      '<div><h4 data-i18n="contact_title"></h4><ul>' + links.slice(4).map((l) => '<li><a href="' + p + "#" + l[0] + '" data-i18n="' + l[1] + '"></a></li>').join("") +
      '<li><a href="' + p + '#soci" data-i18n="nav_member"></a></li></ul></div></div>' +
      '<div class="f-bottom"><span>© ' + yr + " " + esc(D.site.name) + ' · <span data-i18n="footer_rights"></span></span>' +
      '<span><span data-i18n="footer_made"></span> <a href="https://nuvendigital.es" target="_blank" rel="noopener">Nuven Digital</a></span></div></div></footer>' +
      '<a class="wa-float" id="waFloat" href="#" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.3a8.5 8.5 0 1 1 15.5-4.6z"/><path d="M9 8.6c.2 2.8 2.9 5.5 5.9 6.1l1-1.3-1.9-1-.9.7a4.6 4.6 0 0 1-1.9-1.9l.7-.9-1-1.9z"/></svg></a>';
  }

  function applyI18n() {
    root.lang = S.lang;
    $$("[data-i18n]").forEach((el) => { if (el.id !== "heroTitle") el.textContent = t(el.dataset.i18n); });
    $$("[data-demo]").forEach((el) => { el.hidden = !D.site.demoMode; });
    const lb = $("#langBtn");
    if (lb) { lb.textContent = t("lang_btn"); lb.setAttribute("aria-label", t("lang_label")); }
    const bg = $("#burger"); if (bg) bg.setAttribute("aria-label", t("menu"));
    const wa = $("#waFloat"); if (wa) wa.href = "https://wa.me/" + D.site.whatsapp + "?text=" + encodeURIComponent(t("wa_text"));
    const pv = $("#carPrev"), nx = $("#carNext");
    if (pv) pv.setAttribute("aria-label", t("prev"));
    if (nx) nx.setAttribute("aria-label", t("next"));
    const ht = $("#heroTitle");
    if (ht) {
      const txt = t("hero_title");
      ht.setAttribute("aria-label", txt);
      ht.innerHTML = txt.split(/\s+/).map((w) => '<span class="w" aria-hidden="true"><span>' + esc(w) + "</span></span>").join("");
    }
    const sp = $("#spCta"); if (sp) sp.href = "mailto:" + D.site.email + "?subject=" + encodeURIComponent(t("sponsors_title"));
  }

  /* ---------- chips ---------- */
  function chips(el, items, current, onPick) {
    el.innerHTML = items.map((i) => '<button class="chip" type="button" data-id="' + esc(i.id) + '" aria-pressed="' + (i.id === current) + '">' + esc(i.label) + "</button>").join("");
    el.onclick = (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      $$(".chip", el).forEach((c) => c.setAttribute("aria-pressed", c === b));
      onPick(b.dataset.id);
    };
  }
  const teamItems = (all) => (all ? [{ id: "all", label: t("cal_all") }] : []).concat(D.teams.map((x) => ({ id: x.id, label: L(x.name) })));

  /* ---------- portada: próximo partido y último resultado ---------- */
  function renderMatchCenter() {
    const box = $("#matchCenter"); if (!box) return;
    const team = D.site.featuredTeam;
    const tm = teamById(team);
    const nx = upcoming(team)[0];
    const lt = results(team)[0];
    const logo = '<img src="assets/img/logo.png" alt="" width="50" height="76">';
    const label = (m) => (tm ? L(tm.name) + " · " : "") + (m.venue || "");
    let a = "";
    if (nx) {
      const d = when(nx);
      const us = '<div class="mc-team">' + logo + "<span>" + esc(D.site.shortName) + "</span></div>";
      const op = '<div class="mc-team"><span class="mc-badge">' + esc(initials(nx.opponent)) + "</span><span>" + esc(nx.opponent) + "</span></div>";
      a = '<article class="mc"' + rv() + '><div class="mc-head"><span class="mc-label">' + t("match_next") + (D.site.demoMode ? '<span class="demo-tag">' + t("demo_tag") + "</span>" : "") + '</span><span class="mc-comp">' + esc(tm ? L(tm.competition) : "") + "</span></div>" +
        '<div class="mc-teams">' + (nx.home ? us : op) + '<span class="mc-vs">VS</span>' + (nx.home ? op : us) + "</div>" +
        '<p class="mc-when">' + esc(d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" })) + " · " + esc(nx.time || "") + "<small>" + esc(label(nx)) + "</small></p>" +
        '<div class="cd" id="cd" data-ts="' + d.getTime() + '" role="timer" aria-label="' + t("match_next") + '">' +
        ["d", "h", "m", "s"].map((u, i) => '<div><b data-u="' + u + '">00</b><span>' + t(["cd_days", "cd_hours", "cd_min", "cd_sec"][i]) + "</span></div>").join("") + "</div>" +
        '<a class="link-arrow" href="#calendari">' + t("see_calendar") + "</a></article>";
    } else {
      a = '<article class="mc"' + rv() + '><div class="mc-head"><span class="mc-label">' + t("match_next") + '</span></div><p class="empty">' + t("no_next") + "</p></article>";
    }
    let b = "";
    if (lt) {
      const d = when(lt);
      const hs = lt.home ? lt.scoreFor : lt.scoreAgainst, as = lt.home ? lt.scoreAgainst : lt.scoreFor;
      const us = '<div class="mc-team">' + logo + "<span>" + esc(D.site.shortName) + "</span></div>";
      const op = '<div class="mc-team"><span class="mc-badge">' + esc(initials(lt.opponent)) + "</span><span>" + esc(lt.opponent) + "</span></div>";
      b = '<article class="mc last"' + rv() + '><div class="mc-head"><span class="mc-label">' + t("match_last") + (D.site.demoMode ? '<span class="demo-tag">' + t("demo_tag") + "</span>" : "") + '</span><span class="mc-comp">' + esc(tm ? L(tm.competition) : "") + "</span></div>" +
        '<div class="mc-teams">' + (lt.home ? us : op) + '<span class="mc-score">' + hs + " - " + as + "</span>" + (lt.home ? op : us) + "</div>" +
        '<p class="mc-when">' + esc(d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" })) + "<small>" + esc(label(lt)) + "</small></p>" +
        '<a class="link-arrow" href="#calendari">' + t("see_calendar") + "</a></article>";
    } else {
      b = '<article class="mc last"' + rv() + '><div class="mc-head"><span class="mc-label">' + t("match_last") + '</span></div><p class="empty">' + t("no_last") + "</p></article>";
    }
    box.innerHTML = a + b;
    tick();
  }

  function tick() {
    const el = $("#cd"); if (!el) return;
    let s = Math.floor((+el.dataset.ts - Date.now()) / 1000);
    if (s <= 0) {
      s = 0;
      if (!el.dataset.done) { el.dataset.done = "1"; setTimeout(renderMatchCenter, 2000); }
    }
    const v = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
    Object.keys(v).forEach((k) => { const n = $('[data-u="' + k + '"]', el); if (n) n.textContent = pad(v[k]); });
  }

  /* ---------- noticias ---------- */
  function renderNews() {
    const g = $("#newsGrid"); if (!g) return;
    const items = D.news.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);
    g.innerHTML = items.map((n) => {
      const img = n.image ? '<div class="photo" style="background-image:url(\'' + esc(n.image) + '\')"></div>' : '<img class="ph" src="assets/img/logo.png" alt="" loading="lazy" width="120" height="186">';
      const d = new Date(n.date + "T12:00:00").toLocaleDateString(loc(), { day: "numeric", month: "long", year: "numeric" });
      return '<article class="news"' + rv() + '><div class="news-img">' + img + '</div><div class="news-body"><div class="news-meta"><span class="tag">' + esc(L(n.tag)) + "</span><time>" + esc(d) + "</time></div><h3>" + esc(L(n.title)) + "</h3><p>" + esc(L(n.excerpt)) + "</p></div></article>";
    }).join("");
  }

  /* ---------- contadores ---------- */
  function renderStats() {
    const g = $("#statsGrid"); if (!g) return;
    const nPlayers = Object.keys(D.players).reduce((s, k) => s + D.players[k].length, 0);
    const vals = [
      ["stat_matches", D.matches.filter(played).length],
      ["stat_players", nPlayers],
      ["stat_teams", D.teams.length],
      ["stat_years", Math.max(0, new Date().getFullYear() - D.site.founded)]
    ];
    const start0 = motion && !S.countersDone;
    g.innerHTML = vals.map((v) => '<div class="stat"' + rv() + '><b data-count="' + v[1] + '">' + (start0 ? 0 : v[1]) + "</b><span>" + t(v[0]) + "</span></div>").join("");
  }

  /* ---------- equipos ---------- */
  function renderTeams() {
    const g = $("#teamsGrid"); if (!g) return;
    g.innerHTML = D.teams.map((x) =>
      '<a class="team-card" href="equip.html?id=' + encodeURIComponent(x.id) + '" data-initial="' + esc(L(x.name).charAt(0)) + '"' + rv() + "><small>" + esc(L(x.level)) + "</small><h3>" + esc(L(x.name)) + '</h3><span class="go">' + t("see_team") + " →</span></a>"
    ).join("");
  }

  /* ---------- plantilla (carrusel) ---------- */
  function playerCard(p) {
    const photo = p.photo ? '<div class="pc-photo" style="background-image:url(\'' + esc(p.photo) + '\')"></div>'
      : '<svg class="pc-sil" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="32" r="18" fill="currentColor"/><path d="M12 100c0-26 16-40 38-40s38 14 38 40z" fill="currentColor"/></svg>';
    return '<li class="pc">' + photo + '<span class="pc-num">' + esc(p.num) + '</span><div class="pc-info"><span class="pc-pos">' + esc(t("pos_" + p.pos)) + '</span><strong class="pc-name">' + esc(p.name) + "</strong></div></li>";
  }
  const squadOf = (id) => (D.players[id] || []).slice().sort((a, b) => a.num - b.num);

  function renderSquad(animate) {
    const car = $("#squadCarousel"); if (!car) return;
    car.innerHTML = squadOf(S.squadTeam).map(playerCard).join("");
    car.scrollLeft = 0;
    updateCarBtns();
    if (animate && motion) gsap.from($$(".pc", car), { opacity: 0, x: 40, duration: 0.55, stagger: 0.04, ease: "power3.out", clearProps: "opacity,transform" });
  }
  function updateCarBtns() {
    const car = $("#squadCarousel"), pv = $("#carPrev"), nx = $("#carNext"); if (!car || !pv) return;
    pv.disabled = car.scrollLeft <= 2;
    nx.disabled = car.scrollLeft >= car.scrollWidth - car.clientWidth - 2;
  }
  function initCarousel() {
    const car = $("#squadCarousel"); if (!car) return;
    $("#carPrev").addEventListener("click", () => car.scrollBy({ left: -car.clientWidth * 0.8, behavior: "smooth" }));
    $("#carNext").addEventListener("click", () => car.scrollBy({ left: car.clientWidth * 0.8, behavior: "smooth" }));
    car.addEventListener("scroll", updateCarBtns, { passive: true });
    window.addEventListener("resize", updateCarBtns);
    let down = false, sx = 0, sl = 0;
    car.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; sx = e.clientX; sl = car.scrollLeft; });
    window.addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) car.classList.add("dragging"); car.scrollLeft = sl - dx; });
    window.addEventListener("pointerup", () => { down = false; car.classList.remove("dragging"); });
    car.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") car.scrollBy({ left: 240, behavior: "smooth" });
      if (e.key === "ArrowLeft") car.scrollBy({ left: -240, behavior: "smooth" });
    });
  }

  /* ---------- calendario y resultados ---------- */
  function renderCalendar() {
    const up = $("#calUpcoming"), rs = $("#calResults"); if (!up) return;
    const team = isHome ? S.calTeam : S.teamPage;
    const showTeam = team === "all";
    const u = upcoming(team).slice(0, 8), r = results(team).slice(0, 8);
    up.innerHTML = u.length ? u.map((m) => matchRow(m, showTeam)).join("") : '<li class="empty">' + t("cal_none_up") + "</li>";
    rs.innerHTML = r.length ? r.map((m) => matchRow(m, showTeam)).join("") : '<li class="empty">' + t("cal_none_res") + "</li>";
  }

  /* ---------- clasificación ---------- */
  function renderStandings(teamId, tbl) {
    const rows = (D.standings[teamId] || []).map((r) => Object.assign({}, r, { pts: r.g * 3 + r.e, gd: r.gf - r.gc }));
    rows.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    const th = ["#", "th_team", "th_pj", "th_g", "th_e", "th_p", "th_gf", "th_gc", "th_pts"];
    tbl.innerHTML = "<thead><tr>" + th.map((k, i) => "<th" + (i === 6 || i === 7 ? ' class="hide-s"' : "") + ">" + (k === "#" ? "#" : t(k)) + "</th>").join("") + "</tr></thead><tbody>" +
      rows.map((r, i) => '<tr class="' + (r.us ? "us " : "") + (i === 0 ? "top" : "") + '"><td>' + (i + 1) + "</td><td>" + esc(r.name) + "</td><td>" + r.pj + "</td><td>" + r.g + "</td><td>" + r.e + "</td><td>" + r.p + '</td><td class="hide-s">' + r.gf + '</td><td class="hide-s">' + r.gc + '</td><td class="pts">' + r.pts + "</td></tr>").join("") + "</tbody>";
  }

  /* ---------- cantera, patrocinadores, socios, contacto ---------- */
  function renderYouth() {
    const pills = $("#youthPills"); if (!pills) return;
    pills.innerHTML = D.teams.map((x) => '<span class="pill">' + esc(L(x.name)) + "</span>").join("");
    const sel = $("#f_team"), cur = sel.value;
    sel.innerHTML = '<option value="">' + t("f_select") + "</option>" + D.teams.map((x) => '<option value="' + esc(x.name.ca) + '">' + esc(L(x.name)) + "</option>").join("");
    sel.value = cur;
  }
  function initForm() {
    const f = $("#youthForm"); if (!f) return;
    const msg = $("#youthMsg"), btn = $("#youthSend");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      btn.disabled = true; msg.hidden = true; msg.classList.remove("err");
      try {
        const r = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(f)).toString() });
        if (!r.ok) throw new Error("form");
        msg.textContent = t("f_ok"); f.reset();
      } catch (err) {
        msg.textContent = t("f_err"); msg.classList.add("err");
      }
      msg.hidden = false; btn.disabled = false;
    });
  }
  function renderSponsors() {
    const g = $("#spGrid"); if (!g) return;
    g.innerHTML = D.sponsors.map((s) => {
      const inner = s.logo ? '<img src="' + esc(s.logo) + '" alt="' + esc(s.name) + '" loading="lazy">' : esc(s.name);
      return s.url ? '<a class="sp"' + rv() + ' href="' + esc(s.url) + '" target="_blank" rel="noopener">' + inner + "</a>" : '<div class="sp"' + rv() + ">" + inner + "</div>";
    }).join("");
  }
  function renderTiers() {
    const g = $("#tiers"); if (!g) return;
    g.innerHTML = D.members.map((m) =>
      '<article class="tier' + (m.highlight ? " hl" : "") + '"' + rv() + "><h3>" + esc(L(m.name)) + '</h3><div class="price">' + esc(m.price) + "<small>" + esc(L(m.period)) + "</small></div><ul>" +
      m.perks.map((p) => "<li>" + esc(L(p)) + "</li>").join("") + '</ul><a class="btn ' + (m.highlight ? "btn-yellow" : "btn-ghost") + '" href="#contacte">' + t("member_cta") + "</a></article>"
    ).join("");
  }
  const ICON = {
    pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>'
  };
  const icon = (k) => '<span class="cicon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[k] + "</svg></span>";
  function renderContact() {
    const list = $("#contactList"); if (!list) return;
    const s = D.site, so = s.social || {};
    const socials = Object.keys(so).filter((k) => so[k]).map((k) => '<a href="' + esc(so[k]) + '" target="_blank" rel="noopener">' + esc(k.charAt(0).toUpperCase() + k.slice(1)) + "</a>").join(" · ");
    const tag = s.demoMode ? '<span class="demo-tag">' + t("demo_tag") + "</span>" : "";
    list.innerHTML =
      '<div class="citem">' + icon("pin") + "<div><small>" + t("c_address") + '</small><span class="v">' + esc(s.address) + "</span></div></div>" +
      '<div class="citem">' + icon("phone") + "<div><small>" + t("c_phone") + '</small><a href="tel:' + esc(String(s.phone).replace(/[^\d+]/g, "")) + '">' + esc(s.phone) + "</a>" + tag + "</div></div>" +
      '<div class="citem">' + icon("mail") + "<div><small>" + t("c_email") + '</small><a href="mailto:' + esc(s.email) + '">' + esc(s.email) + "</a>" + tag + "</div></div>" +
      (socials ? '<div class="citem">' + icon("share") + "<div><small>" + t("c_social") + "</small><span class=\"v\">" + socials + "</span></div></div>" : "");
    $("#contactBtns").innerHTML =
      '<a class="btn btn-green" target="_blank" rel="noopener" href="https://wa.me/' + esc(s.whatsapp) + "?text=" + encodeURIComponent(t("wa_text")) + '">' + t("c_whatsapp") + "</a>" +
      '<a class="btn btn-navy" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.mapQuery) + '">' + t("c_directions") + "</a>";
    const c = s.mapCenter, bb = [c.lon - 0.03, c.lat - 0.017, c.lon + 0.03, c.lat + 0.017].map((n) => n.toFixed(4)).join("%2C");
    const box = $("#mapBox");
    if (!box.firstChild) box.innerHTML = '<iframe title="Mapa" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.openstreetmap.org/export/embed.html?bbox=' + bb + '&layer=mapnik"></iframe>';
  }

  /* ---------- página de equipo ---------- */
  function renderTeamPage() {
    const id = new URLSearchParams(location.search).get("id") || D.site.featuredTeam;
    const tm = teamById(id);
    S.teamPage = id;
    if (!tm) { $("#teamName").textContent = t("team_not_found"); return; }
    $("#teamName").textContent = L(tm.name);
    document.title = L(tm.name) + " · " + D.site.name;
    $("#teamMeta").innerHTML =
      "<div><small>" + t("team_comp") + "</small>" + esc(L(tm.competition)) + "</div>" +
      "<div><small>" + t("team_coach") + "</small>" + esc(tm.coach) + "</div>" +
      "<div><small>" + t("team_training") + "</small>" + esc(L(tm.training)) + "</div>";
    $("#squadGrid").innerHTML = squadOf(id).map(playerCard).join("");
    renderCalendar();
    renderStandings(id, $("#standTbl"));
  }

  /* ---------- pintar todo ---------- */
  function renderAll() {
    applyI18n();
    if (isHome) {
      renderMatchCenter(); renderNews(); renderStats(); renderTeams(); renderSquad(false);
      chips($("#squadChips"), teamItems(false), S.squadTeam, (id) => { S.squadTeam = id; renderSquad(true); });
      chips($("#calChips"), teamItems(true), S.calTeam, (id) => { S.calTeam = id; renderCalendar(); });
      renderCalendar();
      const sel = $("#standSel");
      sel.innerHTML = D.teams.map((x) => '<option value="' + esc(x.id) + '">' + esc(L(x.name)) + " · " + esc(L(x.competition)) + "</option>").join("");
      sel.value = S.standTeam;
      renderStandings(S.standTeam, $("#standTbl"));
      renderYouth(); renderSponsors(); renderTiers(); renderContact();
    } else {
      renderTeamPage();
    }
  }

  /* ---------- movimiento (Lenis + GSAP + ScrollTrigger) ---------- */
  function initMotion() {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.15, easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)) });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    // portada: título por palabras y elementos
    if ($(".hero")) {
      gsap.set(".hero-title .w>span", { yPercent: 112 });
      const ht = $("#heroTitle"); if (ht) ht.classList.add("shown");
      const tl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.15 });
      tl.to(".hero-title .w>span", { yPercent: 0, duration: 1.1, stagger: 0.09 }, 0)
        .to(".hero .eyebrow", { opacity: 1, duration: 0.8 }, 0.1)
        .to(".hero-text", { opacity: 1, duration: 0.9 }, 0.55)
        .to(".hero-cta", { opacity: 1, duration: 0.9 }, 0.7)
        .fromTo(".hero-crest img", { opacity: 0, scale: 0.86, rotate: -4 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.3 }, 0.3);
      // parallax de la portada
      gsap.to(".hero-bg", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-crest", { yPercent: -14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-copy", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
    // cada bloque aparece al llegar
    const els = $$("[data-reveal]");
    if (els.length) {
      ScrollTrigger.batch(els, {
        start: "top 90%", once: true,
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.09, overwrite: true,
          onComplete: () => batch.forEach((el) => { el.classList.add("is-in"); gsap.set(el, { clearProps: "opacity,transform" }); })
        })
      });
    }
    // contadores
    if ($("#stats")) {
      ScrollTrigger.create({
        trigger: "#stats", start: "top 85%", once: true,
        onEnter: () => {
          S.countersDone = true;
          $$("[data-count]").forEach((el) => { const end = +el.dataset.count, o = { v: 0 }; gsap.to(o, { v: end, duration: 1.8, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)), onComplete: () => (el.textContent = end) }); });
        }
      });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ---------- eventos generales ---------- */
  function initUI() {
    const header = $("#header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    const nav = $("#nav"), burger = $("#burger");
    const closeNav = () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); if (lenis) lenis.start(); document.body.style.overflow = ""; };
    burger.addEventListener("click", () => {
      const open = !nav.classList.contains("open");
      nav.classList.toggle("open", open); burger.setAttribute("aria-expanded", String(open));
      if (lenis) open ? lenis.stop() : lenis.start();
      document.body.style.overflow = open ? "hidden" : "";
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]"); if (!a) return;
      if (nav.contains(a)) closeNav();
      const h = a.getAttribute("href");
      if (!h || h.charAt(0) !== "#" || h.length < 2) return;
      const target = $(h); if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.3 });
      else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", h);
    });

    $("#langBtn").addEventListener("click", () => {
      S.lang = S.lang === "ca" ? "es" : "ca";
      try { localStorage.setItem("efc-lang", S.lang); } catch (e) {}
      S.reveal = false; renderAll();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  function goToHash() {
    if (!location.hash || location.hash.length < 2) return;
    const el = $(location.hash); if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -64, immediate: true }); else el.scrollIntoView();
  }

  function fail(err) {
    console.error(err);
    root.classList.remove("anim");
    const m = document.createElement("div");
    m.style.cssText = "position:fixed;inset:auto 1rem 1rem 1rem;z-index:300;background:#fff;color:#081b4b;border:3px solid #fdd908;border-radius:12px;padding:1rem 1.2rem;font:600 15px/1.5 system-ui;box-shadow:0 10px 40px rgba(0,0,0,.35)";
    m.textContent = "No s'han pogut carregar les dades de /data. Obre la web des de Netlify o des d'un servidor local (no fent doble clic a l'arxiu).";
    document.body.appendChild(m);
  }

  /* ---------- arranque ---------- */
  Promise.all(FILES.map((f) => fetch("data/" + f + ".json").then((r) => { if (!r.ok) throw new Error("No es pot carregar data/" + f + ".json"); return r.json(); })))
    .then((res) => {
      FILES.forEach((f, i) => (D[f] = res[i]));
      S.squadTeam = D.site.featuredTeam; S.standTeam = D.site.featuredTeam;
      if (D.site.heroImage) root.style.setProperty("--hero-img", 'url("' + D.site.heroImage.replace(/"/g, "") + '")');
      buildChrome();
      renderAll();
      initUI();
      if (isHome) { initCarousel(); initForm(); $("#standSel").addEventListener("change", (e) => { S.standTeam = e.target.value; renderStandings(S.standTeam, $("#standTbl")); }); }
      setInterval(tick, 1000);
      if (motion) initMotion();
      S.reveal = false;
      requestAnimationFrame(goToHash);
    })
    .catch(fail);
})();
