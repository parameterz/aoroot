// @ts-check
// Copyright © 2026 Dan Dyar. Licensed under CC BY-NC-SA 4.0 (see LICENSE-DATA and LICENSING.md).
// Published equations and values belong to the cited paper; this entry's curation, notes and checks are covered here.
// Campens 2014: sinuses of Valsalva and ascending aorta, ages 1–85, Ghent.
// Transcribed as published from Table 2 (8 equations: 2 levels × 2 sexes × 2 BSA formulas).
//
// log10(D, mm) = a + b·log10(age) + c·BSA, sex-specific, constant SEE on the log10 scale.
//   z   = (log10(observed) − predicted log10) / SEE
//   ULN = 10^(predicted log10 + 1.96·SEE)
// The paper gives each equation for BSA by DuBois and by Haycock; they share one model ID
// per formula, with sex-keyed coefficients. ULNs agree between formulas (paper, Results).
// The two formulas are a `choice` per site: DuBois by default (adult convention), Haycock
// as an option (pediatric convention; the old parameterz Campens page used it).
//
// Model IDs: <sov|aao>-<dubois|haycock>.

/** @type {any} */
export default {
  schema: 1,
  id: "campens2014",
  label: "Campens 2014",
  entryVersion: "0.2.0",
  changelog: [
    { version: "0.1.0", date: "2026-11-14", by: "Claude", change: "Initial draft from PDF (Table 2)" },
    { version: "0.1.1", date: "2026-11-14", by: "Claude", change: "Independent tests from the legacy parameterz Campens calculator" },
    { version: "0.1.2", date: "2026-11-14", by: "Claude", change: "DuBois/Haycock as a `choice` (DuBois default)" },
    { version: "0.2.0", date: "2026-11-15", by: "Dan Dyar", change: "Reviewed against the paper: 4 of 4 models, all tests passing; agrees with values and notes" },
  ],

  citation: {
    authors: "Campens L, Demulier L, De Groote K, Vandekerckhove K, De Wolf D, Roman MJ, Devereux RB, De Paepe A, De Backer J",
    title: "Reference values for echocardiographic assessment of the diameter of the aortic root and ascending aorta spanning all age categories",
    journal: "Am J Cardiol",
    year: 2014,
    volume: 114,
    pages: "914-920",
    doi: "10.1016/j.amjcard.2014.06.024",
    pmid: null,
  },

  population: {
    n: 849,
    female: 0.534, // 453 of 849
    age: { range: [1, 85], mean: 40.1, sd: 21.3 }, // 716 aged ≥ 15 y
    height: { range: [null, null] },
    bsa: { range: [null, null], formula: "dubois and haycock" },
    composition: [{ group: "Caucasian", n: 849 }],
    region: "Ghent University Hospital, Belgium (single center), 2008–2013",
    inclusion: "Patients having echocardiography for family screening, pre-operative evaluation, sports clearance, exclusion of pericarditis/endocarditis, or outpatient follow-up for reasons other than aortopathy.",
    exclusion: "Bicuspid aortic valve, significant valvular disease, connective tissue disorders such as Marfan syndrome.",
    source: "Methods; Results; Table 1",
  },

  models: [
    {
      choice: { group: "sov-bsa", label: "BSA (DuBois)", default: true },
      id: "sov-dubois", label: "Campens 2014 SoV, BSA (DuBois)", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "linear", outcome: "log10",
        intercept: { male: 1.108, female: 1.100 },
        terms: [
          { var: "age", transform: "log10", coef: { male: 0.136, female: 0.129 } },
          { var: "bsa_dubois", coef: { male: 0.099, female: 0.091 } },
        ],
        source: "Table 2",
      },
      sd: { type: "constant", value: { male: 0.0381, female: 0.0421 }, source: "Table 2 (SEE, log10 scale)" },
      dist: "lognormal10",
      validity: { age: [1, 85] },
      stats: { r2: { male: 0.84, female: 0.67 } },
    },
    {
      choice: { group: "sov-bsa", label: "BSA (Haycock)", default: false },
      id: "sov-haycock", label: "Campens 2014 SoV, BSA (Haycock)", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "linear", outcome: "log10",
        intercept: { male: 1.115, female: 1.112 },
        terms: [
          { var: "age", transform: "log10", coef: { male: 0.137, female: 0.132 } },
          { var: "bsa_haycock", coef: { male: 0.094, female: 0.080 } },
        ],
        source: "Table 2",
      },
      sd: { type: "constant", value: { male: 0.0388, female: 0.0427 }, source: "Table 2 (SEE, log10 scale)" },
      dist: "lognormal10",
      validity: { age: [1, 85] },
    },
    {
      choice: { group: "aao-bsa", label: "BSA (DuBois)", default: true },
      id: "aao-dubois", label: "Campens 2014 ascending aorta, BSA (DuBois)", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis",
        viewNote: "ascending aorta at the level of the right pulmonary artery" },
      mean: {
        type: "linear", outcome: "log10",
        intercept: { male: 1.033, female: 1.001 },
        terms: [
          { var: "age", transform: "log10", coef: { male: 0.188, female: 0.177 } },
          { var: "bsa_dubois", coef: { male: 0.070, female: 0.086 } },
        ],
        source: "Table 2",
      },
      sd: { type: "constant", value: { male: 0.0431, female: 0.0453 }, source: "Table 2 (SEE, log10 scale)" },
      dist: "lognormal10",
      validity: { age: [1, 85] },
      stats: { r2: { male: 0.82, female: 0.74 } },
    },
    {
      choice: { group: "aao-bsa", label: "BSA (Haycock)", default: false },
      id: "aao-haycock", label: "Campens 2014 ascending aorta, BSA (Haycock)", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis",
        viewNote: "ascending aorta at the level of the right pulmonary artery" },
      mean: {
        type: "linear", outcome: "log10",
        intercept: { male: 1.038, female: 1.006 },
        terms: [
          { var: "age", transform: "log10", coef: { male: 0.187, female: 0.172 } },
          { var: "bsa_haycock", coef: { male: 0.068, female: 0.087 } },
        ],
        source: "Table 2",
      },
      sd: { type: "constant", value: { male: 0.0433, female: 0.0450 }, source: "Table 2 (SEE, log10 scale)" },
      dist: "lognormal10",
      validity: { age: [1, 85] },
    },
  ],

  definitions: {
    ulnZ: 1.96,
    bands: [],
    source: "Methods: dilatation = z > 1.96 (ULN = 10^(predicted log10 + 1.96·SEE)); Results: 2–3.8% of the reference group exceeded it",
  },

  notes: [
    {
      id: "clinic-population",
      appliesTo: "all",
      severity: "important",
      text: "The reference group is clinic patients, not screened healthy volunteers: 12.8% had (mostly treated) hypertension and about 10% of adults were obese (BMI 30–35). Bicuspid valves, connective tissue disorders and significant valve disease were excluded.",
    },
    {
      id: "log-base",
      appliesTo: "all",
      severity: "info",
      text: "The Methods describe 'the natural logarithm', but every published equation uses log10 (Table 2). The log10 form is used here, as printed; the SEEs only make sense on that scale.",
    },
    {
      id: "log-scale",
      appliesTo: "all",
      severity: "info",
      text: "Because the model is on a log scale, the normal range is asymmetric: the upper limit lies further above the predicted value than the lower limit lies below it, and the SD in mm grows with aortic size.",
    },
    {
      id: "no-height",
      appliesTo: "all",
      severity: "info",
      text: "Height was not used: in those aged 15 or older it correlated only weakly with aortic size compared with BSA.",
    },
    {
      id: "aa-level",
      appliesTo: { match: "^aao-" },
      severity: "info",
      text: "The ascending aorta was measured at the level of the right pulmonary artery, which may be higher than the '1 cm above the STJ' used by NORRE.",
    },
    {
      id: "population",
      appliesTo: "all",
      severity: "info",
      text: "Single-center study of Caucasian patients in Belgium; the authors note this may limit applicability to other populations. Ages 1 to 85; the site uses the adult range.",
    },
  ],

  tests: [
    // Original parameterz pediatric site (main-parameterz.appspot.com/refs/campens-ajc-2014),
    // Haycock BSA, screenshot 2026-11-14: male, 61 y, 178 cm, 75 kg; SoV 40 and AA 40 mm.
    {
      kind: "independent", source: "Legacy parameterz Campens calculator: BSA 1.930, SoV z 1.57, range 29.17–41.40",
      input: { sex: "male", age: 61, height_cm: 178, weight_kg: 75 },
      y: { sov: 40 },
      expect: { covariates: { bsa_haycock: 1.930 }, "sov-haycock": { z: 1.57, lln: 29.17, uln: 41.40 } },
      tol: { covariates: 0.001, z: 0.01, lln: 0.01, uln: 0.01 },
    },
    {
      kind: "independent", source: "Legacy parameterz Campens calculator: AA z 2.29, range 26.19–38.72",
      input: { sex: "male", age: 61, height_cm: 178, weight_kg: 75 },
      y: { aao: 40 },
      expect: { "aao-haycock": { z: 2.29, lln: 26.19, uln: 38.72 } },
      tol: { z: 0.01, lln: 0.01, uln: 0.01 },
    },
    {
      kind: "paper", source: "Table 1, men ≥15 y: mean age 45.2, BSA(DB) 1.9, SoV 33.4 ± 3.8 mm (prediction at the group means ≈ group mean)",
      input: { sex: "male", age: 45.2, height_cm: 177.4, weight_kg: 72.99 },
      expect: { "sov-dubois": { pred: 33.2 } },
      tol: { pred: 0.5 },
    },
    {
      kind: "paper", source: "Table 1, women ≥15 y: mean age 46.6, BSA(DB) 1.7, AA 27.7 ± 3.9 mm (prediction at the group means ≈ group mean)",
      input: { sex: "female", age: 46.6, height_cm: 165.0, weight_kg: 63.58 },
      expect: { "aao-dubois": { pred: 27.7 } },
      tol: { pred: 0.5 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14: 1.108 + 0.136·log10(40) + 0.099·1.8481",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      y: { sov: 38 },
      expect: { "sov-dubois": { pred: 32.274, z: 1.862, uln: 38.329 } },
      tol: { pred: 0.002, uln: 0.002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14: Haycock BSA 1.6405",
      input: { sex: "female", age: 65, height_cm: 160, weight_kg: 60 },
      y: { sov: 33 },
      expect: { covariates: { bsa_haycock: 1.6405 }, "sov-haycock": { pred: 30.377, z: 0.842, uln: 36.833 } },
      tol: { pred: 0.002, uln: 0.002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14",
      input: { sex: "male", age: 30, height_cm: 185, weight_kg: 90 },
      y: { aao: 34 },
      expect: { "aao-haycock": { pred: 28.919, z: 1.624, uln: 35.16 } },
      tol: { pred: 0.002, uln: 0.002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14",
      input: { sex: "female", age: 72, height_cm: 158, weight_kg: 55 },
      y: { aao: 35 },
      expect: { "aao-dubois": { pred: 29.038, z: 1.79, uln: 35.624 } },
      tol: { pred: 0.002, uln: 0.002 },
    },
  ],

  verification: {
    status: "reviewed",
    reviewedBy: "Dan Dyar",
    date: "2026-11-15",
    against: "Am J Cardiol 2014;114:914-920 (published version): Table 2; Methods; Table 1",
    summary: "4 of 4 models checked against the paper; 8/8 tests passing (2 paper, 2 independent, 4 arithmetic). Agrees with values and notes.",
  },
};
