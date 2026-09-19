/* ==========================================================================
   ARSANO — gemensamt skript
   Mobilmeny, utfällbar produktmeny och produktsida.
   ========================================================================== */

(function () {
  "use strict";

  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  /* ---------- mobilmeny ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const meny = document.querySelector(".meny");
  if (toggle && meny) {
    toggle.addEventListener("click", function () {
      const open = meny.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Stäng" : "Meny";
    });
  }

  /* ======================================================================
     Produktmenyn
     Fälls ut vid hover på pekdon med muspekare (ren CSS) och vid klick
     eller tangentbord, så att den fungerar även på pekskärm.
     ====================================================================== */

  const meny_panel = document.querySelector("[data-produktmeny]");
  if (meny_panel && typeof PRODUKTER !== "undefined") {
    const publika = PRODUKTER.filter((p) => p.publik);
    const ovriga = PRODUKTER.filter((p) => !p.publik);

    let html = publika.map(function (p) {
      return `<a href="produkt.html?p=${encodeURIComponent(p.id)}">
                <b>${esc(p.namn)}</b>
                <span>${esc(p.kicker || "")}</span>
              </a>`;
    }).join("");

    if (ovriga.length) {
      html += `<div class="drop__streck"></div>`;
      html += `<span class="drop__last">
                 <b>Fler system</b>
                 <span>Under utveckling – ej annonserade</span>
               </span>`;
    }
    meny_panel.innerHTML = html;
  }

  document.querySelectorAll("[data-meny]").forEach(function (punkt) {
    const knapp = punkt.querySelector(".meny__lank");
    if (!knapp) return;

    knapp.addEventListener("click", function (e) {
      e.preventDefault();
      const open = punkt.classList.toggle("is-open");
      knapp.setAttribute("aria-expanded", String(open));
    });

    punkt.addEventListener("mouseenter", function () {
      knapp.setAttribute("aria-expanded", "true");
    });
    punkt.addEventListener("mouseleave", function () {
      punkt.classList.remove("is-open");
      knapp.setAttribute("aria-expanded", "false");
    });
  });

  // klick utanför eller Escape stänger
  document.addEventListener("click", function (e) {
    document.querySelectorAll("[data-meny].is-open").forEach(function (punkt) {
      if (!punkt.contains(e.target)) {
        punkt.classList.remove("is-open");
        const k = punkt.querySelector(".meny__lank");
        if (k) k.setAttribute("aria-expanded", "false");
      }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll("[data-meny].is-open").forEach(function (punkt) {
      punkt.classList.remove("is-open");
      const k = punkt.querySelector(".meny__lank");
      if (k) { k.setAttribute("aria-expanded", "false"); k.focus(); }
    });
  });

  /* ======================================================================
     Produktsida — byggs från produkter.js utifrån ?p= i adressen
     ====================================================================== */

  const sida = document.querySelector("[data-produktsida]");
  if (sida && typeof PRODUKTER !== "undefined") {
    const id = new URLSearchParams(window.location.search).get("p");
    const p = PRODUKTER.find((x) => x.id === id && x.publik);

    if (!p) {
      sida.innerHTML = `
        <section class="section">
          <div class="wrap">
            <p class="eyebrow">Produkt</p>
            <h1>Produkten kunde inte hittas</h1>
            <p class="lead">Adressen pekar inte mot någon publicerad produkt.</p>
            <p><a class="btn" href="index.html">Till startsidan <span class="btn__arrow">&rarr;</span></a></p>
          </div>
        </section>`;
    } else {
      document.title = p.namn + " – Arsano";
      sida.style.setProperty("--product-accent", p.accent || "#0F1113");

      const punkter = (p.punkter || [])
        .map((b) => `<li><strong>${esc(b.rubrik)}</strong> – ${esc(b.text)}</li>`).join("");

      const spec = (p.spec || [])
        .map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("");

      const galleri = (p.galleri || [])
        .map((g) => `<figure><img src="${esc(g.bild)}" alt="${esc(g.text)}" loading="lazy">
                     <figcaption>${esc(g.text)}</figcaption></figure>`).join("");

      const lista = (rubrik, poster) =>
        poster && poster.length
          ? `<div><p class="eyebrow">${esc(rubrik)}</p>
               <ul class="taglist">${poster.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`
          : "";

      sida.innerHTML = `
        <section class="pagehead">
          <div class="wrap">
            <p class="eyebrow">Produkt${p.status && typeof STATUSTEXT !== "undefined" ? " / " + esc(STATUSTEXT[p.status]) : ""}</p>
            <h1>${esc(p.namn)}</h1>
            <p>${esc(p.kicker || "")}</p>
          </div>
        </section>

        <section class="section">
          <div class="wrap">
            <div class="product-hero">
              <div>
                ${p.logotyp ? `<img class="product-logo" src="${esc(p.logotyp)}" alt="${esc(p.namn)}">` : ""}
                <p class="lead">${esc(p.ingress || p.kort || "")}</p>
                ${p.datablad ? `
                <div class="download" style="margin-top:1.8rem">
                  <div>
                    <strong>Datablad ${esc(p.namn)}</strong>
                    <div class="download__meta">PDF &middot; A4 &middot; svenska</div>
                  </div>
                  <a class="btn" href="${esc(p.datablad)}" download>
                    Ladda ner <span class="btn__arrow">&darr;</span>
                  </a>
                </div>` : ""}
                ${p.miljodatablad ? `
                <div class="download" style="margin-top:.8rem">
                  <div>
                    <strong>Miljödatablad ${esc(p.namn)}</strong>
                    <div class="download__meta">PDF &middot; A4 &middot; svenska</div>
                  </div>
                  <a class="btn" href="${esc(p.miljodatablad)}" download>
                    Ladda ner <span class="btn__arrow">&darr;</span>
                  </a>
                </div>` : ""}
              </div>
              ${p.bild ? `<div class="product-hero__media"><img src="${esc(p.bild)}" alt="${esc(p.namn)}"></div>` : ""}
            </div>
          </div>
        </section>

        ${punkter ? `
        <section class="section section--paper">
          <div class="wrap">
            <div class="section__head">
              <p class="eyebrow">Egenskaper</p>
              <h2>Konstruerad för fältbruk</h2>
            </div>
            <ul class="bullets grid grid--2">${punkter}</ul>
          </div>
        </section>` : ""}

        ${galleri ? `
        <section class="section">
          <div class="wrap">
            <div class="section__head">
              <p class="eyebrow">Funktion</p>
              <h2>Så fungerar det</h2>
            </div>
            <div class="gallery${(p.galleri || []).length === 1 ? " gallery--enkel" : ""}">${galleri}</div>
          </div>
        </section>` : ""}

        ${spec ? `
        <section class="section section--paper">
          <div class="wrap">
            <div class="grid grid--2">
              <div>
                <p class="eyebrow">Teknisk data</p>
                <table class="spec"><tbody>${spec}</tbody></table>
              </div>
              <div class="grid" style="gap:2rem; align-content:start">
                ${lista("Användningsområden", p.anvandning)}
                ${lista("Avsedd för", p.avsedd)}
              </div>
            </div>
          </div>
        </section>` : ""}`;
    }
  }

  /* ---------- toppraden blir mörk när man rullat förbi hjältebilden ---------- */
  const topbar = document.querySelector("[data-topbar]");
  const hjalte = document.querySelector(".hero-start");
  if (topbar && hjalte) {
    let vantar = false;
    const uppdatera = function () {
      const grans = hjalte.offsetHeight - topbar.offsetHeight - 40;
      topbar.classList.toggle("is-stuck", window.scrollY > Math.max(grans, 40));
      vantar = false;
    };
    window.addEventListener("scroll", function () {
      if (!vantar) { vantar = true; window.requestAnimationFrame(uppdatera); }
    }, { passive: true });
    window.addEventListener("resize", uppdatera);
    uppdatera();
  }

  /* ---------- årtal i sidfoten ---------- */
  document.querySelectorAll("[data-ar]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
