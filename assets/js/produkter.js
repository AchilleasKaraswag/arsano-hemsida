/* ==========================================================================
   ARSANO — produktdata
   --------------------------------------------------------------------------
   Här ligger allt produktinnehåll. Lägg till en ny produkt genom att kopiera
   ett block nedan och fylla i fälten. Inget annat behöver ändras – både
   produktlistan och produktsidan läser från den här filen.

   Fält:
     id        unikt kortnamn, används i adressen (produkt.html?p=DITT-ID)
     namn      produktnamn
     kicker    kort undertitel, en rad
     status    "tillganglig" | "utveckling" | "kommande"
     accent    produktens accentfärg (hex)
     kort      kort beskrivning till produktkortet, 1–2 meningar
     ingress   längre inledning på produktsidan
     bild      sökväg till huvudbild (utelämna för produkter utan bild)
     punkter   [{rubrik, text}] – huvudegenskaper
     spec      [[etikett, värde]] – teknisk data
     anvandning[] och avsedd[] – listor på produktsidan
     galleri   [{bild, text}] – bildsekvens (valfritt)
     datablad  sökväg till PDF (valfritt)
     miljodatablad sökväg till miljödatablad i PDF (valfritt)
     publik    true = syns med egen produktsida.
               false = visas som platshållare, ingen detaljsida.
   ========================================================================== */

const PRODUKTER = [

  {
    id: "xmarkr",
    namn: "Xmarkr",
    kicker: "Modulärt luftburet mål",
    status: "tillganglig",
    accent: "#E9530A",
    publik: true,
    logotyp: "assets/img/xmarkr-logo.png",
    bild: "assets/img/xmarkr-hero.png",
    kort: "Luftburet mål för C-UAS- och skjututbildning. Vid träff frigörs ett högkontrastpulver som ger omedelbar visuell indikering – helt utan elektronik.",
    ingress: "Xmarkr är ett modulärt luftburet mål för realistisk C-UAS- och skjututbildning. Vid träff frigörs ett högkontrastpulver som ger en tydlig och omedelbar visuell indikering – helt utan elektronik eller sensorer. Systemet monteras utan specialverktyg och är utvecklat för låg logistisk belastning, hög driftsäkerhet och enkel återställning mellan övningsmoment.",

    punkter: [
      { rubrik: "Omedelbar träffindikering", text: "Pulvermolnet syns på avstånd och i realtid, vilket ger direkt feedback och effektivare utvärdering." },
      { rubrik: "Ingen elektronik eller batteri", text: "Rent mekanisk funktion. Fungerar i alla miljöer och är alltid redo." },
      { rubrik: "Verktygsfri montering", text: "Monteras på minuter i fält utan specialverktyg." },
      { rubrik: "Modulär och återanvändbar bas", text: "Endast förbrukningskomponenterna byts mellan övningsmoment." },
      { rubrik: "Låg logistisk belastning", text: "Kompakt, lätt och enkel att transportera och hantera." },
      { rubrik: "Miljöanpassade förbrukningsdelar", text: "Reducerad miljöpåverkan efter genomförd övning." }
    ],

    spec: [
      ["Totalmassa (utan motvikt)", "ca 420 g"],
      ["Totalmassa (inklusive motvikt)", "ca 620 g"],
      ["Markeringsbehållarens diameter", "Ø 40 mm"],
      ["Motviktens diameter", "Ø 30 mm"],
      ["Systemets totallängd", "ca 550 mm"],
      ["Målstrukturens diameter", "ca 500 mm"],
      ["Linlängd", "5 m (anpassningsbar)"],
      ["Höljesmaterial", "ABS / PA12 (3D-print)"],
      ["Markeringsmedium", "Högkontrastpulver (vitt)"],
      ["Linmaterial", "Dyneema® / PP"]
    ],

    galleri: [
      { bild: "assets/img/xmarkr-funktion.png", text: "01 Träff · 02 Frigöring · 03 Indikation" }
    ],

    datablad: "assets/dokument/Xmarkr-datablad.pdf",
    miljodatablad: "assets/dokument/Xmarkr-miljodatablad.pdf"
  },

  /* --- Platshållare för kommande produkter. Ta bort eller ersätt. --------- */
  {
    id: "kommande-a",
    namn: "Under utveckling",
    kicker: "Ej annonserad",
    status: "kommande",
    publik: false,
    kort: "Ytterligare system är under utveckling. Information lämnas när produkten annonseras."
  },

  {
    id: "kommande-b",
    namn: "Under utveckling",
    kicker: "Ej annonserad",
    status: "kommande",
    publik: false,
    kort: "Ytterligare system är under utveckling. Information lämnas när produkten annonseras."
  }

  /* --- Mall för ny produkt: kopiera, avkommentera och fyll i --------------
  ,{
    id: "produktnamn",
    namn: "Produktnamn",
    kicker: "Kort undertitel",
    status: "tillganglig",
    accent: "#0F1113",
    publik: true,
    bild: "assets/img/produktnamn.png",
    kort: "En eller två meningar till produktkortet.",
    ingress: "Längre inledande text på produktsidan.",
    punkter: [ { rubrik: "Egenskap", text: "Förklaring." } ],
    spec: [ ["Etikett", "Värde"] ],
    anvandning: [ "Användningsområde" ],
    avsedd: [ "Målgrupp" ],
    datablad: "assets/dokument/Produktnamn-datablad.pdf"
  }
  ------------------------------------------------------------------------ */

];

const STATUSTEXT = {
  tillganglig: "Tillgänglig",
  utveckling:  "Under utveckling",
  kommande:    "Ej annonserad"
};
