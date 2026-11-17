// @ts-check
// Copyright © 2026 Dan Dyar. Licensed under CC BY-NC-SA 4.0 (see LICENSE-DATA and LICENSING.md).
// Published equations and values belong to the cited paper; this entry's curation, notes and checks are covered here.
// Yao 2026 (CITED I): optimized multivariate allometric model (OMAM) for the aortic
// annulus, sinus and proximal ascending aorta in healthy Chinese and Italian adults.
// Transcribed as published (Sections 2.6–2.8, Tables 4 and 5); equations checked
// against the authors' web calculator (github.com/xueyingzeng/OMAMaorta).
//
// Predicted value Yp = a × b^(woman) × age^x × height^y × weight^z   (cm, kg, years → mm)
// Corrected value Yc = observed / Yp. The paper's normal range is on Yc, so:
//   % predicted = 100 × Yc
//   z = (Yc − mean Yc) / SD Yc             (dist: "ratio")
//   normal range = Yp × published Yc limits (Table 5, asymmetric) for the Chinese and
//   Italian sets, as the authors recommend; Yp × (mean ± 1.96 SD) for the combined set,
//   which has no published limits. Same choice as parameterz/OMAM-Aortic-Root.
//
// Three equation sets, one per derivation population. Each site's three models share a
// `choice.group`; the user picks the population as a view option (combined = default).
// Race/ethnicity is never a patient input.
//
// All levels, INCLUDING THE ANNULUS, were measured leading edge, end-diastole (Figure 2).
// Model IDs: <annulus|sov|aao>-<combined|chinese|italian>.
// Supersedes the aortic equations of Yao 2019 (JASE; Supplemental Table 6), which came
// from the same EMINCA Chinese cohort without a sex term or a stated convention.

