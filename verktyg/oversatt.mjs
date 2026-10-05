#!/usr/bin/env node
/* ==========================================================================
   ARSANO — automatisk översättning
   --------------------------------------------------------------------------
   Läser alla sidor precis som en webbläsare gör (även det som byggs från
   produkter.js), samlar ihop varje svensk text och översätter ENBART det
   som är nytt eller ändrat. Resultatet hamnar i assets/sprak/en.js och
   assets/sprak/uk.js.

   - Befintliga översättningar rörs inte. Rättar du en översättning för hand
     i en språkfil ligger rättelsen kvar så länge den svenska texten är
     densamma.
   - Text som inte längre finns på sidan städas bort ur språkfilerna.

   Körs automatiskt av GitHub (.github/workflows/oversatt.yml) vid varje
   push. Vill du köra det själv:

     cd verktyg
     npm install                 (första gången)
     ANTHROPIC_API_KEY=... node oversatt.mjs
       eller
     DEEPL_API_KEY=... node oversatt.mjs

   Flaggor:
     --kontroll   översätt inget, visa bara vad som saknas (avslutar med fel om något saknas)
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM, ResourceLoader, VirtualConsole } from "jsdom";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPRAKMAPP = path.join(ROT, "assets", "sprak");
const MALSPRAK = {
  en: { namn: "English (British spelling)", deepl: "EN-GB" },
  uk: { namn: "Ukrainian", deepl: "UK" }
};
const KONTROLL = process.argv.includes("--kontroll");

/* ---------- 1. samla svensk text från alla sidor ---------- */

class BaraLokalt extends ResourceLoader {
  fetch(url, opt) {
    if (!url.startsWith("file:")) return Promise.resolve(Buffer.from(""));   // Google Fonts m.m.
    return super.fetch(url, opt);
  }
}

async function lasSida(fil, query = "") {
  const url = pathToFileURL(path.join(ROT, fil)).href + query;
  const tyst = new VirtualConsole();
  tyst.on("jsdomError", (e) => { if (!/Could not parse CSS|Not implemented/.test(e.message)) console.warn("  !", fil + query, e.message); });
  const dom = await JSDOM.fromFile(path.join(ROT, fil), {
    url,
    runScripts: "dangerously",
    resources: new BaraLokalt(),
    pretendToBeVisual: true,
    virtualConsole: tyst,
    beforeParse(win) { win.ARSANO_SAMLA = true; }
  });
  await new Promise((r) => dom.window.addEventListener("load", r));
  return dom.window;
}

async function samlaAllt() {
  const sidor = fs.readdirSync(ROT).filter((f) => f.endsWith(".html")).sort((a, b) =>
    a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b));
  const ut = [], sett = new Set();
  const lagg = (lista) => lista.forEach((s) => { if (!sett.has(s)) { sett.add(s); ut.push(s); } });

  let produktId = [];
  for (const fil of sidor) {
    const win = await lasSida(fil);
    if (!win.ArsanoSprak) { console.warn(`  ${fil} laddar inte sprak.js – hoppar över`); win.close(); continue; }
    lagg(win.ArsanoSprak.samla());
    if (!produktId.length) {
      try { produktId = win.eval("typeof PRODUKTER !== 'undefined' ? PRODUKTER.filter(p => p.publik).map(p => p.id) : []"); } catch { /* ingen produktdata */ }
    }
    win.close();
  }
  // Produktsidan byggs utifrån ?p=, så den läses en gång per produkt (plus "hittades inte").
  if (sidor.includes("produkt.html")) {
    for (const q of [...produktId.map((id) => "?p=" + encodeURIComponent(id)), "?p=__saknas__"]) {
      const win = await lasSida("produkt.html", q);
      lagg(win.ArsanoSprak.samla());
      win.close();
    }
  }
  return ut;
}

/* ---------- 2. läsa och skriva språkfilerna ---------- */

function lasOrdlista(kod) {
  const fil = path.join(SPRAKMAPP, kod + ".js");
  if (!fs.existsSync(fil)) return {};
  const txt = fs.readFileSync(fil, "utf8");
  const start = txt.indexOf("{", txt.indexOf("lagg("));
  const slut = txt.lastIndexOf("}");
  try {
    return JSON.parse(txt.slice(start, slut + 1));
  } catch (e) {
    throw new Error(`Kunde inte läsa ${path.relative(ROT, fil)} – har ett citattecken eller kommatecken blivit fel vid en handredigering?\n${e.message}`);
  }
}

