/**
 * Hardcoded category pool for the game. Photos live as static files under
 * `public/categories/<folder>/<file>` and are referenced directly by URL —
 * there is no upload/delete UI anymore.
 *
 * Displayed answers are Polish. Proper nouns without a natural Polish
 * equivalent (brand logos, characters with no dubbed name) are kept as-is
 * on purpose — a literal translation would just be wrong/confusing there.
 */
import type { Category, Question } from "./types";

interface CategoryDef {
  key: string;
  folder: string;
  name: string;
  hint: string;
  files: string[];
  /** file stem (no extension) -> Polish answer to display. */
  answers: Record<string, string>;
}

const CARTOON_ANSWERS: Record<string, string> = {
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
};

const DOGS_ANSWERS: Record<string, string> = {
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
};

const LANDMARK_ANSWERS: Record<string, string> = {
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
};

// Brand names are proper nouns — kept as the brand actually spells itself,
// just normalized in casing where the file name was all-lowercase.
const LOGO_ANSWERS: Record<string, string> = {
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
};

function mathAnswers(files: string[]): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const file of files) {
    const stem = file.replace(/\.[^./]+$/, "");
    answers[stem] = stem.replace(/^math_/, "");
  }
  return answers;
}

// Mirrored-word photos are already Polish nouns — just capitalize them.
function mirroredWordAnswers(files: string[]): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const file of files) {
    const stem = file.replace(/\.[^./]+$/, "");
    const word = stem.replace(/^mirroredwords_/, "");
    answers[stem] = word[0]!.toUpperCase() + word.slice(1).toLowerCase();
  }
  return answers;
}

const MATH_FILES = [
  "math_0.png", "math_1.png", "math_10.png", "math_100.png", "math_103.png",
  "math_104.png", "math_105.png", "math_108.png", "math_11.png", "math_111.png",
  "math_113.png", "math_116.png", "math_119.png", "math_12.png", "math_120.png",
  "math_121.png", "math_122.png", "math_13.png", "math_135.png", "math_14.png",
  "math_141.png", "math_144.png", "math_145.png", "math_147.png", "math_15.png",
  "math_16.png", "math_162.png", "math_169.png", "math_17.png", "math_170.png",
  "math_177.png", "math_18.png", "math_186.png", "math_19.png", "math_2.png",
  "math_20.png", "math_207.png", "math_21.png", "math_212.png", "math_22.png",
  "math_221.png", "math_23.png", "math_24.png", "math_247.png", "math_25.png",
  "math_26.png", "math_27.png", "math_28.png", "math_29.png", "math_3.png",
  "math_30.png", "math_31.png", "math_32.png", "math_33.png", "math_34.png",
  "math_35.png", "math_36.png", "math_37.png", "math_38.png", "math_39.png",
  "math_4.png", "math_40.png", "math_42.png", "math_43.png", "math_44.png",
  "math_45.png", "math_5.png", "math_50.png", "math_51.png", "math_54.png",
  "math_55.png", "math_56.png", "math_58.png", "math_6.png", "math_62.png",
  "math_63.png", "math_64.png", "math_66.png", "math_7.png", "math_70.png",
  "math_71.png", "math_72.png", "math_73.png", "math_75.png", "math_76.png",
  "math_78.png", "math_8.png", "math_80.png", "math_81.png", "math_82.png",
  "math_83.png", "math_84.png", "math_88.png", "math_9.png", "math_90.png",
  "math_91.png", "math_94.png", "math_95.png", "math_96.png", "math_98.png",
];

