// @ts-check
// Copyright © 2026 Dan Dyar. Licensed under CC BY-NC-SA 4.0 (see LICENSE-DATA and LICENSING.md).
// Published equations and values belong to the cited paper; this entry's curation, notes and checks are covered here.
// MATEAR (Carrero 2025): 1,000 healthy Argentine adults, 53 echo laboratories, offline
// confirmation by two readers. Transcribed as published from Table 2: mean ± SD and
// 97.5th percentile by sex, as absolute diameter (cm) and indexed to BSA (cm/m²,
// DuBois) and height (cm/m), at six levels.
//
// Indexed models: predicted = mean ratio × BSA or height, SD scaled the same way
// (as for WASE and ASE/EACVI 2015). No age term; no age strata.
// Conventions as stated (Methods, Figure 1): annulus inner edge mid-systole; SoV, STJ and
// proximal tubular ascending aorta (1 cm above the STJ) leading edge end-diastole. These
// are the site's default conventions.
//
// Model IDs: <site>-<abs|bsa|ht>. The absolute (abs) models were suppressed until 0.3.0
// and are shown since then, marked caution, as the unadjusted comparison (Dan,
// 2026-11-20). They also carry the paper's only printed z-scores (the `paper` tests).
// Not used: aortic arch and descending aorta rows (not sites on this site).

