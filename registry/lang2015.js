// @ts-check
// Copyright © 2026 Dan Dyar. Licensed under CC BY-NC-SA 4.0 (see LICENSE-DATA and LICENSING.md).
// Published equations and values belong to the cited paper; this entry's curation, notes and checks are covered here.
// Lang 2015 (ASE/EACVI chamber quantification guideline), Table 14: "Aortic root
// dimensions in normal adults", by sex, absolute (cm) and indexed to BSA (cm/m²), for
// the annulus, sinuses of Valsalva, STJ and proximal ascending aorta. Transcribed as
// published. The guideline never says what the ± values are; its source, Roman 1989
// (Am J Cardiol 64:507-512) Table III, gives the same numbers as mean ± 1 SD (note plus-minus).
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
// Model IDs: <site>-bsa (mean ratio × BSA, SD scaled the same way) and <site>-abs
// (absolute: sex only, no body size or age). The absolute models were drafted in 0.1.0,
// removed in 0.2.0, and added back in 0.4.0 as the unadjusted comparison (Dan,
// 2026-11-20: show when absolute values fail, beside the size-adjusted references).

/** @type {any} */
export default {
  schema: 1,
  id: "lang2015",
  label: "ASE/EACVI 2015",
  entryVersion: "0.4.2",
  changelog: [
    { version: "0.1.0", date: "2026-11-15", by: "Claude", change: "Initial draft from PDF (Table 14)" },
    { version: "0.2.0", date: "2026-11-15", by: "Claude", change: "Removed the 4 absolute (sex-only) models at Dan's request: the site moves beyond absolute values. BSA-indexed models unchanged." },
    { version: "0.3.0", date: "2026-11-15", by: "Dan Dyar", change: "Reviewed against the paper: 4 of 4 models, all tests passing; agrees with values and notes" },
    { version: "0.4.0", date: "2026-11-20", by: "Claude", change: "Added the 4 absolute (sex-only) Table 14 models as caution, at Dan's request: the unadjusted comparison. New notes no-body-size and plus-minus; rounding note extended; bsa-ratio now applies to the BSA models only. BSA-indexed models unchanged." },
    { version: "0.4.1", date: "2026-11-21", by: "Dan Dyar", change: "Reviewed against the paper: 8 of 8 models (the 4 absolute models in this review, the 4 BSA-indexed already cleared), 7/7 tests passing; unadjusted values correct as reviewed" },
    { version: "0.4.2", date: "2026-11-21", by: "Claude", change: "Checked Table 14 against its source, Roman 1989 (Dan's copy): Table 14 is Roman's Table III, and Roman's Methods give mean ± 1 SD. Note plus-minus now says so; new notes roman-limits and roman-aao. No values changed." },
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

    // ── Table 14, absolute values (cm): one sex-specific range, no body size or age ──
    {
      id: "annulus-abs", label: "ASE/EACVI 2015 annulus, absolute", status: "caution",
      measurement: { site: "annulus", units: "cm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis", edgeNote: "Hinge points of the aortic leaflets", phaseNote: "Peak systole (Figure 10)" },
      mean: { type: "constant", value: { male: 2.6, female: 2.3 }, source: "Table 14 (annulus, absolute)" },
      sd:   { type: "constant", value: { male: 0.3, female: 0.2 }, source: "Table 14 (annulus, absolute)" },
      dist: "normal", validity: {},
    },
    {
      id: "sov-abs", label: "ASE/EACVI 2015 sinuses of Valsalva, absolute", status: "caution",
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 3.4, female: 3.0 }, source: "Table 14 (sinuses of Valsalva, absolute)" },
      sd:   { type: "constant", value: { male: 0.3, female: 0.3 }, source: "Table 14 (sinuses of Valsalva, absolute)" },
      dist: "normal", validity: {},
    },
    {
      id: "stj-abs", label: "ASE/EACVI 2015 STJ, absolute", status: "caution",
      measurement: { site: "stj", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 2.9, female: 2.6 }, source: "Table 14 (sinotubular junction, absolute)" },
      sd:   { type: "constant", value: { male: 0.3, female: 0.3 }, source: "Table 14 (sinotubular junction, absolute)" },
      dist: "normal", validity: {},
    },
    {
      id: "aao-abs", label: "ASE/EACVI 2015 proximal ascending aorta, absolute", status: "caution",
      measurement: { site: "aao", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal ascending aorta; level not defined (the guideline asks for the distance from the annular plane to be reported)" },
      mean: { type: "constant", value: { male: 3.0, female: 2.7 }, source: "Table 14 (proximal ascending aorta, absolute)" },
      sd:   { type: "constant", value: { male: 0.4, female: 0.4 }, source: "Table 14 (proximal ascending aorta, absolute)" },
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
      text: "A guideline table that recommends against its own use: the same document says the sinus of Valsalva diameter \"should be compared with age- and BSA-related nomograms or to values calculated from specific allometric equations\" (section IV), and reprints the Roman nomograms (Figure 13) for that purpose. Table 14 has neither age nor an allometric body-size term. It is shown here because many labs still report against it, so it can be compared with the references that do. Both columns are shown: the indexed values, and the absolute (sex-only) values as the unadjusted comparison.",
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
      id: "no-body-size",
      appliesTo: { match: "-abs$" },
      severity: "important",
      text: "No body-size or age term: one normal range for every man or woman, whatever their size. It overcalls dilation in large patients and misses it in small ones. Shown as the unadjusted comparison, so you can see where a sex-only limit and the size-adjusted references disagree.",
    },
    {
      id: "plus-minus",
      appliesTo: "all",
      severity: "important",
      text: "The guideline never says what the ± values are: not in the table, its caption or the text. Its source does: Table 14 is Table III of Roman et al. (Am J Cardiol 1989), whose Methods give means ± 1 SD (the guideline renames Roman's supraaortic ridge the sinotubular junction). The upper limit of normal is then mean + 1.96 SD (about 4.0 cm for men's sinuses of Valsalva), not mean + 1 SD: \"3.4 ± 0.3 cm\" is not a normal range of 3.1 to 3.7 cm.",
    },
    {
      id: "roman-limits",
      appliesTo: { match: "^(annulus|sov|stj)-abs$" },
      severity: "info",
      text: "Roman 1989 gives its own sex-specific upper limits (Table IV; absolute: annulus 3.1 cm men, 2.6 women; sinuses 4.0, 3.6; supraaortic ridge 3.6, 3.2), chosen for 96–100% specificity rather than as mean + 1.96 SD. They agree with this site's mean + 1.96 SD limits to about 0.1 cm (the sinuses to 0.01 cm). The same paper found the sex difference disappears once diameters are indexed to BSA (Table III), and that body size and age, not sex, are the main determinants of aortic size.",
    },
    {
      id: "roman-aao",
      appliesTo: { match: "^aao-" },
      severity: "important",
      text: "Roman 1989 gave no upper limit for the proximal ascending aorta, because of its striking dependence on age. The guideline table carries the mean ± SD anyway, with no age term.",
    },
    {
      id: "bsa-ratio",
      appliesTo: { match: "-bsa$" },
      severity: "important",
      text: "Predicted = the mean ratio × the patient's BSA (DuBois), and the SD is scaled the same way. Dividing a diameter by BSA overcorrects for body size (Mirea 2013, Table 5; Oxborough 2014 found an exponent nearer BSA^0.6 than BSA^1), so these z-scores run low in large and high in small patients.",
    },
    {
      id: "rounding",
      appliesTo: "all",
      severity: "info",
      text: "Values are printed to 0.1 cm (0.1 cm/m² when indexed). For the indexed SDs (0.1 to 0.3 cm/m²) that rounding alone is worth up to ±50% of the SD at the annulus and ±25% at the other levels. For the absolute SDs (0.2 to 0.4 cm) it is worth ±12 to ±25%, enough to move an absolute upper limit by about 1 mm either way.",
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
    {
      kind: "paper", source: "Table 14 men, sinuses of Valsalva, absolute: 3.4 ± 0.3 cm (the same for every man)",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      expect: { "sov-abs": { pred: 3.4 } },
      tol: { pred: 0.0001 },
    },
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-20: men's SoV 3.4 ± 0.3 cm; ULN 3.4 + 1.96 × 0.3 = 3.988; z = (3.8 − 3.4) / 0.3 = 1.333; same at any height",
      input: { sex: "male", age: 70, height_cm: 195, weight_kg: 110 },
      y: { sov: 3.8 },
      expect: { "sov-abs": { pred: 3.4, z: 1.3333, uln: 3.988 } },
      tol: { pred: 0.0001, z: 0.001, uln: 0.0002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-20: women's annulus 2.3 ± 0.2 cm; ULN 2.3 + 1.96 × 0.2 = 2.692",
      input: { sex: "female", age: 30, height_cm: 150, weight_kg: 45 },
      expect: { "annulus-abs": { pred: 2.3, uln: 2.692 } },
      tol: { pred: 0.0001, uln: 0.0002 },
    },
  ],

  verification: {
    status: "reviewed",
    reviewedBy: "Dan Dyar",
    date: "2026-11-21",
    against: "J Am Soc Echocardiogr 2015;28:1-39.e14: Table 14; Figure 10; section IV (aortic root)",
    summary: "8 of 8 models checked against the paper (4 BSA-indexed on 2026-11-15, 4 absolute on 2026-11-21); 7/7 tests passing (3 paper, 4 arithmetic). Agrees with values and notes. Table 14 checked against its source, Roman 1989 Table III (mean ± 1 SD), on 2026-11-21 (notes in 0.4.2 await review).",
  },
};