const MIRRORED_WORDS_FILES = [
  "mirroredwords_autobus.png", "mirroredwords_banan.png", "mirroredwords_burger.png",
  "mirroredwords_buty.png", "mirroredwords_chleb.png", "mirroredwords_chmura.png",
  "mirroredwords_ciasto.png", "mirroredwords_cukier.png", "mirroredwords_czapka.png",
  "mirroredwords_czekolada.png", "mirroredwords_deszcz.png", "mirroredwords_dlugopis.png",
  "mirroredwords_dom.png", "mirroredwords_drzewo.png", "mirroredwords_drzwi.png",
  "mirroredwords_film.png", "mirroredwords_gora.png", "mirroredwords_gra.png",
  "mirroredwords_gwiazda.png", "mirroredwords_herbata.png", "mirroredwords_jablko.png",
  "mirroredwords_jezioro.png", "mirroredwords_kawa.png", "mirroredwords_komputer.png",
  "mirroredwords_kon.png", "mirroredwords_koszula.png", "mirroredwords_kot.png",
  "mirroredwords_krowa.png", "mirroredwords_krzeslo.png", "mirroredwords_ksiazka.png",
  "mirroredwords_ksiezyc.png", "mirroredwords_kuchnia.png", "mirroredwords_kurtka.png",
  "mirroredwords_kwiat.png", "mirroredwords_lampa.png", "mirroredwords_las.png",
  "mirroredwords_lazienka.png", "mirroredwords_lew.png", "mirroredwords_lody.png",
  "mirroredwords_lyzka.png", "mirroredwords_malpa.png", "mirroredwords_milosc.png",
  "mirroredwords_mleko.png", "mirroredwords_morze.png", "mirroredwords_motocykl.png",
  "mirroredwords_muzyka.png", "mirroredwords_mysz.png", "mirroredwords_nauczyciel.png",
  "mirroredwords_noz.png", "mirroredwords_ogien.png", "mirroredwords_ogorek.png",
  "mirroredwords_ogrod.png", "mirroredwords_okno.png", "mirroredwords_okulary.png",
  "mirroredwords_olowek.png", "mirroredwords_pieniadze.png", "mirroredwords_pieprz.png",
  "mirroredwords_pies.png", "mirroredwords_pilka.png", "mirroredwords_pizza.png",
  "mirroredwords_plaza.png", "mirroredwords_plecak.png", "mirroredwords_pociag.png",
  "mirroredwords_podroz.png", "mirroredwords_pomidor.png", "mirroredwords_portfel.png",
  "mirroredwords_praca.png", "mirroredwords_przyjaciel.png", "mirroredwords_ptak.png",
  "mirroredwords_rodzina.png", "mirroredwords_rower.png", "mirroredwords_ryba.png",
  "mirroredwords_rzeka.png", "mirroredwords_samochod.png", "mirroredwords_samolot.png",
  "mirroredwords_ser.png", "mirroredwords_sklep.png", "mirroredwords_slon.png",
  "mirroredwords_slonce.png", "mirroredwords_snieg.png", "mirroredwords_sol.png",
  "mirroredwords_spodnie.png", "mirroredwords_sport.png", "mirroredwords_stol.png",
  "mirroredwords_student.png", "mirroredwords_sypialnia.png", "mirroredwords_szczescie.png",
  "mirroredwords_szef.png", "mirroredwords_szkola.png", "mirroredwords_szpital.png",
  "mirroredwords_talerz.png", "mirroredwords_telefon.png", "mirroredwords_telewizor.png",
  "mirroredwords_tygrys.png", "mirroredwords_ulica.png", "mirroredwords_wakacje.png",
  "mirroredwords_wiatr.png", "mirroredwords_widelec.png", "mirroredwords_woda.png",
  "mirroredwords_zegarek.png", "mirroredwords_ziemniak.png",
];

const CATEGORY_DEFS: CategoryDef[] = [
  {
    key: "cartoon",
    folder: "cartoon",
    name: "Postacie z kreskówek",
    hint: "Podaj imię postaci z kreskówki",
    files: Object.keys(CARTOON_ANSWERS).map((stem) =>
      stem === "tomandjerry" ? `${stem}.jpg` : `${stem}.png`,
    ),
    answers: CARTOON_ANSWERS,
  },
  {
    key: "dogs",
    folder: "dogs",
    name: "Rasy psów",
    hint: "Podaj rasę psa",
    files: Object.keys(DOGS_ANSWERS).map((stem) =>
      stem === "anatolianshepherd" ? `${stem}.jpg` : `${stem}.png`,
    ),
    answers: DOGS_ANSWERS,
  },
  {
    key: "food",
    folder: "food",
    name: "Jedzenie",
    hint: "Podaj nazwę potrawy",
    files: ["pierogi.png"],
    answers: { pierogi: "Pierogi" },
  },
  {
    key: "landmarks",
    folder: "landrmarks",
    name: "Zabytki świata",
    hint: "Podaj kraj",
    files: Object.keys(LANDMARK_ANSWERS).map((stem) => `${stem}.png`),
    answers: LANDMARK_ANSWERS,
  },
  {
    key: "logos",
    folder: "logos",
    name: "Logotypy",
    hint: "Podaj nazwę marki",
    files: Object.keys(LOGO_ANSWERS).map((stem) =>
      stem === "rossman" ? `${stem}.png` : `${stem}.png`,
    ),
    answers: LOGO_ANSWERS,
  },
  {
    key: "math",
    folder: "math",
    name: "Matematyka",
    hint: "Rozwiąż równanie",
    files: MATH_FILES,
    answers: mathAnswers(MATH_FILES),
  },
  {
    key: "mirroredwords",
    folder: "mirroredwords",
    name: "Odbite słowa",
    hint: "Odczytaj odbite słowo",
    files: MIRRORED_WORDS_FILES,
    answers: mirroredWordAnswers(MIRRORED_WORDS_FILES),
  },
];

function fileStem(fileName: string): string {
  return fileName.replace(/\.[^./]+$/, "");
}

function buildQuestion(def: CategoryDef, fileName: string): Question {
  const stem = fileStem(fileName);

  return {
    id: `${def.key}__${stem}`,
    imageId: `/categories/${def.folder}/${encodeURIComponent(fileName)}`,
    fileName,
    answer: def.answers[stem] ?? stem,
  };
}

function buildCategory(def: CategoryDef): Category {
  return {
    id: def.key,
    name: def.name,
    hint: def.hint,
    questions: def.files.map((fileName) => buildQuestion(def, fileName)),
  };
}

export const HARDCODED_CATEGORIES: Category[] = CATEGORY_DEFS.map(buildCategory);
