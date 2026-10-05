/* ==========================================================================
   ARSANO — språkval (svenska, engelska, ukrainska)
   --------------------------------------------------------------------------
   Sidan skrivs bara på svenska. Det här skriptet byter ut texterna mot
   översättningarna i assets/sprak/en.js och assets/sprak/uk.js.

   Översättningarna slås upp på den svenska texten själv, så det finns inga
   nycklar eller id:n att hålla reda på. Ändrar du en svensk mening saknas
   den i ordlistan tills verktyget verktyg/oversatt.mjs har körts (det sker
   automatiskt på GitHub vid varje push). Saknas en översättning visas den
   svenska texten, så inget går sönder.

   Text som inte ska översättas: lägg translate="no" på elementet.
   Länk direkt till ett språk: index.html?lang=uk
   ========================================================================== */

(function () {
  "use strict";

  var KALLA = "sv";
  var SPRAK = [
    { kod: "sv", namn: "Svenska" },
    { kod: "en", namn: "English" },
    { kod: "uk", namn: "Українська" }
  ];
  var ATTRIBUT = ["alt", "aria-label", "title", "placeholder"];
  var MINNE = "arsano-sprak";

  var FLAGGOR = {
    sv: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect width="20" height="20" fill="#006AA7"/>' +
        '<rect x="5.5" width="3.2" height="20" fill="#FECC02"/><rect y="8.4" width="20" height="3.2" fill="#FECC02"/></svg>',
    en: '<svg viewBox="0 0 30 30" aria-hidden="true">' +
        '<clipPath id="sprak-uk-t"><path d="M15,15h15v15zv15h-15zh-15v-15zv-15h15z"/></clipPath>' +
        '<rect width="30" height="30" fill="#012169"/>' +
        '<path d="M0,0L30,30M30,0L0,30" stroke="#fff" stroke-width="6"/>' +
        '<path d="M0,0L30,30M30,0L0,30" stroke="#C8102E" stroke-width="4" clip-path="url(#sprak-uk-t)"/>' +
        '<path d="M15,0v30M0,15h30" stroke="#fff" stroke-width="10"/>' +
        '<path d="M15,0v30M0,15h30" stroke="#C8102E" stroke-width="6"/></svg>',
    uk: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect width="20" height="10" fill="#0057B7"/>' +
        '<rect y="10" width="20" height="10" fill="#FFD700"/></svg>'
  };

  var ordlistor = {};               // "en" -> { "svensk text": "översättning" }
  var vantar = {};                  // språk som håller på att laddas -> [återanrop]
  var orgText = new WeakMap();      // textnod -> ursprunglig svensk text
  var orgAttr = new WeakMap();      // element -> { attribut: svensk text }
  var orgTitel = null, orgBeskr = null;
  var aktuellt = KALLA;

  var skriptSrc = (document.currentScript && document.currentScript.src) || "assets/js/sprak.js";
  var mapp = skriptSrc.replace(/js\/sprak\.js(\?.*)?$/, "sprak/");

  /* ---------- hjälpfunktioner ---------- */

  var norm = function (s) { return String(s).replace(/\s+/g, " ").trim(); };
  var harBokstav = function (s) { return /\p{L}/u.test(s); };
  var giltig = function (k) { return SPRAK.some(function (s) { return s.kod === k; }); };

  function undantagen(el) {
    if (!el) return true;
    if (el.closest("script,style,noscript,template,[translate='no']")) return true;
    return false;
  }

  function sparaVal(kod) { try { localStorage.setItem(MINNE, kod); } catch (e) { /* privat läge */ } }

  function startsprak() {
    var q = null;
    try { q = new URLSearchParams(window.location.search).get("lang"); } catch (e) { /* gammal webbläsare */ }
    if (giltig(q)) { sparaVal(q); return q; }

    var sparat = null;
    try { sparat = localStorage.getItem(MINNE); } catch (e) { /* privat läge */ }
    if (giltig(sparat)) return sparat;

    // Inget eget val ännu: gå efter webbläsarens språk, annars engelska.
    var lista = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < lista.length; i++) {
      var l = String(lista[i]).toLowerCase();
      if (l.indexOf("sv") === 0) return "sv";
      if (l.indexOf("uk") === 0) return "uk";
      if (l.indexOf("en") === 0) return "en";
    }
    return "en";
  }

  /* ---------- ordlistor laddas vid behov ---------- */

  function ladda(kod, klar) {
    if (kod === KALLA || ordlistor[kod]) { klar(); return; }
    if (vantar[kod]) { vantar[kod].push(klar); return; }
    vantar[kod] = [klar];
    var s = document.createElement("script");
    s.src = mapp + kod + ".js";
    var fardig = function () {
      if (!ordlistor[kod]) ordlistor[kod] = {};        // fil saknas: visa svenska
      var cb = vantar[kod]; delete vantar[kod];
      cb.forEach(function (f) { f(); });
    };
    s.onload = fardig;
    s.onerror = fardig;
    document.head.appendChild(s);
  }

  /* ---------- gå igenom sidan ---------- */

  function textnoder(fn) {
    if (!document.body) return;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      if (undantagen(n.parentElement)) continue;
      if (!orgText.has(n)) orgText.set(n, n.nodeValue);
      fn(n, orgText.get(n));
    }
  }

  function attributnoder(fn) {
    if (!document.body) return;
    var sel = ATTRIBUT.map(function (a) { return "[" + a + "]"; }).join(",");
    document.body.querySelectorAll(sel).forEach(function (el) {
      if (undantagen(el)) return;
      var org = orgAttr.get(el);
      if (!org) { org = {}; orgAttr.set(el, org); }
      ATTRIBUT.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        if (!(a in org)) org[a] = el.getAttribute(a);
        fn(el, a, org[a]);
      });
    });
  }

  function metaBeskrivning() { return document.querySelector('meta[name="description"]'); }

  function fangaHuvud() {
    if (orgTitel === null) orgTitel = document.title;
    var m = metaBeskrivning();
    if (m && orgBeskr === null) orgBeskr = m.getAttribute("content") || "";
  }

  /* ---------- översätt ---------- */

  function oversattStrang(org, lista) {
    if (!lista) return org;
    var nyckel = norm(org);
    if (!nyckel || !harBokstav(nyckel)) return org;
    var t = lista[nyckel];
    if (typeof t !== "string" || !t) return org;
    var fore = org.match(/^\s*/)[0], efter = org.match(/\s*$/)[0];
    return fore + t + efter;
  }

  function tillamp(kod) {
    var lista = kod === KALLA ? null : ordlistor[kod];
    fangaHuvud();

    textnoder(function (n, org) {
      var ny = oversattStrang(org, lista);
      if (n.nodeValue !== ny) n.nodeValue = ny;
    });
    attributnoder(function (el, a, org) {
      var ny = oversattStrang(org, lista);
      if (el.getAttribute(a) !== ny) el.setAttribute(a, ny);
    });
    document.title = oversattStrang(orgTitel, lista);
    var m = metaBeskrivning();
    if (m) m.setAttribute("content", oversattStrang(orgBeskr, lista));

    document.documentElement.lang = kod;
    aktuellt = kod;
    uppdateraLankar(kod);
    markeraFlaggor();
    document.documentElement.classList.remove("sprak-vantar");
  }

  /* Interna länkar får ?lang=… så att språket följer med mellan sidorna, även
     när sidan öppnas direkt från disken (då delar sidorna inte webbläsarminne). */
  function uppdateraLankar(kod) {
    document.querySelectorAll("a[href]").forEach(function (a) {
      var org = a.getAttribute("data-org-href");
      if (org === null) {
        org = a.getAttribute("href");
        if (!/^[^:?#]*\.html([?#]|$)/i.test(org)) return;   // bara egna .html-sidor
        a.setAttribute("data-org-href", org);
      }
      var hash = "", i = org.indexOf("#");
      if (i >= 0) { hash = org.slice(i); org = org.slice(0, i); }
      var bas = org.split("?")[0], q = org.indexOf("?") >= 0 ? org.slice(org.indexOf("?") + 1) : "";
      var p = new URLSearchParams(q);
      p.set("lang", kod);
      a.setAttribute("href", bas + "?" + p.toString() + hash);
    });
  }

  function byt(kod) {
    if (!giltig(kod)) return;
    sparaVal(kod);
    try {
      var u = new URL(window.location.href);
      if (u.searchParams.has("lang")) { u.searchParams.set("lang", kod); history.replaceState(null, "", u.href); }
    } catch (e) { /* gammal webbläsare */ }
    ladda(kod, function () { tillamp(kod); });
  }

  /* ---------- flaggorna ---------- */

  function byggFlaggor() {
    document.querySelectorAll("[data-sprakval]").forEach(function (yta) {
      yta.setAttribute("translate", "no");
      yta.setAttribute("role", "group");
      yta.setAttribute("aria-label", "Language / Språk / Мова");
      yta.innerHTML = SPRAK.map(function (s) {
        return '<button type="button" class="sprakval__knapp" data-sprak="' + s.kod + '" lang="' + s.kod +
               '" title="' + s.namn + '" aria-label="' + s.namn + '" aria-pressed="false">' + FLAGGOR[s.kod] + "</button>";
      }).join("");
      yta.addEventListener("click", function (e) {
        var k = e.target.closest("[data-sprak]");
        if (k) byt(k.getAttribute("data-sprak"));
      });
    });
    markeraFlaggor();
  }

  function markeraFlaggor() {
    document.querySelectorAll("[data-sprak]").forEach(function (k) {
      k.setAttribute("aria-pressed", k.getAttribute("data-sprak") === aktuellt ? "true" : "false");
    });
  }

  /* ---------- för verktyget verktyg/oversatt.mjs ---------- */

  function samla() {
    fangaHuvud();
    var ut = [], sett = {};
    var lagg = function (s) {
      var k = norm(s || "");
      if (k && harBokstav(k) && !sett[k]) { sett[k] = true; ut.push(k); }
    };
    lagg(orgTitel);
    lagg(orgBeskr);
    textnoder(function (n, org) { lagg(org); });
    attributnoder(function (el, a, org) { lagg(org); });
    return ut;
  }

  window.ArsanoSprak = {
    lagg: function (kod, lista) { ordlistor[kod] = lista || {}; },
    byt: byt,
    samla: samla,
    get aktuellt() { return aktuellt; }
  };

  /* ---------- start ---------- */

  if (window.ARSANO_SAMLA) return;          // verktyget samlar text, översätt inte

  var start = startsprak();
  if (start !== KALLA) {
    // Dölj sidan en kort stund så att svenskan inte blinkar förbi.
    document.documentElement.classList.add("sprak-vantar");
    setTimeout(function () { document.documentElement.classList.remove("sprak-vantar"); }, 1500);
    ladda(start, function () {});
  }

  var redo = function () {
    byggFlaggor();
    ladda(start, function () { tillamp(start); });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", redo);
  else redo();
})();
