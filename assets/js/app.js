/* ==========================================================================
   ARSANO — gemensamt skript
   Produktkort på startsidan, produktsida och toppraden.
   ========================================================================== */

(function () {
  "use strict";

  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  /* ======================================================================
     Produktkort på startsidan
     Varje publik produkt blir ett klickbart kort som leder till sin
     produktsida. Ej annonserade produkter slås ihop till ett gråat kort.
     ====================================================================== */

  const kortyta = document.querySelector("[data-produktkort]");
  if (kortyta && typeof PRODUKTER !== "undefined") {
    const publika = PRODUKTER.filter((p) => p.publik);
    const ovriga = PRODUKTER.filter((p) => !p.publik);
    const statustext = (s) =>
      typeof STATUSTEXT !== "undefined" && STATUSTEXT[s] ? STATUSTEXT[s] : "";

    let html = publika.map(function (p) {
      return `<a class="card" href="produkt.html?p=${encodeURIComponent(p.id)}">
                <div class="card__accent" style="background:${esc(p.accent || "#0F1113")}"></div>
                <div class="card__media">
                  ${p.bild
                    ? `<img src="${esc(p.bild)}" alt="${esc(p.namn)}" loading="lazy">`
                    : `<span class="card__media--empty">Bild saknas</span>`}
                </div>
                <div class="card__body">
                  ${statustext(p.status) ? `<span class="badge${p.status === "tillganglig" ? " badge--live" : ""}">${esc(statustext(p.status))}</span>` : ""}
                  <span class="card__kicker">${esc(p.kicker || "")}</span>
                  <h3>${esc(p.namn)}</h3>
                  <p>${esc(p.kort || "")}</p>
                  <span class="card__foot">Läs mer <span aria-hidden="true">&rarr;</span></span>
                </div>
              </a>`;
    }).join("");

    if (ovriga.length) {
      html += `<div class="card card--kommande">
                 <div class="card__accent"></div>
                 <div class="card__media card__media--empty">Under utveckling</div>
                 <div class="card__body">
                   <span class="badge">Ej annonserade</span>
                   <span class="card__kicker">Kommande</span>
                   <h3>Fler system</h3>
                   <p>Ytterligare system är under utveckling. Information lämnas när de annonseras.</p>
                 </div>
               </div>`;
    }
    kortyta.innerHTML = html;
  }

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

  /* ---------- toppraden krymper med bandet och blir mörk när det passerats ---------- */
  const topbar = document.querySelector("[data-topbar]");
  const hjalte = document.querySelector(".hero-start");
  if (topbar && hjalte) {
    const STUCK = 60;                               // samma som --bar-stuck i style.css
    let vantar = false;
    const uppdatera = function () {
      const kvar = hjalte.offsetHeight - window.scrollY;
      topbar.style.setProperty("--bar-h", Math.max(kvar, STUCK) + "px");
      topbar.classList.toggle("is-stuck", kvar <= STUCK);
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
