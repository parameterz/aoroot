// @ts-check
// Devereux 2012: sinus of Valsalva and annulus, BSA and height models.
// Transcribed as published. Suspected corrections live in sd.variants + notes.

/** @type {any} */
export default {
  schema: 1,
  id: "devereux2012",
  label: "Devereux 2012",
  entryVersion: "0.2.0",
  changelog: [
    { version: "0.1.0", date: "2026-11-14", by: "Claude", change: "Initial draft from PDF" },
    { version: "0.2.0", date: "2026-11-14", by: "Claude", change: "Ported to schema 1; annulus status caution; height SEE variant 'consistency-corrected'" },
  ],

  citation: {
    authors: "Devereux RB, de Simone G, Arnett DK, Best LG, Boerwinkle E, Howard BV, Kitzman D, Lee ET, Mosley TH Jr, Weder A, Roman MJ",
    title: "Normal limits in relation to age, body size and gender of two-dimensional echocardiographic aortic root dimensions in persons ≥15 years of age",
    journal: "Am J Cardiol",
    year: 2012,
    volume: 110,
    pages: "1189-1194",
    doi: "10.1016/j.amjcard.2012.05.063",
    pmid: 22770936,
  },

  population: {
    n: 1207, // stated; the four cohort counts sum to 1,234 (see notes)
    female: 0.54,
    age: { range: [15, 86], mean: null, sd: null },
    height: { range: [143, 206] },
    bsa: { range: [1.13, 2.41], formula: "dubois" },
    composition: [
      { group: "New York (Roman 1989)", n: 143 },
      { group: "Strong Heart Family Study (American Indian)", n: 510 },
      { group: "Family Blood Pressure Program (African-American, Hispanic, Japanese-American)", n: 459 },
      { group: "HyperGEN (African-American, Caucasian)", n: 122 },
    ],
    region: "United States",
    inclusion: "Non-obese, normotensive, non-diabetic; no clinically overt CVD.",
    exclusion: "Bicuspid valve, more than mild AR or MR, aortic stenosis.",
    source: "Methods",
  },

  models: [
    {
      id: "sov-bsa",
      label: "Devereux 2012, BSA model",
      status: "ok",
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole",
        view: "parasternal (occasionally apical) long axis, maximum diameter parallel to the annular plane" },
      mean: {
        type: "linear",
        intercept: 2.423,
        terms: [
          { var: "age", coef: 0.009 },                                   // per year (Table 1: 0.090 per decade)
          { var: "bsa_dubois", coef: 0.461 },
          { var: "sex", coding: { male: 1, female: 2 }, coef: -0.267 },  // women get double the subtraction
        ],
        source: "Abstract; Table 1",
      },
      sd: { type: "constant", value: 0.261, source: "Abstract (SEE)" },
      dist: "normal",
      validity: { age: [15, 86], bsa_dubois: [1.13, 2.41] },
      stats: { r: 0.674, n: 1207 },
    },
    {
      id: "sov-height",
      label: "Devereux 2012, height model",
      status: "ok",
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole",
        view: "parasternal (occasionally apical) long axis, maximum diameter parallel to the annular plane" },
      mean: {
        type: "linear",
        intercept: 1.519,
        terms: [
          { var: "age", coef: 0.010 },
          { var: "height_cm", coef: 0.010 },
          { var: "sex", coding: { male: 1, female: 2 }, coef: -0.247 },
        ],
        source: "Abstract; Table 1",
      },
      sd: {
        type: "constant",
        value: 0.215, // as published
        source: "Abstract (SEE)",
        variants: [{ id: "consistency-corrected", value: 0.26, label: "consistency-corrected", note: "see-height" }],
      },
      dist: "normal",
      validity: { age: [15, 86], height_cm: [143, 206] },
      stats: { r: 0.674, n: 1207 },
    },
    {
      id: "annulus-bsa",
      label: "Devereux 2012 annulus, BSA model",
      status: "caution",
      measurement: { site: "annulus", units: "cm", modality: "echo", edge: "hinge points of right and non-coronary cusps",
        phase: "systole", view: "parasternal long axis" },
      mean: {
        type: "linear",
        intercept: 1.439,
        terms: [
          { var: "age", coef: 0.002 }, // Table 2: 0.02 per decade
          { var: "bsa_dubois", coef: 0.457 },
          { var: "sex", coding: { male: 1, female: 2 }, coef: -0.121 },
        ],
        source: "Table 2",
      },
      sd: { type: "constant", value: 0.113, source: "Text (Table 2 places 0.070 here)" },
      dist: "normal",
      validity: { age: [15, 86], bsa_dubois: [1.13, 2.41] },
      stats: { r: 0.64 },
    },
    {
      id: "annulus-height",
      label: "Devereux 2012 annulus, height model",
      status: "caution",
      measurement: { site: "annulus", units: "cm", modality: "echo", edge: "hinge points of right and non-coronary cusps",
        phase: "systole", view: "parasternal long axis" },
      mean: {
        type: "linear",
        intercept: 1.535,
        terms: [
          { var: "age", coef: 0.001 }, // Table 2: 0.01 per decade
          { var: "height_cm", coef: 0.004 },
          { var: "sex", coding: { male: 1, female: 2 }, coef: -0.152 },
        ],
        source: "Table 2",
      },
      sd: { type: "constant", value: 0.070, source: "Text (Table 2 places 0.113 here)" },
      dist: "normal",
      validity: { age: [15, 86], height_cm: [143, 206] },
      stats: { r: 0.63 },
    },
  ],

  definitions: {
    ulnZ: 1.96,
    // Paper: mild 1.97–3.0, moderate 3.01–4.0, severe >4.0. Encoded half-open.
    bands: [
      { label: "mild", z: [1.96, 3] },
      { label: "moderate", z: [3, 4] },
      { label: "severe", z: [4, null] },
    ],
    source: "Methods (dilation defined as > 1.96 SEE above predicted)",
  },

  notes: [
    {
      id: "see-height",
      appliesTo: ["sov-height"],
      severity: "important",
      text: "Both SoV models report the same R (0.674) for the same outcome and sample, so their SEEs should be nearly equal. The published 0.215 cm (height) vs 0.261 cm (BSA) is inconsistent. The overall SD of SoV and the age coefficients both imply an SEE of about 0.26 cm. In Table 1, both values sit in the intercept row's SE column, and 0.215 is consistent with a height-model intercept SE. With 0.215, z-scores are about 21% larger and the upper limit of normal about 1 mm lower. The 'consistency-corrected' option uses 0.26 cm.",
    },
    {
      id: "see-annulus",
      appliesTo: ["annulus-bsa", "annulus-height"],
      severity: "important",
      text: "The text gives annulus SEEs of 0.113 cm (BSA) and 0.070 cm (height); Table 2 places these values the other way around, in the intercept SE column. SEEs of 0.7 to 1.1 mm are implausibly small for the annulus, so annulus z-scores from this paper are unreliable. Percent of predicted is unaffected.",
    },
    {
      id: "population",
      appliesTo: "all",
      severity: "info",
      text: "Pooled from four US cohorts including American Indian, African-American, Hispanic, Japanese-American and White participants. The equations have no race or ethnicity term.",
    },
    {
      id: "constant-sd",
      appliesTo: "all",
      severity: "info",
      text: "A single SD is assumed for all ages, body sizes and both sexes. Absolute residuals showed weak relations with age and body size (r² 0.010 to 0.016), statistically detectable at this sample size but small.",
    },
    {
      id: "other-inconsistencies",
      appliesTo: "all",
      severity: "info",
      text: "Results text gives height r = 0.14; the abstract and coefficients imply about 0.48. 'Coefficient of variation' is used to mean R². Cohort counts sum to 1,234 vs the stated n = 1,207.",
    },
  ],

  // Arithmetic checks only (hand-calculated from the coefficients above).
  // TODO: add `independent` cases from the old aoroot.parameterz.com before it goes offline,
  // and `paper` cases if any printed values can be found.
  tests: [
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      y: { sov: 3.8 },
      expect: { covariates: { bsa_dubois: 1.848 }, "sov-bsa": { pred: 3.368, z: 1.66 }, "sov-height": { pred: 3.422, z: 1.76 } },
    },
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14",
      input: { sex: "female", age: 65, height_cm: 160, weight_kg: 60 },
      y: { sov: 3.6 },
      expect: { covariates: { bsa_dubois: 1.622 }, "sov-bsa": { pred: 3.222, z: 1.45 }, "sov-height": { pred: 3.275, z: 1.51 } },
    },
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14",
      input: { sex: "male", age: 20, height_cm: 190, weight_kg: 85 },
      y: { sov: 3.5 },
      expect: { covariates: { bsa_dubois: 2.130 }, "sov-bsa": { pred: 3.318, z: 0.70 }, "sov-height": { pred: 3.372, z: 0.60 } },
    },
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14: (3.8 − 3.422) / 0.26",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      y: { sov: 3.8 },
      sdVariant: "consistency-corrected",
      expect: { "sov-height": { pred: 3.422, z: 1.45 } },
    },
  ],

  verification: {
    status: "draft",
    reviewedBy: null,
    date: null,
    against: "Published Am J Cardiol version: abstract, Table 1, Table 2",
  },
};
