// @ts-check
// Copyright © 2026 Dan Dyar. Licensed under CC BY-NC-SA 4.0 (see LICENSE-DATA and LICENSING.md).
// Published equations and values belong to the cited paper; this entry's curation, notes and checks are covered here.
// Devereux 2012: sinus of Valsalva and annulus, BSA and height models.
// Transcribed as published. Suspected corrections live in sd.variants + notes.

/** @type {any} */
export default {
  schema: 1,
  id: "devereux2012",
  label: "Devereux 2012",
  entryVersion: "0.4.1",
  changelog: [
    { version: "0.1.0", date: "2026-11-14", by: "Claude", change: "Initial draft from PDF" },
    { version: "0.2.0", date: "2026-11-14", by: "Claude", change: "Ported to schema 1; annulus status caution; height SEE variant 'consistency-corrected'" },
    { version: "0.3.0", date: "2026-11-14", by: "Claude", change: "Convention fields as enums (annulus inner edge, mid-systole); legacy-site independent tests; annulus notes" },
    { version: "0.3.1", date: "2026-11-14", by: "Claude", change: "Age coefficients entered per decade as printed in Tables 1 and 2 (was per year, from the abstract); results unchanged. Raised in Dan's review." },
    { version: "0.3.2", date: "2026-11-14", by: "Claude", change: "Annulus SEEs from Table 2 (BSA 0.070, height 0.113) instead of the text, per Dan's review; legacy-code tests now compare the annulus ULN too" },
    { version: "0.3.3", date: "2026-11-14", by: "Claude", change: "Annulus 'consistency-corrected' SD option (0.18 cm); published Table 2 values stay the default" },
    { version: "0.4.0", date: "2026-11-15", by: "Dan Dyar", change: "Reviewed against the paper: 4 of 4 models, all tests passing; agrees with notes and values" },
    { version: "0.4.1", date: "2026-11-16", by: "Claude", change: "Notes only: added 'nonobese' (cohort described as nonobese / normal-weight with no BMI cutoff, so no BMI range is checked). No values changed." },
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
        view: "parasternal long axis", viewNote: "parasternal (occasionally apical) long axis, maximum diameter parallel to the annular plane" },
      mean: {
        type: "linear",
        intercept: 2.423,
        terms: [
          { var: "age", transform: { per: 10 }, coef: 0.090 },           // per decade, as Table 1 (abstract: 0.009 per year)
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
        view: "parasternal long axis", viewNote: "parasternal (occasionally apical) long axis, maximum diameter parallel to the annular plane" },
      mean: {
        type: "linear",
        intercept: 1.519,
        terms: [
          { var: "age", transform: { per: 10 }, coef: 0.10 },            // per decade, as Table 1 (abstract: 0.010 per year)
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
      measurement: { site: "annulus", units: "cm", modality: "echo", edge: "inner", phase: "mid-systole",
        view: "parasternal long axis", edgeNote: "between the hinge points of the right and non-coronary cusps, 'in systole' (exact timing not stated)" },
      mean: {
        type: "linear",
        intercept: 1.439,
        terms: [
          { var: "age", transform: { per: 10 }, coef: 0.02 },  // per decade, as Table 2
          { var: "bsa_dubois", coef: 0.457 },
          { var: "sex", coding: { male: 1, female: 2 }, coef: -0.121 },
        ],
        source: "Table 2",
      },
      sd: {
        type: "constant", value: 0.070, source: "Table 2, SE column of the intercept row (text gives 0.113)",
        variants: [{ id: "consistency-corrected", value: 0.18, label: "consistency-corrected", note: "see-annulus" }],
      },
      dist: "normal",
      validity: { age: [15, 86], bsa_dubois: [1.13, 2.41] },
      stats: { r: 0.64 },
    },
    {
      id: "annulus-height",
      label: "Devereux 2012 annulus, height model",
      status: "caution",
      measurement: { site: "annulus", units: "cm", modality: "echo", edge: "inner", phase: "mid-systole",
        view: "parasternal long axis", edgeNote: "between the hinge points of the right and non-coronary cusps, 'in systole' (exact timing not stated)" },
      mean: {
        type: "linear",
        intercept: 1.535,
        terms: [
          { var: "age", transform: { per: 10 }, coef: 0.01 },  // per decade, as Table 2
          { var: "height_cm", coef: 0.004 },
          { var: "sex", coding: { male: 1, female: 2 }, coef: -0.152 },
        ],
        source: "Table 2",
      },
      sd: {
        type: "constant", value: 0.113, source: "Table 2, SE column of the intercept row (text gives 0.070)",
        variants: [{ id: "consistency-corrected", value: 0.18, label: "consistency-corrected", note: "see-annulus" }],
      },
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
      id: "nonobese",
      appliesTo: "all",
      severity: "info",
      text: "The cohort was 'nonobese' (Methods) and 'normal-weight' (abstract), with no BMI cutoff given, so no BMI range is checked here. Body weights ran up to 110 kg. Adding BMI did not improve the models, but only within that non-obese range; the authors raised the question of whether BSA under-recognizes aortic dilatation in obese subjects without being able to test it.",
    },
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
      text: "Annulus SEEs are taken from Table 2 (0.070 cm BSA model, 0.113 cm height model), on the reasoning that the table is the statistics output and the text was transcribed from it; the text gives them the other way around. In Table 2 both sit in the SE column of the intercept row, beside a p-value, so they are most likely standard errors of the intercept, not SEEs. Either way they are implausibly small: the paper's own age coefficient and its standardized beta imply an annulus SD of about 2.3 mm, and with R = 0.64 an SEE of about 1.8 mm (0.18 cm), consistent with annulus SDs of 1.9 to 2.4 mm in WASE, NORRE and Campens. Annulus z-scores from this paper are therefore about 1.6 to 2.5 times too large. The published values are shown by default; the 'consistency-corrected' option uses 0.18 cm. Percent of predicted is unaffected.",
    },
    {
      id: "annulus-convention",
      appliesTo: ["annulus-bsa", "annulus-height"],
      severity: "info",
      text: "The annulus was measured between the hinge points of the right and non-coronary cusps 'in systole'. Hinge-to-hinge corresponds to the inner-edge convention, and is matched here to the ASE mid-systolic annulus measurement; the paper does not state the exact systolic timing.",
    },
    {
      id: "annulus-legacy-see",
      appliesTo: ["annulus-bsa", "annulus-height"],
      severity: "info",
      text: "The original aoroot.parameterz.com calculator (2013) also used the Table 2 placement of the annulus SEEs (0.070 cm BSA model, 0.113 cm height model).",
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

  // `independent`: values computed by the original aoroot.parameterz.com code (devereux.py,
  // 31 Mar 2013, Dan's own transcription): mean and mean + 2 SE, age coefficient per decade × age/10.
  // `arithmetic`: hand-calculated from the paper's equations.
  tests: [
    {
      kind: "independent", source: "aoroot.parameterz.com devereux.py (2013): mean, mean + 2 SE",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      ulnZ: 2,
      expect: { "sov-bsa": { pred: 3.3680, uln: 3.8900 } },
    },
    {
      kind: "independent", source: "aoroot.parameterz.com devereux.py (2013): mean, mean + 2 SE",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      ulnZ: 2,
      expect: { "sov-height": { pred: 3.4220, uln: 3.8520 } },
    },
    {
      kind: "independent", source: "aoroot.parameterz.com devereux.py (2013): mean, mean + 2 SE",
      input: { sex: "female", age: 65, height_cm: 160, weight_kg: 60 },
      ulnZ: 2,
      expect: { "sov-bsa": { pred: 3.2218, uln: 3.7438 } },
    },
    {
      kind: "independent", source: "aoroot.parameterz.com devereux.py (2013): mean, mean + 2 SE",
      input: { sex: "female", age: 65, height_cm: 160, weight_kg: 60 },
      ulnZ: 2,
      expect: { "sov-height": { pred: 3.2750, uln: 3.7050 } },
    },
    {
      kind: "independent", source: "aoroot.parameterz.com devereux.py (2013): mean, mean + 2 SE",
      input: { sex: "male", age: 18, height_cm: 192, weight_kg: 80 },
      ulnZ: 2,
      expect: { "sov-bsa": { pred: 3.2824, uln: 3.8044 } },
    },
    {
      kind: "independent", source: "aoroot.parameterz.com devereux.py (2013): mean, mean + 2 SE",
      input: { sex: "female", age: 82, height_cm: 150, weight_kg: 48 },
      ulnZ: 2,
      expect: { "sov-height": { pred: 3.3450, uln: 3.7750 } },
    },
    {
      kind: "independent", source: "aoroot.parameterz.com devereux.py (2013): mean, mean + 2 SE",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      ulnZ: 2,
      expect: { "annulus-bsa": { pred: 2.2426, uln: 2.3826 } },
    },
    {
      kind: "independent", source: "aoroot.parameterz.com devereux.py (2013): mean, mean + 2 SE",
      input: { sex: "female", age: 65, height_cm: 160, weight_kg: 60 },
      ulnZ: 2,
      expect: { "annulus-height": { pred: 1.9360, uln: 2.1620 } },
    },
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
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14: 1.535 + 0.01·4.5 + 0.004·178 − 0.152 = 2.140; z = (2.5 − 2.140) / 0.18",
      input: { sex: "male", age: 45, height_cm: 178, weight_kg: 80 },
      y: { annulus: 2.5 },
      sdVariant: "consistency-corrected",
      expect: { "annulus-height": { pred: 2.140, z: 2.00, uln: 2.4928 } },
    },
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14: published Table 2 SEE 0.113: z = (2.5 − 2.140) / 0.113",
      input: { sex: "male", age: 45, height_cm: 178, weight_kg: 80 },
      y: { annulus: 2.5 },
      expect: { "annulus-height": { pred: 2.140, z: 3.19 } },
    },
  ],

  verification: {
    status: "reviewed",
    reviewedBy: "Dan Dyar",
    date: "2026-11-15",
    against: "Published Am J Cardiol version: abstract, Table 1, Table 2, Methods",
    summary: "4 of 4 models checked against the paper; 14/14 tests passing (8 independent, 6 arithmetic). Agrees with notes and values.",
  },
};
