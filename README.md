# Arsano – webbplats

Statisk webbplats i ren HTML, CSS och JavaScript. Inget bygg­steg, inget ramverk och
ingen server­kod – filerna kan laddas upp som de är till valfritt webbhotell.

## Innehåll

```
index.html              Startsida – logotyp, slogan och Om oss-innehållet under
produkt.html            Produktsida, byggs från produktdata (produkt.html?p=xmarkr)
assets/css/style.css    All formgivning
assets/js/produkter.js  ← ALLT PRODUKTINNEHÅLL LIGGER HÄR
assets/js/app.js        Meny, utfällbar produktlista, produktsida
assets/img/             Logotyper och produktbilder
assets/dokument/        Datablad (PDF)
```

Startsidan börjar med enbart logotypen och sloganen i helskärm. Rullar man ned fortsätter
sidan med Om oss – verksamhet, principer, grundare och kontaktuppgifter. Raden högst upp är
genomskinlig över logotypen och blir mörk med en liten logotyp så fort man rullat förbi.

Enda länken i menyn är **Produkter**, som fälls ut vid hover på dator och vid tryck på
mobil. Varje produkt leder till en egen sida, och därifrån tar man sig tillbaka genom att
klicka på logotypen uppe till vänster.

**Sloganen** står i `index.html` (klassen `start-slogan`).

## Lägga till en produkt

Öppna `assets/js/produkter.js` och lägg till ett block i listan. Längst ned i filen finns
en färdig mall att kopiera. Produkten dyker automatiskt upp i produktmenyn och får en egen
sida – ingen HTML behöver ändras.

Viktiga fält:

| Fält | Betydelse |
|---|---|
| `id` | Kortnamn utan mellanslag. Blir adressen: `produkt.html?p=DITT-ID` |
| `publik` | `true` ger en egen produktsida och en post i produktmenyn. `false` göms i menyn bakom raden "Fler system – under utveckling" |
| `status` | `"tillganglig"`, `"utveckling"` eller `"kommande"` |
| `accent` | Produktens färg, syns som en tunn rad överst på produktkortet |
| `spec` | Lista med `["Etikett", "Värde"]` som blir tabellen Teknisk data |
| `datablad` | Sökväg till PDF. Utelämna fältet om datablad saknas |
| `miljodatablad` | Sökväg till miljödatablad i PDF. Ger en andra nedladdningsknapp under databladet. Utelämna fältet om det saknas |

Produkter som inte är annonserade lämnar du kvar som `publik: false`. De syns då bara som
en gråad rad i menyn, vilket signalerar att portföljen växer utan att avslöja något.

Bilder lägger du i `assets/img/` och datablad i `assets/dokument/`.

## Innan publicering

Följande behöver fyllas i – sök efter hakparenteser i filerna:

- `index.html`, avsnittet Kontakt – telefonnummer, organisationsnummer och säte
- `assets/dokument/Xmarkr-miljodatablad.pdf` – filen som ligger där nu är en platshållare
  och behöver bytas mot det riktiga miljödatabladet. Sökvägen är densamma, så ingen kod
  behöver ändras.

Gå också igenom texterna på startsidan och under Allmän info. De är skrivna utifrån den
konstruktionsfilosofi som framgår av Xmarkr-databladet och bör läsas igenom så att de
stämmer med hur du själv vill beskriva verksamheten. Ingen text innehåller påståenden om
certifieringar, referenskunder eller årtal – lägg bara till sådant du kan styrka.

## Publicering

- **GitHub Pages** – lägg mappen i ett repo, aktivera Pages under Settings → Pages.
- **Netlify / Cloudflare Pages** – dra och släpp mappen i webbgränssnittet.
- **Vanligt webbhotell** – ladda upp hela mappen med FTP.

Ingen av sidorna kräver HTTPS-specifika funktioner, men använd HTTPS ändå.

## Typsnitt

Rubriker och brödtext använder Inter, som hämtas från Google Fonts. Om besökaren är offline
eller om du tar bort `<link>`-taggen faller sidan tillbaka på systemets standardtypsnitt
(San Francisco, Segoe UI, Roboto) och ser fortfarande bra ut. Vill du slippa externa anrop
helt kan du ladda ned Inter och lägga in det som `@font-face` i `style.css`.

## Logotypen

Tre varianter finns i `assets/img/`:

- `arsano-mark.png` – vit cirkel med svart ordbild, genomskinlig utanför cirkeln. Används i
  sidhuvud och sidfot, det vill säga mot mörk bakgrund.
- `arsano-mark-ink.png` – enbart de svarta strecken, genomskinlig bakgrund. För ljusa ytor,
  tryck och dokument.
- `favicon.png` – flikikon.

Alla tre är genererade ur originalbilden i 512 px. Har du logotypen som vektor (SVG eller
AI) är det värt att byta ut dem – då blir märket knivskarpt i alla storlekar.

## Att tänka på framöver

- Menyn ligger i både `index.html` och `produkt.html`. Lägger du till en menypost behöver du
  göra det på båda ställena.
- Om oss nås direkt via `index.html#om-oss` – praktiskt att länka till i mejl.
- Vill du ha ett kontaktformulär i stället för e-postlänkar går det att koppla in Formspree
  eller Netlify Forms – de tar emot inskick utan att du behöver egen server.