function skrivOrdlista(kod, strangar, lista) {
  const ordnad = {};
  for (const s of strangar) if (lista[s]) ordnad[s] = lista[s];   // samma ordning som på sidan
  const huvud =
`/* ==========================================================================
   ARSANO — ${MALSPRAK[kod].namn.replace(/ \(.*\)/, "")} (${kod})
   Svensk text -> översättning. Filen fylls i automatiskt av verktyg/oversatt.mjs.
   Du får rätta en översättning för hand – den ligger kvar så länge den
   svenska texten är oförändrad. Rör inte texten till vänster om kolonet.
   ========================================================================== */
`;
  fs.mkdirSync(SPRAKMAPP, { recursive: true });
  fs.writeFileSync(path.join(SPRAKMAPP, kod + ".js"),
    huvud + `ArsanoSprak.lagg(${JSON.stringify(kod)}, ${JSON.stringify(ordnad, null, 2)});\n`);
}

/* ---------- 3. översättningsmotorer ---------- */

const SAMMANHANG =
  "The texts come from the website of ARSANO AB, a Swedish company that develops and manufactures " +
  "training equipment for the defence sector, mainly airborne targets for counter-UAS (C-UAS) and " +
  "live-fire training against drones. Readers are military customers, procurement officers and instructors.";

async function viaClaude(strangar, kod) {
  const modell = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
  const system =
    `You translate website texts from Swedish into ${MALSPRAK[kod].namn}. ${SAMMANHANG}\n` +
    "Rules:\n" +
    "- Use correct, idiomatic defence-industry terminology and a factual, professional tone. Keep it as short as the original.\n" +
    "- Never translate the names ARSANO, Arsano, ARSANO AB, Xmarkr, or place names such as Uppsala. Keep trademarks such as Dyneema® as is.\n" +
    "- Keep numbers, symbols (Ø, ®, ·, /, –) and abbreviations such as C-UAS, ABS, PA12, PDF, A4 exactly. Write units of measurement the way the target language normally does (Ukrainian: г, мм, м).\n" +
    "- Translate 'ca' as the target language's normal abbreviation for 'approximately'.\n" +
    "- Short labels (headings, buttons, table labels) stay short labels. Keep the original capitalisation style (e.g. title-case vs sentence case as in the source).\n" +
    "- Reply with ONLY a JSON array of strings: the translations in the same order as the input, one per input item.";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: modell,
      max_tokens: 16000,
      system,
      messages: [{ role: "user", content: JSON.stringify(strangar, null, 1) }]
    })
  });
  if (!res.ok) throw new Error(`Claude-API svarade ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const json = text.slice(text.indexOf("["), text.lastIndexOf("]") + 1);
  const ut = JSON.parse(json);
  if (!Array.isArray(ut) || ut.length !== strangar.length) throw new Error("Claude returnerade fel antal översättningar");
  return ut;
}

async function viaDeepL(strangar, kod) {
  const nyckel = process.env.DEEPL_API_KEY;
  const vard = nyckel.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const res = await fetch(vard + "/v2/translate", {
    method: "POST",
    headers: { "Authorization": "DeepL-Auth-Key " + nyckel, "content-type": "application/json" },
    body: JSON.stringify({ text: strangar, source_lang: "SV", target_lang: MALSPRAK[kod].deepl, context: SAMMANHANG })
  });
  if (!res.ok) throw new Error(`DeepL svarade ${res.status}: ${await res.text()}`);
  return (await res.json()).translations.map((t) => t.text);
}

async function oversatt(strangar, kod) {
  const motor = process.env.ANTHROPIC_API_KEY ? viaClaude : process.env.DEEPL_API_KEY ? viaDeepL : null;
  if (!motor) throw new Error("Ingen API-nyckel. Sätt ANTHROPIC_API_KEY eller DEEPL_API_KEY.");
  const ut = [];
  for (let i = 0; i < strangar.length; i += 40) ut.push(...await motor(strangar.slice(i, i + 40), kod));
  return ut;
}

/* ---------- 4. kör ---------- */

const strangar = await samlaAllt();
console.log(`${strangar.length} svenska texter hittade.`);

let saknasTotalt = 0;
for (const kod of Object.keys(MALSPRAK)) {
  const lista = lasOrdlista(kod);
  const saknas = strangar.filter((s) => !lista[s]);
  const gamla = Object.keys(lista).filter((s) => !strangar.includes(s));
  saknasTotalt += saknas.length;

  console.log(`\n[${kod}] ${saknas.length} att översätta, ${gamla.length} gamla att ta bort.`);
  saknas.forEach((s) => console.log("  + " + s.slice(0, 90)));
  gamla.forEach((s) => console.log("  - " + s.slice(0, 90)));
  if (KONTROLL) continue;

  if (saknas.length) {
    const nya = await oversatt(saknas, kod);
    saknas.forEach((s, i) => { lista[s] = nya[i]; });
  }
  if (saknas.length || gamla.length) skrivOrdlista(kod, strangar, lista);
}

if (KONTROLL && saknasTotalt) process.exit(1);
console.log("\nKlart.");
