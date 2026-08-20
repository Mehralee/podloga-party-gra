/**
 * Automatically discovers all images inside:
 *
 *   /categories/<category>/<image>
 *
 * The `categories` folder is in the PROJECT ROOT.
 *
 * Example:
 *
 *   project/
 *   ├── categories/
 *   │   ├── airline/
 *   │   ├── cartoon/
 *   │   ├── chemistry/
 *   │   └── ...
 *   ├── src/
 *   └── package.json
 *
 * No files are copied, uploaded or duplicated.
 * Vite simply discovers and references the existing files.
 */

import type { Category, Question } from "./types";

interface CategoryConfig {
  name: string;
  hint: string;
}

/**
 * ---------------------------------------------------------
 * CATEGORY CONFIGURATION
 * ---------------------------------------------------------
 */

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  airline: {
    name: "Linie lotnicze",
    hint: "Podaj nazwę linii lotniczej",
  },

  cartoon: {
    name: "Postacie z kreskówek",
    hint: "Podaj imię postaci z kreskówki",
  },

  chemistry: {
    name: "Chemia",
    hint: "Podaj nazwę pierwiastka",
  },

  dogs: {
    name: "Rasy psów",
    hint: "Podaj rasę psa",
  },

  food: {
    name: "Jedzenie",
    hint: "Podaj nazwę potrawy",
  },

  footballer: {
    name: "Piłkarze",
    hint: "Podaj nazwisko piłkarza",
  },

  history: {
    name: "Historia",
    hint: "Podaj nazwę postaci historycznej",
  },

  instrument: {
    name: "Instrumenty muzyczne",
    hint: "Podaj nazwę instrumentu",
  },

  // IMPORTANT:
  // Your actual folder is "landrmarks", so we keep that spelling.
  landrmarks: {
    name: "Zabytki świata",
    hint: "Podaj kraj",
  },

  license: {
    name: "Tablice rejestracyjne",
    hint: "Podaj kraj",
  },

  logos: {
    name: "Logotypy",
    hint: "Podaj nazwę marki",
  },

  math: {
    name: "Matematyka",
    hint: "Rozwiąż równanie",
  },

  mirroredwords: {
    name: "Odbite słowa",
    hint: "Odczytaj odbite słowo",
  },

  money: {
    name: "Waluty",
    hint: "Podaj walutę lub kraj",
  },

  movie: {
    name: "Postacie filmowe",
    hint: "Podaj imię lub nazwisko postaci",
  },

  music: {
    name: "Muzyka",
    hint: "Podaj nazwisko artysty",
  },

  road: {
    name: "Znaki drogowe",
    hint: "Podaj znaczenie znaku",
  },

  sport: {
    name: "Sport",
    hint: "Podaj dyscyplinę sportową",
  },
};


/**
 * ---------------------------------------------------------
 * CUSTOM ANSWERS
 * ---------------------------------------------------------
 *
 * These override the automatic filename -> answer conversion.
 *
 * Only categories where we already have specific Polish
 * answers need to be listed here.
 */

