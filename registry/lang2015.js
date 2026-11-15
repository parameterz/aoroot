// @ts-check
// Lang 2015 (ASE/EACVI chamber quantification guideline), Table 14: "Aortic root
// dimensions in normal adults", mean ± SD by sex, absolute (cm) and indexed to BSA
// (cm/m²; used here), for the annulus, sinuses of Valsalva, STJ and proximal ascending aorta.
// Transcribed as published.
//
// Secondary data: the table is "adapted from Roman et al. (ref. 195) and Hiratzka et al.
// (ref. 204)". No population, n, age range or BSA formula is given; DuBois is assumed
// (Roman 1989 used it). The table does not state a convention, so each level is mapped
// to the guideline's own recommendation (Figure 10, section IV): annulus inner edge
// (hinge points) at peak systole; SoV, STJ and proximal ascending aorta leading edge at
// end-diastole.
//
// Included as the guideline table many labs still report against, so it can be seen
// next to the references with age and body-size models. Every model is `caution`.
//
// Model IDs: <site>-bsa (mean ratio × BSA, SD scaled the same way).
// Not used: the absolute (cm) columns, sex only with no body size or age (Dan, 2026-11-15:
// the site moves beyond absolute values; drafted in 0.1.0, removed in 0.2.0).

/** @type {any} */
export default {
  schema: 1,
  id: "lang2015",
  label: "ASE/EACVI 2015",
  entryVersion: "0.2.0",
  changelog: [
    { version: "0.1.0", date: "2026-11-15", by: "Claude", change: "Initial draft from PDF (Table 14)" },
    { version: "0.2.0", date: "2026-11-15", by: "Claude", change: "Removed the 4 absolute (sex-only) models at Dan's request: the site moves beyond absolute values. BSA-indexed models unchanged." },
  ],

  citation: {
    authors: "Lang RM, Badano LP, Mor-Avi V, Afilalo J, Armstrong A, Ernande L, Flachskampf FA, Foster E, Goldstein SA, Kuznetsova T, Lancellotti P, Muraru D, Picard MH, Rietzschel ER, Rudski L, Spencer KT, Tsang W, Voigt JU",
    title: "Recommendations for cardiac chamber quantification by echocardiography in adults: an update from the American Society of Echocardiography and the European Association of Cardiovascular Imaging",
    journal: "J Am Soc Echocardiogr",
    year: 2015,
    volume: 28,
    pages: "1-39.e14",
    doi: "10.1016/j.echo.2014.10.003",
    pmid: 25559473,
  },

  population: {
    n: null, // not given: Table 14 is adapted from earlier sources
    female: null,
    age: { range: [null, null], mean: null, sd: null },
    height: { range: [null, null] },
    bsa: { range: [null, null], formula: "dubois" }, // assumed; the guideline does not say
    composition: [],
    region: "Not stated (secondary data)",
    inclusion: "\"Normal adults\" (Table 14 title). Adapted from Roman et al. (ref. 195) and Hiratzka et al. (ref. 204); no other details given.",
    exclusion: "Not stated.",
    source: "Table 14 and footnote",
  },

  models: [

    // ── Table 14, indexed values (cm/m²): predicted = ratio × BSA, SD scaled the same way ──
    {
      id: "annulus-bsa", label: "ASE/EACVI 2015 annulus, BSA-indexed", status: "caution",
      measurement: { site: "annulus", units: "cm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis", edgeNote: "Hinge points of the aortic leaflets", phaseNote: "Peak systole (Figure 10)" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.3, female: 1.3 } }], source: "Table 14 (annulus, indexed)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 0.1, female: 0.1 } }], source: "Table 14 (annulus, indexed)" },
      dist: "normal", validity: {},
    },
    {
      id: "sov-bsa", label: "ASE/EACVI 2015 sinuses of Valsalva, BSA-indexed", status: "caution",
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.7, female: 1.8 } }], source: "Table 14 (sinuses of Valsalva, indexed)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 0.2, female: 0.2 } }], source: "Table 14 (sinuses of Valsalva, indexed)" },
      dist: "normal", validity: {},
    },
    {
      id: "stj-bsa", label: "ASE/EACVI 2015 STJ, BSA-indexed", status: "caution",
      measurement: { site: "stj", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.5, female: 1.5 } }], source: "Table 14 (sinotubular junction, indexed)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 0.2, female: 0.2 } }], source: "Table 14 (sinotubular junction, indexed)" },
      dist: "normal", validity: {},
    },
    {
      id: "aao-bsa", label: "ASE/EACVI 2015 proximal ascending aorta, BSA-indexed", status: "caution",
      measurement: { site: "aao", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal ascending aorta; level not defined (the guideline asks for the distance from the annular plane to be reported)" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.5, female: 1.6 } }], source: "Table 14 (proximal ascending aorta, indexed)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 0.2, female: 0.3 } }], source: "Table 14 (proximal ascending aorta, indexed)" },
      dist: "normal", validity: {},
    },

  ],

  definitions: {
    ulnZ: 1.96, // the table gives mean ± SD only; no limit is defined
    bands: [],
    source: "Table 14 gives mean ± SD only; no upper limit of normal is defined",
  },

  notes: [
    {
      id: "against-own-use",
      appliesTo: "all",
      severity: "important",
      text: "A guideline table that recommends against its own use: the same document says the sinus of Valsalva diameter \"should be compared with age- and BSA-related nomograms or to values calculated from specific allometric equations\" (section IV), and reprints the Roman nomograms (Figure 13) for that purpose. Table 14 has neither age nor an allometric body-size term. It is shown here because many labs still report against it, so it can be compared with the references that do. The table's absolute (sex-only) values are not used.",
    },
    {
      id: "secondary-source",
      appliesTo: "all",
      severity: "important",
      text: "Secondary data: Table 14 is \"adapted from\" Roman et al. (ref. 195, the 1989 data behind the Figure 13 nomograms) and Hiratzka et al. (ref. 204). The guideline gives no sample size, age range, BSA formula or measurement convention for the table. Conventions here follow the guideline's own recommendations (annulus inner edge at peak systole; other levels leading edge at end-diastole), and DuBois BSA is assumed.",
    },
    {
      id: "no-age",
      appliesTo: "all",
      severity: "important",
      text: "No age term. Aortic size increases with age at every level above the annulus (about 1 mm per decade at the sinuses in Devereux 2012 and Mirea 2013), so these z-scores run high in older and low in younger adults.",
    },
    {
      id: "bsa-ratio",
      appliesTo: "all",
      severity: "important",
      text: "Predicted = the mean ratio × the patient's BSA (DuBois), and the SD is scaled the same way. Dividing a diameter by BSA overcorrects for body size (Mirea 2013, Table 5; Oxborough 2014 found an exponent nearer BSA^0.6 than BSA^1), so these z-scores run low in large and high in small patients.",
    },
    {
      id: "rounding",
      appliesTo: "all",
      severity: "info",
      text: "Values are printed to 0.1 cm (0.1 cm/m² when indexed). For the indexed SDs (0.1 to 0.3 cm/m²) that rounding alone is worth up to ±50% of the SD at the annulus and ±25% at the other levels.",
    },
    {
      id: "wase-comparison",
      appliesTo: { match: "^(annulus|sov|stj)-" },
      severity: "info",
      text: "WASE (Patel 2022), with 1,585 healthy adults from many countries, found mean annulus, sinus and STJ dimensions several millimetres smaller than these guideline values in both sexes, absolute and indexed to BSA.",
    },
    {
      id: "aao-level",
      appliesTo: { match: "^aao-" },
      severity: "info",
      text: "The level of the \"proximal ascending aorta\" is not defined for Table 14; the guideline asks that the distance from the annular plane be reported with the measurement.",
    },
  ],

  tests: [
    {
      kind: "paper", source: "Table 14 men, sinuses of Valsalva, indexed: 1.7 cm/m²; at BSA 1.8481 → 3.1418 cm",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      expect: { "sov-bsa": { pred: 3.1418 } },
      tol: { pred: 0.0002 },
    },
    {
      kind: "paper", source: "Table 14 women, proximal ascending aorta, indexed: 1.6 cm/m²; at BSA 1.6221 → 2.5953 cm",
      input: { sex: "female", age: 65, height_cm: 160, weight_kg: 60 },
      expect: { "aao-bsa": { pred: 2.5953 } },
      tol: { pred: 0.0002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-15: BSA 1.8481; 1.7 × BSA, SD 0.2 × BSA; z = (4.0 − 3.1418) / 0.3696",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      y: { sov: 4.0 },
      expect: { "sov-bsa": { pred: 3.1418, z: 2.322, uln: 3.8663 } },
      tol: { pred: 0.0002, z: 0.001, uln: 0.0002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-15: BSA 1.6221; 1.3 × BSA, SD 0.1 × BSA",
      input: { sex: "female", age: 65, height_cm: 160, weight_kg: 60 },
      expect: { "annulus-bsa": { pred: 2.1087, uln: 2.4266 } },
      tol: { pred: 0.0002, uln: 0.0002 },
    },
  ],

  verification: {
    status: "draft",
    reviewedBy: null,
    date: null,
    against: "J Am Soc Echocardiogr 2015;28:1-39.e14: Table 14; Figure 10; section IV (aortic root)",
  },
};