/** @type {any} */
export default {
  schema: 1,
  id: "yao2026",
  label: "Yao 2026 (OMAM)",
  entryVersion: "0.3.0",
  changelog: [
    { version: "0.1.0", date: "2026-11-14", by: "Claude", change: "Initial draft from PDF (Sections 2.6–2.8, Tables 4–5)" },
    { version: "0.1.1", date: "2026-11-14", by: "Claude", change: "population group/default moved to the shared `choice` field" },
    { version: "0.2.0", date: "2026-11-14", by: "Claude", change: "Normal range from published Yc limits (Chinese, Italian); tests from parameterz/OMAM-Aortic-Root" },
    { version: "0.3.0", date: "2026-11-15", by: "Dan Dyar", change: "Reviewed against the paper: 9 of 9 models, all tests passing; agrees with values and notes" },
  ],

  citation: {
    authors: "Yao G, Hu X, Chen X, Zeng X, Ferrara F, Carbone A, Rega S, Franzese M, Sun P, Zhang M, Vriz O, Zhang C, Bossone E, Zhang Y",
    title: "Comparison of body surface area and optimized multivariate allometric model approaches in correcting echocardiographic aortic dimensions for physiological variances: an international and multicenter study (CITED I)",
    journal: "MedComm",
    year: 2026,
    volume: 7,
    pages: "e70788",
    doi: "10.1002/mco2.70788",
    pmid: null,
  },

  population: {
    n: 1820,
    female: 0.552, // 502 of 910 per population after matching
    age: { range: [18, 79], mean: 45.5, sd: 13.9 },
    height: { range: [null, null] },
    bsa: { range: [null, null], formula: "dubois" }, // BSA used only for the comparison arm
    composition: [
      { group: "Chinese (Han), EMINCA study", n: 910 },
      { group: "Italian", n: 910 },
    ],
    region: "China (43 laboratories) and Italy (2 hospitals); propensity-matched 1:1 for sex and age",
    inclusion: "Healthy adults 18–79 y, Chinese Han or Italian nationality, normal BP (< 140/90), normal examination, ECG and echo, no cardiovascular history.",
    exclusion: "CAD, structural heart disease, HF, hypertension, stroke, hyperlipidaemia, diabetes and other endocrine disease, lung disease, anaemia, connective tissue disease, abnormal liver or renal function, obesity (BMI ≥ 30), > mild regurgitation, athletes, pregnancy.",
    source: "Section 5.1; Section 5.3",
  },

  models: [

    // ── Combined Chinese–Italian equations (Section 2.8); Yc from Table 4 (group B, by sex) ──
    {
      id: "annulus-combined", label: "Yao 2026 OMAM Ao-a (annulus), Combined Chinese–Italian", status: "ok",
      population: "Combined Chinese–Italian",
      choice: { group: "annulus-population", label: "Combined Chinese–Italian", default: true },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "power", a: 2.948,
        factors: [
          { var: "sex", coding: { male: 0, female: 1 }, base: 0.928 },
          { var: "age", exp: 0.060 },
          { var: "height_cm", exp: 0.338 },
        ],
        source: "Section 2.8: Yp = a × b^(woman) × …",
      },
      sd: null,
      dist: "ratio",
      ratio: { mean: { male: 0.996, female: 1.010 }, sd: { male: 0.101, female: 0.108 }, source: "Table 4 (group B only)" },
      validity: { age: [18, 79], bmi: [null, 30] },
    },
    {
      id: "sov-combined", label: "Yao 2026 OMAM Ao-s (sinus), Combined Chinese–Italian", status: "ok",
      population: "Combined Chinese–Italian",
      choice: { group: "sov-population", label: "Combined Chinese–Italian", default: true },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "power", a: 2.689,
        factors: [
          { var: "sex", coding: { male: 0, female: 1 }, base: 0.95 },
          { var: "age", exp: 0.137 },
          { var: "height_cm", exp: 0.210 },
          { var: "weight_kg", exp: 0.198 },
        ],
        source: "Section 2.8: Yp = a × b^(woman) × …",
      },
      sd: null,
      dist: "ratio",
      ratio: { mean: { male: 0.992, female: 1.001 }, sd: { male: 0.100, female: 0.109 }, source: "Table 4 (group B only)" },
      validity: { age: [18, 79], bmi: [null, 30] },
    },
    {
      id: "aao-combined", label: "Yao 2026 OMAM Ao-asc (ascending), Combined Chinese–Italian", status: "ok",
      population: "Combined Chinese–Italian",
      choice: { group: "aao-population", label: "Combined Chinese–Italian", default: true },
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "power", a: 4.375,
        factors: [
          { var: "sex", coding: { male: 0, female: 1 }, base: 0.974 },
          { var: "age", exp: 0.180 },
          { var: "weight_kg", exp: 0.280 },
        ],
        source: "Section 2.8: Yp = a × b^(woman) × …",
      },
      sd: null,
      dist: "ratio",
      ratio: { mean: { male: 0.995, female: 1.007 }, sd: { male: 0.120, female: 0.114 }, source: "Table 4 (group B only)" },
      validity: { age: [18, 79], bmi: [null, 30] },
    },

    // ── Chinese (Han) equations (Section 2.6); Yc from Table 5 ──
    {
      id: "annulus-chinese", label: "Yao 2026 OMAM Ao-a (annulus), Chinese (Han)", status: "ok",
      population: "Chinese (Han)",
      choice: { group: "annulus-population", label: "Chinese (Han)", default: false },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "power", a: 9.593,
        factors: [
          { var: "sex", coding: { male: 0, female: 1 }, base: 0.943 },
          { var: "age", exp: 0.054 },
          { var: "weight_kg", exp: 0.142 },
        ],
        source: "Section 2.6: Yp = a × b^(woman) × …",
      },
      sd: null,
      dist: "ratio",
      ratio: { mean: 1.002, sd: 0.112, interval: [0.794, 1.246], source: "Table 5 (n = 910; interval = published '95% CI')" },
      validity: { age: [18, 79], bmi: [null, 30] },
    },
    {
      id: "sov-chinese", label: "Yao 2026 OMAM Ao-s (sinus), Chinese (Han)", status: "ok",
      population: "Chinese (Han)",
      choice: { group: "sov-population", label: "Chinese (Han)", default: false },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "power", a: 8.085,
        factors: [
          { var: "sex", coding: { male: 0, female: 1 }, base: 0.949 },
          { var: "age", exp: 0.113 },
          { var: "weight_kg", exp: 0.210 },
        ],
        source: "Section 2.6: Yp = a × b^(woman) × …",
      },
      sd: null,
      dist: "ratio",
      ratio: { mean: 1.003, sd: 0.105, interval: [0.792, 1.213], source: "Table 5 (n = 910; interval = published '95% CI')" },
      validity: { age: [18, 79], bmi: [null, 30] },
    },
    {
      id: "aao-chinese", label: "Yao 2026 OMAM Ao-asc (ascending), Chinese (Han)", status: "ok",
      population: "Chinese (Han)",
      choice: { group: "aao-population", label: "Chinese (Han)", default: false },
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "power", a: 5.028,
        factors: [
          { var: "sex", coding: { male: 0, female: 1 }, base: 0.966 },
          { var: "age", exp: 0.161 },
          { var: "weight_kg", exp: 0.261 },
        ],
        source: "Section 2.6: Yp = a × b^(woman) × …",
      },
      sd: null,
      dist: "ratio",
      ratio: { mean: 1.006, sd: 0.122, interval: [0.747, 1.262], source: "Table 5 (n = 910; interval = published '95% CI')" },
      validity: { age: [18, 79], bmi: [null, 30] },
    },

    // ── Italian equations (Section 2.7); Yc from Table 5 ──
    {
      id: "annulus-italian", label: "Yao 2026 OMAM Ao-a (annulus), Italian", status: "ok",
      population: "Italian",
      choice: { group: "annulus-population", label: "Italian", default: false },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "power", a: 1.042,
        factors: [
          { var: "sex", coding: { male: 0, female: 1 }, base: 0.944 },
          { var: "age", exp: 0.054 },
          { var: "height_cm", exp: 0.472 },
          { var: "weight_kg", exp: 0.081 },
        ],
        source: "Section 2.7: Yp = a × b^(woman) × …",
      },
      sd: null,
      dist: "ratio",
      ratio: { mean: 1.007, sd: 0.086, interval: [0.854, 1.188], source: "Table 5 (n = 910; interval = published '95% CI')" },
      validity: { age: [18, 79], bmi: [null, 30] },
    },
    {
      id: "sov-italian", label: "Yao 2026 OMAM Ao-s (sinus), Italian", status: "ok",
      population: "Italian",
      choice: { group: "sov-population", label: "Italian", default: false },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "power", a: 2.268,
        factors: [
          { var: "sex", coding: { male: 0, female: 1 }, base: 0.925 },
          { var: "age", exp: 0.164 },
          { var: "height_cm", exp: 0.317 },
          { var: "weight_kg", exp: 0.090 },
        ],
        source: "Section 2.7: Yp = a × b^(woman) × …",
      },
      sd: null,
      dist: "ratio",
      ratio: { mean: 1.004, sd: 0.090, interval: [0.834, 1.185], source: "Table 5 (n = 910; interval = published '95% CI')" },
      validity: { age: [18, 79], bmi: [null, 30] },
    },
    {
      id: "aao-italian", label: "Yao 2026 OMAM Ao-asc (ascending), Italian", status: "ok",
      population: "Italian",
      choice: { group: "aao-population", label: "Italian", default: false },
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "power", a: 6.385,
        factors: [
          { var: "sex", coding: { male: 0, female: 1 }, base: 0.956 },
          { var: "age", exp: 0.204 },
          { var: "weight_kg", exp: 0.175 },
        ],
        source: "Section 2.7: Yp = a × b^(woman) × …",
      },
      sd: null,
      dist: "ratio",
      ratio: { mean: 1.006, sd: 0.099, interval: [0.802, 1.195], source: "Table 5 (n = 910; interval = published '95% CI')" },
      validity: { age: [18, 79], bmi: [null, 30] },
    },  ],

  definitions: {
    ulnZ: 1.96,
    bands: [],
    source: "Section 2.10: normal if the OMAM-corrected value lies within the published 95% interval (Table 5)",
  },

  notes: [
    {
      id: "corrected-value",
      appliesTo: "all",
      severity: "info",
      text: "OMAM reports a corrected value Yc = observed ÷ predicted, with a normal range for Yc. Percent of predicted here equals 100 × Yc, and z = (Yc − mean Yc) ÷ SD of Yc.",
    },
    {
      id: "annulus-convention",
      appliesTo: { match: "^annulus-" },
      severity: "important",
      text: "The annulus was measured leading edge to leading edge at END-DIASTOLE, like the other levels, not inner edge in mid-systole as ASE recommends. These models are only used when the annulus convention is set to leading edge, end-diastole.",
    },
    {
      id: "combined-sd",
      appliesTo: { match: "-combined$" },
      severity: "info",
      text: "The paper gives reference values (Table 5) only for the Chinese and Italian equations. For the combined equations, the mean and SD of Yc come from the validation group by sex (Table 4, group B, about 30% of subjects), and the normal range is mean ± 1.96 SD. Treat it as provisional.",
    },
    {
      id: "interval",
      appliesTo: { match: "-(chinese|italian)$" },
      severity: "info",
      text: "The normal range uses the published limits of the corrected value (Table 5), as the authors recommend. Table 5 labels them '95% CI', but they are a reference interval (the range containing 95% of healthy values), not a confidence interval of the mean. They are asymmetric and not exactly mean ± 1.96 SD, so a z-score near ±2 can fall on either side of a limit.",
    },
    {
      id: "population-choice",
      appliesTo: "all",
      severity: "info",
      text: "Three equation sets were derived in Han Chinese, Italian and combined Chinese–Italian adults; the combined set is shown by default. Choose a population as a display option; race or ethnicity is never asked for. The authors caution that the equations may not apply to other populations.",
    },
    {
      id: "variables-differ",
      appliesTo: "all",
      severity: "info",
      text: "Which variables enter each equation differs by population (stepwise selection): the Chinese equations use weight but not height, so a taller patient of the same weight is predicted the same size.",
    },
    {
      id: "nonobese",
      appliesTo: "all",
      severity: "info",
      text: "Derived in non-obese adults (BMI < 30). Results above BMI 30 are flagged as extrapolated.",
    },
  ],

  tests: [
    {
      kind: "independent", source: "Authors' web calculator (github.com/xueyingzeng/OMAMaorta, index.html computeValue)",
      input: { sex: "male", age: 45, height_cm: 175, weight_kg: 75 },
      expect: { "sov-combined": { pred: 31.5051 } },
    },
    {
      kind: "independent", source: "Authors' web calculator (github.com/xueyingzeng/OMAMaorta, index.html computeValue)",
      input: { sex: "female", age: 62, height_cm: 160, weight_kg: 58 },
      expect: { "annulus-combined": { pred: 19.481 } },
    },
    {
      kind: "independent", source: "Authors' web calculator (github.com/xueyingzeng/OMAMaorta, index.html computeValue)",
      input: { sex: "male", age: 30, height_cm: 185, weight_kg: 90 },
      expect: { "aao-combined": { pred: 28.4477 } },
    },
    {
      kind: "independent", source: "Authors' web calculator (github.com/xueyingzeng/OMAMaorta, index.html computeValue)",
      input: { sex: "female", age: 55, height_cm: 158, weight_kg: 52 },
      expect: { "sov-chinese": { pred: 27.6674 } },
    },
    {
      kind: "independent", source: "Authors' web calculator (github.com/xueyingzeng/OMAMaorta, index.html computeValue)",
      input: { sex: "male", age: 70, height_cm: 170, weight_kg: 68 },
      expect: { "aao-chinese": { pred: 29.9737 } },
    },
    {
      kind: "independent", source: "Authors' web calculator (github.com/xueyingzeng/OMAMaorta, index.html computeValue)",
      input: { sex: "male", age: 40, height_cm: 180, weight_kg: 80 },
      expect: { "sov-italian": { pred: 31.9581 } },
    },
    {
      kind: "independent", source: "Authors' web calculator (github.com/xueyingzeng/OMAMaorta, index.html computeValue)",
      input: { sex: "female", age: 28, height_cm: 165, weight_kg: 60 },
      expect: { "annulus-italian": { pred: 18.2671 } },
    },    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14: Yc = 36 / 31.5051 = 1.1427; z = (1.1427 − 0.992) / 0.100",
      input: { sex: "male", age: 45, height_cm: 175, weight_kg: 75 },
      y: { sov: 36 },
      expect: { "sov-combined": { pctPred: 114.3, z: 1.51 } },
    },
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14: published Yc limits 0.792–1.213 × Yp 27.6674",
      input: { sex: "female", age: 55, height_cm: 158, weight_kg: 52 },
      expect: { "sov-chinese": { pred: 27.6674, lln: 21.9126, uln: 33.5606 } },
    },
    {
      kind: "independent", source: "parameterz/OMAM-Aortic-Root (v1.1) screenshot: Italian, male 45 y, 175 cm, 75 kg; annulus 24 mm: expected 20.8, z +1.72, normal 17.7–24.7",
      input: { sex: "male", age: 45, height_cm: 175, weight_kg: 75 },
      y: { annulus: 24 },
      expect: { "annulus-italian": { pred: 20.8, z: 1.72, lln: 17.7, uln: 24.7 } },
      tol: { pred: 0.05, z: 0.01, lln: 0.05, uln: 0.05 },
    },
    {
      kind: "independent", source: "parameterz/OMAM-Aortic-Root (v1.1): same patient, combined (provisional): expected 21.2, z +1.33, normal 16.9–25.3",
      input: { sex: "male", age: 45, height_cm: 175, weight_kg: 75 },
      y: { annulus: 24 },
      expect: { "annulus-combined": { pred: 21.2, z: 1.33, lln: 16.9, uln: 25.3 } },
      tol: { pred: 0.05, z: 0.01, lln: 0.05, uln: 0.05 },
    },
  ],

  verification: {
    status: "reviewed",
    reviewedBy: "Dan Dyar",
    date: "2026-11-15",
    against: "MedComm 2026;7:e70788 (published version): Sections 2.6–2.8, Tables 4–5, Figure 2",
    summary: "9 of 9 models checked against the paper; 11/11 tests passing (9 independent, 2 arithmetic). Agrees with values and notes.",
  },
};