const CUSTOM_ANSWERS: Record<string, Record<string, string>> = {
  /**
   * -------------------------------------------------------
   * CARTOON
   * -------------------------------------------------------
   */

  cartoon: {
    bambi: "Bambi",
    bugsbunny: "Królik Bugs",
    buzz: "Buzz Astral",
    cinderalla: "Kopciuszek",
    daffyduck: "Kaczor Daffy",
    donaldduck: "Kaczor Donald",
    fred: "Fred Kremowski",
    gadget: "Inspektor Gadżet",
    garfield: "Garfield",
    gargamel: "Gargamel",
    goofy: "Goofy",
    gumball: "Gumball",
    hellokitty: "Hello Kitty",
    homersimpson: "Homer Simpson",
    jbravo: "Johnny Bravo",
    krecik: "Krecik",
    kungfupanda: "Po (Kung Fu Panda)",
    mickymouse: "Myszka Miki",
    minion: "Minionek",
    minnie: "Myszka Minnie",
    mordecai: "Mordecai",
    mrbean: "Mister Bean",
    nemo: "Nemo",
    olaf: "Olaf",
    perry: "Dziobak Perry",
    pikachu: "Pikachu",
    pinkpanther: "Różowa Pantera",
    popeye: "Popeye",
    puss: "Kot w Butach",
    rapunzel: "Roszpunka",
    rick: "Rick Sanchez",
    roadrunner: "Struś Pędziwiatr",
    samuraijack: "Samuraj Jack",
    scoobydoo: "Scooby-Doo",
    shrek: "Shrek",
    simba: "Simba",
    spongebob: "SpongeBob Kanciastoporty",
    stitch: "Stitch",
    tabaluga: "Tabaluga",
    tomandjerry: "Tom i Jerry",
    toothless: "Szczerbatek",
    walle: "WALL-E",
    winniepooh: "Kubuś Puchatek",
  },


  /**
   * -------------------------------------------------------
   * DOGS
   * -------------------------------------------------------
   */

  dogs: {
    afghanhound: "Wyżeł afgański",
    anatolianshepherd: "Anatolijski pies pasterski",
    aussisheherd: "Owczarek australijski",
    bassethound: "Basset hound",
    beagle: "Beagle",
    bernese: "Berneński pies pasterski",
    bichon: "Bichon",
    boerboel: "Boerboel",
    bongo: "Bongo",
    bordercollie: "Border collie",
    boxer: "Bokser",
    bullterrier: "Bulterier",
    caucasianshepherd: "Owczarek kaukaski",
    cavalier: "Cavalier King Charles Spaniel",
    ccorso: "Cane Corso",
    chiuhaha: "Chihuahua",
    chowchow: "Chow chow",
    cockerspaniel: "Cocker spaniel",
    dalmatian: "Dalmatyńczyk",
    dane: "Dog niemiecki",
    doberman: "Doberman",
    dogoargentino: "Dogo argentino",
    englishbulldog: "Buldog angielski",
    englishmastiff: "Mastif angielski",
    frenchie: "Buldog francuski",
    german: "Owczarek niemiecki",
    golden: "Golden retriever",
    havanese: "Bichon habański",
    husky: "Husky syberyjski",
    jackrussel: "Jack Russell Terrier",
    jamnik: "Jamnik",
    komondor: "Komondor",
    labrador: "Labrador",
    "lhasa apso": "Lhasa Apso",
    malinois: "Malinois",
    maltese: "Maltańczyk",
    maltipoo: "Maltipoo",
    miniaturepinscher: "Pinczer miniaturowy",
    papillon: "Papillon",
    pekinczyk: "Pekińczyk",
    pitbull: "Pitbull",
    pomeranian: "Szpic miniaturowy",
    poodle: "Pudel",
    pug: "Mops",
    rotveiler: "Rottweiler",
    roughcollie: "Collie szkocki długowłosy",
    saintbernard: "Bernardyn",
    sharpei: "Shar Pei",
    shiba: "Shiba inu",
    sznaucer: "Sznaucer",
    york: "Yorkshire terrier",
  },


  /**
   * -------------------------------------------------------
   * LANDMARKS
   * -------------------------------------------------------
   */

  landrmarks: {
    Chile: "Chile",
    UK1: "Wielka Brytania",
    australia: "Australia",
    baku: "Azerbejdżan",
    belgium: "Belgia",
    bigben: "Wielka Brytania",
    brazil: "Brazylia",
    cambodia: "Kambodża",
    china: "Chiny",
    china2: "Chiny",
    china3: "Chiny",
    colosseum: "Włochy",
    egypt: "Egipt",
    eifel: "Francja",
    germany: "Niemcy",
    greece: "Grecja",
    india: "Indie",
    india1: "Indie",
    iran: "Iran",
    italy: "Włochy",
    italy1: "Włochy",
    japan: "Japonia",
    jordan: "Jordania",
    mexico: "Meksyk",
    mongolia: "Mongolia",
    nepal: "Nepal",
    norway: "Norwegia",
    poland: "Polska",
    poland3: "Polska",
    poland4: "Polska",
    poland5: "Polska",
    polandsopot: "Polska",
    russia: "Rosja",
    singapore: "Singapur",
    southafrica: "Republika Południowej Afryki",
    spain: "Hiszpania",
    spain1: "Hiszpania",
    tanzania: "Tanzania",
    turkey: "Turcja",
    turkey2: "Turcja",
    turkey3: "Turcja",
    uae: "Zjednoczone Emiraty Arabskie",
    uk: "Wielka Brytania",
    usa: "Stany Zjednoczone",
    usa1: "Stany Zjednoczone",
    usa2: "Stany Zjednoczone",
    wavel: "Polska",
  },


  /**
   * -------------------------------------------------------
   * LOGOS
   * -------------------------------------------------------
   */

  logos: {
    Amazon: "Amazon",
    Apple: "Apple",
    Converse: "Converse",
    Mastercard: "Mastercard",
    Masterchef: "Masterchef",
    Nike: "Nike",
    Notion: "Notion",
    Pringles: "Pringles",
    Telegram: "Telegram",
    Warnerbros: "Warner Bros.",

    airbnb: "Airbnb",
    allegro: "Allegro",
    android: "Android",
    auchan: "Auchan",
    "bank-polskie": "PKO Bank Polski",
    biedronka: "Biedronka",
    blik: "BLIK",
    bluetooth: "Bluetooth",
    booksy: "Booksy",
    bosch: "Bosch",
    bp: "BP",
    chanel: "Chanel",
    claude: "Claude",
    cropp: "Cropp",
    dominos: "Domino's Pizza",
    dpd: "DPD",
    dropbox: "Dropbox",
    duolingo: "Duolingo",
    empik: "Empik",
    f1: "Formuła 1",
    figma: "Figma",
    gemini: "Gemini",
    github: "GitHub",
    google: "Google",
    gucci: "Gucci",
    honda: "Honda",
    hp: "HP",
    hyundai: "Hyundai",
    ing: "ING",
    inpost: "InPost",
    intercity: "InterCity",
    kfc: "KFC",
    koleo: "Koleo",
    lacoste: "Lacoste",
    lewiatan: "Lewiatan",
    lg: "LG",
    linkedin: "LinkedIn",
    mcdonalds: "McDonald's",
    mediaexpert: "Media Expert",
    medicover: "Medicover",
    mercedes: "Mercedes-Benz",
    microsoft: "Microsoft",
    millenium: "Bank Millennium",
    minecraft: "Minecraft",
    mobywatel: "mObywatel",
    motorola: "Motorola",
    multisport: "MultiSport",
    netflix: "Netflix",
    netto: "Netto",
    nvidia: "NVIDIA",
    orange: "Orange",
    orlen: "Orlen",
    patreon: "Patreon",
    paypal: "PayPal",
    pekao: "Bank Pekao",
    pepsi: "Pepsi",
    pinterest: "Pinterest",
    playstation: "PlayStation",
    polsat: "Polsat",
    puma: "Puma",
    "red-bull": "Red Bull",
    revolut: "Revolut",
    rolex: "Rolex",
    rossman: "Rossmann",
    sephora: "Sephora",
    shell: "Shell",
    sims: "The Sims",
    slack: "Slack",
    spotify: "Spotify",
    stack: "Stack Overflow",
    starbucks: "Starbucks",
    steam: "Steam",
    stokrotka: "Stokrotka",
    swarowski: "Swarovski",
    tiktok: "TikTok",
    tinder: "Tinder",
    twitch: "Twitch",
    vinted: "Vinted",
    waze: "Waze",
    wikipedia: "Wikipedia",
    x: "X (Twitter)",
    zabka: "Żabka",
    znanylekarz: "ZnanyLekarz",
    zoom: "Zoom",
  },
};