/** @type {any} */
export default {
  schema: 1,
  id: "carrero2025",
  label: "MATEAR (Carrero 2025)",
  entryVersion: "0.3.0",
  changelog: [
    { version: "0.1.0", date: "2026-11-15", by: "Claude", change: "Initial draft from PDF (Table 2; Methods; Results)" },
    { version: "0.2.0", date: "2026-11-15", by: "Dan Dyar", change: "Reviewed against the paper: 12 of 12 models, all tests passing; agrees with values and notes" },
    { version: "0.3.0", date: "2026-11-20", by: "Claude", change: "Absolute (cm) Table 2 models shown as caution, at Dan's request: the unadjusted comparison beside the size-adjusted references. Values unchanged; note abs-suppressed replaced by no-body-size." },
  ],

  citation: {
    authors: "Carrero MC, Matta MG, Constantin I, Masson G, Asch FM; MATEAR study group",
    title: "Sex-specific considerations in defining aortic dilation: findings from the MATEAR study",
    journal: "Arch Cardiol Mex",
    year: 2025,
    volume: 95,
    pages: "171-177",
    doi: "10.24875/ACM.24000185",
    pmid: null,
  },

  population: {
    n: 1000,
    female: 0.553, // 553 of 1,000
    age: { range: [null, null], mean: 38.3, sd: 12.7 }, // range not stated; Table 1 gives SD 12.9; few > 65 y
    height: { range: [null, null] },                    // women 161.5 ± 6.0, men 174.6 ± 7.7 cm (Table 1)
    bsa: { range: [null, null], formula: "dubois" },
    // Results: "553 were females (56.7% Caucasian, 38.3% Native Americans)"; the abstract
    // says the majority of the cohort was Caucasian or Native American, so read as whole-cohort.
    composition: [
      { group: "Caucasian, 56.7%", n: null },
      { group: "Native American, 38.3%", n: null },
    ],
    region: "Argentina: 53 accredited echocardiography laboratories of the Argentine Society of Cardiology; enrolled Feb 2018 to Jun 2019",
    inclusion: "Consecutive apparently healthy adults with complete aortic measurements from annulus to proximal tubular ascending aorta.",
    exclusion: "Hypertension, history of major cardiovascular risk factors, thoracic aortic aneurysm, any aortic stenosis or regurgitation, previous cardiac surgery, pregnancy, family history of genetic aortopathy or bicuspid valve, competitive athletes, smokers. Obesity not excluded (mean BMI 26.4).",
    source: "Materials and methods; Results; Table 1",
  },

  models: [

    // ── Annulus: inner edge, mid-systole ──
    {
      id: "annulus-abs", label: "MATEAR annulus, absolute", status: "caution",
      measurement: { site: "annulus", units: "cm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 2.12, female: 1.93 }, source: "Table 2 (annulus, cm)" },
      sd:   { type: "constant", value: { male: 0.20, female: 0.18 }, source: "Table 2 (annulus, cm)" },
      dist: "normal", validity: {},
    },
    {
      id: "annulus-ht", label: "MATEAR annulus, height-indexed", status: "ok",
      measurement: { site: "annulus", units: "cm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 1.22, female: 1.19 } }], source: "Table 2 (annulus/height, cm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 0.10, female: 0.11 } }], source: "Table 2 (annulus/height, cm/m)" },
      dist: "normal", validity: {},
    },
    {
      id: "annulus-bsa", label: "MATEAR annulus, BSA-indexed", status: "ok",
      measurement: { site: "annulus", units: "cm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.07, female: 1.13 } }], source: "Table 2 (annulus/BSA, cm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 0.11, female: 0.13 } }], source: "Table 2 (annulus/BSA, cm/m²)" },
      dist: "normal", validity: {},
    },

    // ── Sinuses of Valsalva: leading edge, end-diastole ──
    {
      id: "sov-abs", label: "MATEAR SoV, absolute", status: "caution",
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 3.11, female: 2.77 }, source: "Table 2 (sinus, cm)" },
      sd:   { type: "constant", value: { male: 0.38, female: 0.34 }, source: "Table 2 (sinus, cm)" },
      dist: "normal", validity: {},
    },
    {
      id: "sov-ht", label: "MATEAR SoV, height-indexed", status: "ok",
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 1.78, female: 1.72 } }], source: "Table 2 (sinus/height, cm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 0.21, female: 0.21 } }], source: "Table 2 (sinus/height, cm/m)" },
      dist: "normal", validity: {},
    },
    {
      id: "sov-bsa", label: "MATEAR SoV, BSA-indexed", status: "ok",
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.56, female: 1.62 } }], source: "Table 2 (sinus/BSA, cm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 0.21, female: 0.24 } }], source: "Table 2 (sinus/BSA, cm/m²)" },
      dist: "normal", validity: {},
    },

    // ── Sinotubular junction: leading edge, end-diastole ──
    {
      id: "stj-abs", label: "MATEAR STJ, absolute", status: "caution",
      measurement: { site: "stj", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 2.74, female: 2.45 }, source: "Table 2 (STJ, cm)" },
      sd:   { type: "constant", value: { male: 0.37, female: 0.31 }, source: "Table 2 (STJ, cm)" },
      dist: "normal", validity: {},
    },
    {
      id: "stj-ht", label: "MATEAR STJ, height-indexed", status: "ok",
      measurement: { site: "stj", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 1.57, female: 1.52 } }], source: "Table 2 (STJ/height, cm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 0.21, female: 0.19 } }], source: "Table 2 (STJ/height, cm/m)" },
      dist: "normal", validity: {},
    },
    {
      id: "stj-bsa", label: "MATEAR STJ, BSA-indexed", status: "ok",
      measurement: { site: "stj", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.38, female: 1.43 } }], source: "Table 2 (STJ/BSA, cm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 0.20, female: 0.21 } }], source: "Table 2 (STJ/BSA, cm/m²)" },
      dist: "normal", validity: {},
    },

    // ── Proximal tubular ascending aorta (1 cm above the STJ): leading edge, end-diastole ──
    {
      id: "aao-abs", label: "MATEAR ascending aorta, absolute", status: "caution",
      measurement: { site: "aao", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm above the STJ" },
      mean: { type: "constant", value: { male: 2.88, female: 2.65 }, source: "Table 2 (ascending, cm)" },
      sd:   { type: "constant", value: { male: 0.36, female: 0.35 }, source: "Table 2 (ascending, cm)" },
      dist: "normal", validity: {},
    },
    {
      id: "aao-ht", label: "MATEAR ascending aorta, height-indexed", status: "ok",
      measurement: { site: "aao", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm above the STJ" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 1.65, female: 1.64 } }], source: "Table 2 (ascending/height, cm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 0.20, female: 0.21 } }], source: "Table 2 (ascending/height, cm/m)" },
      dist: "normal", validity: {},
    },
    {
      id: "aao-bsa", label: "MATEAR ascending aorta, BSA-indexed", status: "ok",
      measurement: { site: "aao", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm above the STJ" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.45, female: 1.54 } }], source: "Table 2 (ascending/BSA, cm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 0.19, female: 0.22 } }], source: "Table 2 (ascending/BSA, cm/m²)" },
      dist: "normal", validity: {},
    },

  ],

  definitions: {
    ulnZ: 1.96,
    bands: [],
    source: "Statistical analysis: reference values = 2.5th–97.5th percentile, ULN = 97.5th percentile (printed in Table 2). Limits here are mean ± 1.96 SD; see note uln-definition.",
  },

  notes: [
    {
      id: "no-body-size",
      appliesTo: { match: "-abs$" },
      severity: "important",
      text: "No body-size or age term: one normal range for every man or woman, whatever their size. It overcalls dilation in large patients and misses it in small ones. Shown as the unadjusted comparison (it also carries the paper's own z-score examples), so you can see where a sex-only limit and the size-adjusted references disagree.",
    },
    {
      id: "no-age",
      appliesTo: "all",
      severity: "important",
      text: "No age term and no age groups. The cohort was young (mean 38 ± 13 years) and the authors had difficulty enrolling people over 65 who met the exclusion criteria; the age range is not stated. Above the annulus, aortic size rises with age (about 1 mm per decade at the sinuses in Devereux 2012 and Mirea 2013), so these z-scores probably run high in older and low in younger adults, and are least reliable over 65.",
    },
    {
      id: "ratio-assumption",
      appliesTo: { match: "-(bsa|ht)$" },
      severity: "info",
      text: "Indexing to height or BSA assumes diameter is proportional to body size (exponent 1). Predicted values are the sex-specific mean ratio × the patient's height or BSA (DuBois), and the SD is scaled the same way.",
    },
    {
      id: "bsa-overcorrects",
      appliesTo: { match: "-bsa$" },
      severity: "important",
      text: "Dividing a diameter by BSA overcorrects for body size (Mirea 2013, Table 5; Oxborough 2014 found an exponent nearer BSA^0.6), so BSA-indexed z-scores run low in large and high in small patients. This cohort was not lean (mean BMI 26.4; obesity not excluded). The paper's own result shows the effect: women had smaller height-indexed but larger BSA-indexed sinus and STJ diameters than men.",
    },
    {
      id: "uln-definition",
      appliesTo: { match: "-(abs|bsa|ht)$" },
      severity: "info",
      text: "The paper defines the upper limit of normal as the 97.5th percentile and prints it in Table 2 alongside mean ± SD. Limits shown here are mean ± 1.96 SD. Checked for all 24 rows used: mean + 1.96 SD lies 0.00 to 0.07 below the printed 97.5th percentile in 23 rows (a slightly long upper tail), and 0.005 above it in one (annulus/BSA, women). At the sinuses that is up to about 1 mm, so these limits are a little stricter than the paper's.",
    },
    {
      id: "z25-uln",
      appliesTo: { match: "^sov-" },
      severity: "info",
      text: "The abstract and Results also give a women's sinus ULN of 3.62 cm \"correlating with a Z-score of 2.5\" (2.77 + 2.5 × 0.34, absolute values). That differs from the Methods definition (97.5th percentile) and from the Table 2 value (3.50 cm). The paper reports a 4.0 cm sinus as z = 3.61 in women and 2.34 in men, against absolute values with no body size.",
    },
    {
      id: "aao-level",
      appliesTo: { match: "^aao-" },
      severity: "info",
      text: "Proximal tubular ascending aorta measured 1 cm above the sinotubular junction (as in Muraru 2014).",
    },
    {
      id: "parent-registry",
      appliesTo: "all",
      severity: "info",
      text: "This paper is a sex-difference analysis of the MATEAR registry; the primary reference-value paper is Carrero et al., Argent J Cardiol 2020;88:14-25 (ref. 10). Only the 2025 paper is used here.",
    },
    {
      id: "measurement",
      appliesTo: "all",
      severity: "info",
      text: "Measured on site in 53 laboratories and re-measured offline by two experienced readers; the offline values were analysed. Only subjects with complete measurements from annulus to ascending aorta were included.",
    },
    {
      id: "population",
      appliesTo: "all",
      severity: "info",
      text: "Argentine adults, mostly Caucasian (56.7%) or Native American (38.3%); the authors caution that the values may not transfer to populations with different ethnic composition. The ratios have no race or ethnicity term.",
    },
    {
      id: "minor-inconsistencies",
      appliesTo: "all",
      severity: "info",
      text: "Age SD is 12.7 in the abstract and Results but 12.9 in Table 1. Men's BMI SD (7.4) in Table 1 is large for their weight and height SDs. Not used here: aortic arch and descending aorta, whose height-indexed SDs (0.23 to 0.29 cm/m) are wider than their BSA-indexed ones.",
    },
  ],

  tests: [
    {
      kind: "paper", source: "Results / Discussion: a 4 cm sinus = z 3.61 in women ((4 − 2.77) / 0.34 = 3.618; paper rounds to 3.61)",
      input: { sex: "female", age: 39, height_cm: 161.5, weight_kg: 67.3 },
      y: { sov: 4.0 },
      expect: { "sov-abs": { pred: 2.77, z: 3.61 } },
      tol: { z: 0.01 },
    },
    {
      kind: "paper", source: "Results / Discussion: a 4 cm sinus = z 2.34 in men",
      input: { sex: "male", age: 37, height_cm: 174.6, weight_kg: 83.2 },
      y: { sov: 4.0 },
      expect: { "sov-abs": { pred: 3.11, z: 2.34 } },
      tol: { z: 0.005 },
    },
    {
      kind: "paper", source: "Abstract / Results: women's sinus ULN 3.62 cm at z = 2.5",
      input: { sex: "female", age: 39, height_cm: 161.5, weight_kg: 67.3 },
      ulnZ: 2.5,
      expect: { "sov-abs": { uln: 3.62 } },
      tol: { uln: 0.005 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-15: BSA 1.8481; SoV/height 1.78 ± 0.21 × 1.75; SoV/BSA 1.56 ± 0.21 × 1.8481",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      y: { sov: 3.8 },
      expect: { "sov-ht": { pred: 3.115, z: 1.864, uln: 3.8353 }, "sov-bsa": { pred: 2.8830, z: 2.363, uln: 3.6437 } },
      tol: { pred: 0.0002, z: 0.001, uln: 0.0002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-15: BSA 1.6221; AAo/height 1.64 ± 0.21 × 1.60; annulus/BSA 1.13 ± 0.13 × 1.6221",
      input: { sex: "female", age: 65, height_cm: 160, weight_kg: 60 },
      expect: { "aao-ht": { pred: 2.624, uln: 3.2826 }, "annulus-bsa": { pred: 1.8330, uln: 2.2463 } },
      tol: { pred: 0.0002, uln: 0.0002 },
    },
  ],

  verification: {
    status: "reviewed",
    reviewedBy: "Dan Dyar",
    date: "2026-11-15",
    against: "Arch Cardiol Mex 2025;95(2):171-177: Table 2; Table 1; Materials and methods; Statistical analysis; Results",
    summary: "12 of 12 models checked against the paper; 5/5 tests passing (3 paper, 2 arithmetic). Agrees with values and notes.",
  },
};