/**
 * ---------------------------------------------------------
 * VITE IMAGE DISCOVERY
 * ---------------------------------------------------------
 *
 * This automatically finds EVERY image under:
 *
 *   /categories/
 *
 * including all subfolders.
 *
 * Nothing is copied or duplicated.
 */

const IMAGE_FILES = import.meta.glob(
  "/categories/**/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;


/**
 * ---------------------------------------------------------
 * HELPERS
 * ---------------------------------------------------------
 */

/**
 * Get filename from:
 *
 * /categories/footballer/robert_lewandowski_1.jpg
 *
 * -> robert_lewandowski_1.jpg
 */
function getFileName(filePath: string): string {
  return filePath.split("/").pop() ?? "";
}


/**
 * Get category folder from:
 *
 * /categories/footballer/robert_lewandowski_1.jpg
 *
 * -> footballer
 */
function getFolder(filePath: string): string {
  const parts = filePath.split("/");

  return parts[2] ?? "";
}


/**
 * Remove file extension.
 *
 * robert_lewandowski_1.jpg
 * -> robert_lewandowski_1
 */
function getStem(fileName: string): string {
  return fileName.replace(/\.[^./]+$/, "");
}


/**
 * Remove image-number suffix.
 *
 * robert_lewandowski_1
 * -> robert_lewandowski
 *
 * robert_lewandowski_2
 * -> robert_lewandowski
 *
 * beagle
 * -> beagle
 */
function cleanStem(stem: string): string {
  return stem.replace(/_\d+$/, "");
}


/**
 * Capitalize a word.
 */
function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}


/**
 * ---------------------------------------------------------
 * AUTOMATIC ANSWER GENERATION
 * ---------------------------------------------------------
 */

function automaticAnswer(
  category: string,
  fileName: string,
): string {
  const originalStem = getStem(fileName);
  const stem = cleanStem(originalStem);

  /**
   * First check custom answers.
   *
   * Example:
   *
   * cartoon/shrek.png
   * -> Shrek
   *
   * logos/mcdonalds.png
   * -> McDonald's
   */
  const customAnswer =
    CUSTOM_ANSWERS[category]?.[stem];

  if (customAnswer) {
    return customAnswer;
  }


  /**
   * -------------------------------------------------------
   * MATH
   * -------------------------------------------------------
   *
   * math_25.png
   * -> 25
   */
  if (category === "math") {
    return stem.replace(/^math_/, "");
  }


  /**
   * -------------------------------------------------------
   * MIRRORED WORDS
   * -------------------------------------------------------
   *
   * mirroredwords_banan.png
   * -> Banan
   */
  if (category === "mirroredwords") {
    const word = stem.replace(
      /^mirroredwords_/,
      "",
    );

    if (!word) {
      return stem;
    }

    return (
      word.charAt(0).toUpperCase() +
      word.slice(1)
    );
  }


  /**
   * -------------------------------------------------------
   * LICENSE PLATES
   * -------------------------------------------------------
   *
   * plate_poland_2.jpg
   * -> Poland
   *
   * plate_new_zealand_2.jpg
   * -> New Zealand
   */
  if (category === "license") {
    return stem
      .replace(/^plate_/, "")
      .split("_")
      .map(capitalize)
      .join(" ");
  }


  /**
   * -------------------------------------------------------
   * GENERAL CASE
   * -------------------------------------------------------
   *
   * robert_lewandowski_1.jpg
   * -> Robert Lewandowski
   *
   * acoustic_guitar_1.jpg
   * -> Acoustic Guitar
   *
   * boxing_2.jpg
   * -> Boxing
   */
  return stem
    .split("_")
    .map(capitalize)
    .join(" ");
}


/**
 * ---------------------------------------------------------
 * BUILD QUESTION
 * ---------------------------------------------------------
 */

function buildQuestion(
  category: string,
  filePath: string,
): Question {
  const fileName = getFileName(filePath);
  const stem = getStem(fileName);

  /**
   * Vite should have a URL for every file returned
   * by import.meta.glob().
   *
   * TypeScript correctly warns that an indexed object
   * access can technically return undefined.
   *
   * So we explicitly check it here.
   */

  const imageUrl = IMAGE_FILES[filePath];

  if (!imageUrl) {
    throw new Error(
      `Image URL not found for file: ${filePath}`,
    );
  }

  return {
    id: `${category}__${stem}`,

    imageId: imageUrl,

    fileName,

    answer: automaticAnswer(
      category,
      fileName,
    ),
  };
}


/**
 * ---------------------------------------------------------
 * BUILD CATEGORIES
 * ---------------------------------------------------------
 */

function buildCategories(): Category[] {
  /**
   * Group discovered image paths by folder.
   */
  const grouped: Record<string, string[]> = {};


  for (const filePath of Object.keys(IMAGE_FILES)) {
    const category = getFolder(filePath);

    if (!category) {
      continue;
    }

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(filePath);
  }


  /**
   * Convert each folder into a Category object.
   */
  return Object.entries(grouped)
    .sort(([a], [b]) =>
      a.localeCompare(b),
    )
    .map(([category, files]) => {
      /**
       * Use configured Polish category name
       * when available.
       */
      const config =
        CATEGORY_CONFIG[category];


      /**
       * If a new folder is added later and isn't
       * configured above, generate a readable name.
       *
       * Example:
       *
       * famousplaces
       * -> Famousplaces
       */
      const name =
        config?.name ??
        category
          .split(/[_-]/)
          .map(capitalize)
          .join(" ");


      const hint =
        config?.hint ??
        "Podaj odpowiedź";


      /**
       * Sort files alphabetically so the ordering
       * is stable.
       */
      const sortedFiles = [...files].sort(
        (a, b) =>
          a.localeCompare(b),
      );


      /**
       * Build all questions.
       */
      const questions = sortedFiles.map(
        (filePath) =>
          buildQuestion(
            category,
            filePath,
          ),
      );


      return {
        id: category,

        name,

        hint,

        questions,
      };
    });
}


/**
 * ---------------------------------------------------------
 * EXPORT
 * ---------------------------------------------------------
 */

export const HARDCODED_CATEGORIES: Category[] =
  buildCategories();