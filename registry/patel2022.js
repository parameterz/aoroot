// @ts-check
// Copyright © 2026 Dan Dyar. Licensed under CC BY-NC-SA 4.0 (see LICENSE-DATA and LICENSING.md).
// Published equations and values belong to the cited paper; this entry's curation, notes and checks are covered here.
// WASE (Patel 2022): aortic annulus, SoV and STJ in 1,585 healthy adults from 15 countries.
// Transcribed as published from Table 3 and the equations printed under Figures 2 and 3.
// Table 3 height-indexed SoV and STJ values checked against parameterz/dilated-af data.js.
//
// Two kinds of model, each with one model per age group (`when` guards):
//  1. Table 3: mean ± SD by age group AND sex, as absolute diameter (mm), and
//     indexed to BSA (mm/m²) and height (mm/m). Indexed models assume the ratio is
//     normally distributed: predicted = ratio × body size, SD scaled the same way.
//  2. Figures 2 and 3: SoV nomograms vs BSA and height, men and women POOLED.
//     Mean = printed fit line; SD backed out of the printed ULN line.
//
// Model IDs: <site>-<abs|bsa|ht>-<18to40|41to65|over65>, and sov-fig-<bsa|ht>-<group>.
// The absolute (abs) models are suppressed since 0.3.0 (Dan, 2026-11-15: the site moves
// beyond absolute values); kept as transcribed so their IDs and tests stay valid.
// Age groups use completed years: 18–40 → [18, 41), 41–65 → [41, 66), >65 → [66, ∞).

/** @type {any} */
export default {
  schema: 1,
  id: "patel2022",
  label: "WASE (Patel 2022)",
  entryVersion: "0.3.0",
  changelog: [
    { version: "0.1.0", date: "2026-11-14", by: "Claude", change: "Initial draft from PDF (Table 3; Figures 2 and 3)" },
    { version: "0.2.0", date: "2026-11-15", by: "Dan Dyar", change: "Reviewed against the paper: 33 of 33 models, all tests passing; agrees with values and notes" },
    { version: "0.3.0", date: "2026-11-15", by: "Claude", change: "Suppressed the 9 absolute (mm) Table 3 models at Dan's request: the site moves beyond absolute values. BSA- and height-indexed models and the nomograms unchanged; coefficients kept as transcribed." },
  ],

  citation: {
    authors: "Patel HN, Miyoshi T, Addetia K, Citro R, Daimon M, Gutierrez Fajardo P, Kasliwal RR, Kirkpatrick JN, Monaghan MJ, Muraru D, Ogunyankin KO, Park SW, Ronderos RE, Sadeghpour A, Scalia GM, Takeuchi M, Tsang W, Tucay ES, Tude Rodrigues AC, Amuthan V, Zhang Y, Schreckenberg M, Blankenhagen M, Degel M, Hitschrich N, Mor-Avi V, Asch FM, Lang RM; WASE Investigators",
    title: "Normal values of aortic root size according to age, sex, and race: results of the World Alliance of Societies of Echocardiography study",
    journal: "J Am Soc Echocardiogr",
    year: 2022,
    volume: 35,
    pages: "267-274",
    doi: "10.1016/j.echo.2021.09.011",
    pmid: null,
  },

  population: {
    n: 1585,
    female: 0.496, // 786 of 1,585
    age: { range: [18, null], mean: 47, sd: 17 }, // upper age not stated; few subjects > 80
    height: { range: [null, null] },
    bsa: { range: [null, null], formula: "dubois" },
    composition: [
      { group: "Asian", n: 687 },
      { group: "White", n: 540 },
      { group: "Black", n: 182 },
      { group: "Other", n: 176 },
    ],
    region: "19 centers in 15 countries on six continents",
    inclusion: "Healthy adult volunteers without history or clinical evidence of heart, lung or kidney disease; enrolment balanced across six age × sex groups.",
    exclusion: "Incomplete data sets unsuitable for analysis.",
    source: "Methods; Table 1",
  },

  models: [

    // ── Table 3: annulus (I–I mid-systole), mean ± SD by age group and sex ──
    {
      id: "annulus-abs-18to40", label: "WASE annulus, absolute, 18–40 y", status: "suppressed",
      when: { age: [18, 41] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 21.5, female: 19.5 }, source: "Table 3 (annulus, mm)" },
      sd:   { type: "constant", value: { male: 2.1, female: 1.9 }, source: "Table 3 (annulus, mm)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "annulus-abs-41to65", label: "WASE annulus, absolute, 41–65 y", status: "suppressed",
      when: { age: [41, 66] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 21.2, female: 19.5 }, source: "Table 3 (annulus, mm)" },
      sd:   { type: "constant", value: { male: 2.2, female: 2.2 }, source: "Table 3 (annulus, mm)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "annulus-abs-over65", label: "WASE annulus, absolute, >65 y", status: "suppressed",
      when: { age: [66, null] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 20.7, female: 19.4 }, source: "Table 3 (annulus, mm)" },
      sd:   { type: "constant", value: { male: 2.2, female: 2.3 }, source: "Table 3 (annulus, mm)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "annulus-bsa-18to40", label: "WASE annulus, BSA-indexed, 18–40 y", status: "ok",
      when: { age: [18, 41] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 11.3, female: 12.0 } }], source: "Table 3 (BSA-indexed annulus, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.3, female: 1.4 } }], source: "Table 3 (BSA-indexed annulus, mm/m²)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "annulus-bsa-41to65", label: "WASE annulus, BSA-indexed, 41–65 y", status: "ok",
      when: { age: [41, 66] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 11.2, female: 11.7 } }], source: "Table 3 (BSA-indexed annulus, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.4, female: 1.4 } }], source: "Table 3 (BSA-indexed annulus, mm/m²)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "annulus-bsa-over65", label: "WASE annulus, BSA-indexed, >65 y", status: "ok",
      when: { age: [66, null] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 11.3, female: 12.1 } }], source: "Table 3 (BSA-indexed annulus, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.4, female: 1.6 } }], source: "Table 3 (BSA-indexed annulus, mm/m²)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "annulus-ht-18to40", label: "WASE annulus, height-indexed, 18–40 y", status: "ok",
      when: { age: [18, 41] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 12.3, female: 12.1 } }], source: "Table 3 (height-indexed annulus, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.1, female: 1.2 } }], source: "Table 3 (height-indexed annulus, mm/m)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "annulus-ht-41to65", label: "WASE annulus, height-indexed, 41–65 y", status: "ok",
      when: { age: [41, 66] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 12.3, female: 12.2 } }], source: "Table 3 (height-indexed annulus, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.2, female: 1.3 } }], source: "Table 3 (height-indexed annulus, mm/m)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "annulus-ht-over65", label: "WASE annulus, height-indexed, >65 y", status: "ok",
      when: { age: [66, null] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 12.2, female: 12.3 } }], source: "Table 3 (height-indexed annulus, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.2, female: 1.4 } }], source: "Table 3 (height-indexed annulus, mm/m)" },
      dist: "normal", validity: { age: [18, null] },
    },

    // ── Table 3: SoV (L–L end-diastole), mean ± SD by age group and sex ──
    {
      id: "sov-abs-18to40", label: "WASE SoV, absolute, 18–40 y", status: "suppressed",
      when: { age: [18, 41] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 31.2, female: 28.1 }, source: "Table 3 (SoV, mm)" },
      sd:   { type: "constant", value: { male: 3.4, female: 3.6 }, source: "Table 3 (SoV, mm)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "sov-abs-41to65", label: "WASE SoV, absolute, 41–65 y", status: "suppressed",
      when: { age: [41, 66] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 32.8, female: 29.8 }, source: "Table 3 (SoV, mm)" },
      sd:   { type: "constant", value: { male: 3.7, female: 3.2 }, source: "Table 3 (SoV, mm)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "sov-abs-over65", label: "WASE SoV, absolute, >65 y", status: "suppressed",
      when: { age: [66, null] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 33.1, female: 31.1 }, source: "Table 3 (SoV, mm)" },
      sd:   { type: "constant", value: { male: 4.0, female: 3.2 }, source: "Table 3 (SoV, mm)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "sov-bsa-18to40", label: "WASE SoV, BSA-indexed, 18–40 y", status: "ok",
      when: { age: [18, 41] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16.5, female: 17.3 } }], source: "Table 3 (BSA-indexed SoV, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.2, female: 2.4 } }], source: "Table 3 (BSA-indexed SoV, mm/m²)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "sov-bsa-41to65", label: "WASE SoV, BSA-indexed, 41–65 y", status: "ok",
      when: { age: [41, 66] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 17.4, female: 17.9 } }], source: "Table 3 (BSA-indexed SoV, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.4, female: 2.4 } }], source: "Table 3 (BSA-indexed SoV, mm/m²)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "sov-bsa-over65", label: "WASE SoV, BSA-indexed, >65 y", status: "ok",
      when: { age: [66, null] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 18.2, female: 19.3 } }], source: "Table 3 (BSA-indexed SoV, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.7, female: 2.8 } }], source: "Table 3 (BSA-indexed SoV, mm/m²)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "sov-ht-18to40", label: "WASE SoV, height-indexed, 18–40 y", status: "ok",
      when: { age: [18, 41] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 17.8, female: 17.4 } }], source: "Table 3 (height-indexed SoV, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.0, female: 2.3 } }], source: "Table 3 (height-indexed SoV, mm/m)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "sov-ht-41to65", label: "WASE SoV, height-indexed, 41–65 y", status: "ok",
      when: { age: [41, 66] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 19.0, female: 18.6 } }], source: "Table 3 (height-indexed SoV, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.1, female: 2.0 } }], source: "Table 3 (height-indexed SoV, mm/m)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "sov-ht-over65", label: "WASE SoV, height-indexed, >65 y", status: "ok",
      when: { age: [66, null] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 19.5, female: 19.7 } }], source: "Table 3 (height-indexed SoV, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.4, female: 2.1 } }], source: "Table 3 (height-indexed SoV, mm/m)" },
      dist: "normal", validity: { age: [18, null] },
    },

    // ── Table 3: STJ (L–L end-diastole), mean ± SD by age group and sex ──
    {
      id: "stj-abs-18to40", label: "WASE STJ, absolute, 18–40 y", status: "suppressed",
      when: { age: [18, 41] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 26.7, female: 24.4 }, source: "Table 3 (STJ, mm)" },
      sd:   { type: "constant", value: { male: 3.2, female: 3.3 }, source: "Table 3 (STJ, mm)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "stj-abs-41to65", label: "WASE STJ, absolute, 41–65 y", status: "suppressed",
      when: { age: [41, 66] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 28.4, female: 26.0 }, source: "Table 3 (STJ, mm)" },
      sd:   { type: "constant", value: { male: 3.6, female: 3.2 }, source: "Table 3 (STJ, mm)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "stj-abs-over65", label: "WASE STJ, absolute, >65 y", status: "suppressed",
      when: { age: [66, null] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "constant", value: { male: 28.6, female: 26.7 }, source: "Table 3 (STJ, mm)" },
      sd:   { type: "constant", value: { male: 4.0, female: 3.0 }, source: "Table 3 (STJ, mm)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "stj-bsa-18to40", label: "WASE STJ, BSA-indexed, 18–40 y", status: "ok",
      when: { age: [18, 41] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 14.1, female: 15.0 } }], source: "Table 3 (BSA-indexed STJ, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.0, female: 2.2 } }], source: "Table 3 (BSA-indexed STJ, mm/m²)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "stj-bsa-41to65", label: "WASE STJ, BSA-indexed, 41–65 y", status: "ok",
      when: { age: [41, 66] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.0, female: 15.6 } }], source: "Table 3 (BSA-indexed STJ, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.2, female: 2.2 } }], source: "Table 3 (BSA-indexed STJ, mm/m²)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "stj-bsa-over65", label: "WASE STJ, BSA-indexed, >65 y", status: "ok",
      when: { age: [66, null] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.7, female: 16.6 } }], source: "Table 3 (BSA-indexed STJ, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.6, female: 2.6 } }], source: "Table 3 (BSA-indexed STJ, mm/m²)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "stj-ht-18to40", label: "WASE STJ, height-indexed, 18–40 y", status: "ok",
      when: { age: [18, 41] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 15.2, female: 15.2 } }], source: "Table 3 (height-indexed STJ, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.9, female: 2.0 } }], source: "Table 3 (height-indexed STJ, mm/m)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "stj-ht-41to65", label: "WASE STJ, height-indexed, 41–65 y", status: "ok",
      when: { age: [41, 66] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16.5, female: 16.2 } }], source: "Table 3 (height-indexed STJ, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.1, female: 2.0 } }], source: "Table 3 (height-indexed STJ, mm/m)" },
      dist: "normal", validity: { age: [18, null] },
    },
    {
      id: "stj-ht-over65", label: "WASE STJ, height-indexed, >65 y", status: "ok",
      when: { age: [66, null] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16.9, female: 17.0 } }], source: "Table 3 (height-indexed STJ, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.4, female: 2.0 } }], source: "Table 3 (height-indexed STJ, mm/m)" },
      dist: "normal", validity: { age: [18, null] },
    },

    // ── Figures 2 and 3: SoV nomograms (L–L end-diastole), men and women pooled, cm. ──
    // Mean = printed fit line; SD backed out from the printed ULN line: (ULN − mean) / 1.96.
    {
      id: "sov-fig-bsa-18to40", label: "WASE SoV nomogram (BSA), 18–40 y", status: "ok",
      when: { age: [18, 41] },
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", intercept: 1.74, terms: [{ var: "bsa_dubois", coef: 0.69 }], source: "Figure 2 (18–40 y): y = 0.69x + 1.74" },
      sd: { type: "fromLimits", z: 1.96, uln: { type: "linear", intercept: 2.45, terms: [{ var: "bsa_dubois", coef: 0.69 }] }, source: "Figure 2 (18–40 y): ULN = 0.69·BSA + 2.45" },
      dist: "normal", validity: { age: [18, null] },
      stats: { r: 0.42 },
    },
    {
      id: "sov-fig-bsa-41to65", label: "WASE SoV nomogram (BSA), 41–65 y", status: "ok",
      when: { age: [41, 66] },
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", intercept: 1.88, terms: [{ var: "bsa_dubois", coef: 0.7 }], source: "Figure 2 (41–65 y): y = 0.7x + 1.88" },
      sd: { type: "fromLimits", z: 1.96, uln: { type: "linear", intercept: 2.6, terms: [{ var: "bsa_dubois", coef: 0.7 }] }, source: "Figure 2 (41–65 y): ULN = 0.7·BSA + 2.6" },
      dist: "normal", validity: { age: [18, null] },
      stats: { r: 0.38 },
    },
    {
      id: "sov-fig-bsa-over65", label: "WASE SoV nomogram (BSA), >65 y", status: "ok",
      when: { age: [66, null] },
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", intercept: 2.53, terms: [{ var: "bsa_dubois", coef: 0.39 }], source: "Figure 2 (>65 y): y = 0.39x + 2.53" },
      sd: { type: "fromLimits", z: 1.96, uln: { type: "linear", intercept: 3.22, terms: [{ var: "bsa_dubois", coef: 0.39 }] }, source: "Figure 2 (>65 y): ULN = 0.39·BSA + 3.22" },
      dist: "normal", validity: { age: [18, null] },
      stats: { r: 0.22 },
    },
    {
      id: "sov-fig-ht-18to40", label: "WASE SoV nomogram (height), 18–40 y", status: "caution",
      when: { age: [18, 41] },
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", intercept: 0.67, terms: [{ var: "height_cm", coef: 0.014 }], source: "Figure 3 (18–40 y): y = 0.014x + 0.67" },
      sd: { type: "fromLimits", z: 1.96, uln: { type: "linear", intercept: 1.33, terms: [{ var: "height_cm", coef: 0.014 }] }, source: "Figure 3 (18–40 y): ULN = 0.014·Height + 1.33" },
      dist: "normal", validity: { age: [18, null] },
      stats: { r: 0.37 },
    },
    {
      id: "sov-fig-ht-41to65", label: "WASE SoV nomogram (height), 41–65 y", status: "caution",
      when: { age: [41, 66] },
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", intercept: 0.45, terms: [{ var: "height_cm", coef: 0.016 }], source: "Figure 3 (41–65 y): y = 0.016x + 0.45" },
      sd: { type: "fromLimits", z: 1.96, uln: { type: "linear", intercept: 1.15, terms: [{ var: "height_cm", coef: 0.016 }] }, source: "Figure 3 (41–65 y): ULN = 0.016·Height + 1.15" },
      dist: "normal", validity: { age: [18, null] },
      stats: { r: 0.4 },
    },
    {
      id: "sov-fig-ht-over65", label: "WASE SoV nomogram (height), >65 y", status: "caution",
      when: { age: [66, null] },
      measurement: { site: "sov", units: "cm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", intercept: 1.45, terms: [{ var: "height_cm", coef: 0.01 }], source: "Figure 3 (>65 y): y = 0.01x + 1.45" },
      sd: { type: "fromLimits", z: 1.96, uln: { type: "linear", intercept: 2.25, terms: [{ var: "height_cm", coef: 0.01 }] }, source: "Figure 3 (>65 y): ULN = 0.01·Height + 2.25" },
      dist: "normal", validity: { age: [18, null] },
      stats: { r: 0.28 },
    },  ],

  definitions: {
    ulnZ: 1.96,
    bands: [],
    source: "Statistical Analysis: ULN = 97.5th percentile of each sex and age group, 'irrespective of whether the distribution is Gaussian'",
  },

  notes: [
    {
      id: "abs-suppressed",
      appliesTo: { match: "-abs-" },
      severity: "info",
      text: "Hidden. Table 3 also gives absolute diameters (mm) by sex and age group, with no body-size term. They are transcribed but not shown: the site uses only references that account for body size.",
    },
    {
      id: "uln-definition",
      appliesTo: { match: "-(abs|bsa|ht)-" },
      severity: "info",
      text: "The paper defines the upper limit of normal as the 97.5th percentile of each sex and age group, but tabulates only mean ± SD. Limits shown here are mean ± 1.96 SD, which match the 97.5th percentile only if the values are normally distributed.",
    },
    {
      id: "age-steps",
      appliesTo: "all",
      severity: "important",
      text: "Normal values change in steps at ages 41 and 66 (age groups 18–40, 41–65, >65), so a patient's z-score can jump on a birthday. The paper itself criticises older nomograms for a step change at age 40.",
    },
    {
      id: "nomogram-pooled",
      appliesTo: { match: "^sov-fig-" },
      severity: "important",
      text: "The SoV nomograms (Figures 2 and 3) pool men and women and have no sex term, although Table 3 shows larger height-indexed SoV in men in two of three age groups. The sex-specific Table 3 models are the closer match for an individual patient.",
    },
    {
      id: "nomogram-sd",
      appliesTo: { match: "^sov-fig-" },
      severity: "info",
      text: "The figures print the fit line and the ULN line; the ULN line is the fit shifted up by a constant (0.66 to 0.80 cm). The SD used here is that offset ÷ 1.96.",
    },
    {
      id: "nomogram-rounding",
      appliesTo: { match: "^sov-fig-ht-" },
      severity: "important",
      text: "The height coefficients are printed to two or three decimals (0.014, 0.016, 0.01/0.010 cm per cm). Rounding alone can shift the prediction by about ±0.9 mm at typical heights.",
    },
    {
      id: "ratio-assumption",
      appliesTo: { match: "-(bsa|ht)-(18to40|41to65|over65)$" },
      severity: "info",
      text: "Indexing to height or BSA assumes diameter is proportional to body size (exponent 1). Predicted values are the group's mean ratio × the patient's height or BSA, and the SD is scaled the same way.",
    },
    {
      id: "race-tables",
      appliesTo: "all",
      severity: "info",
      text: "Tables 4 and 5 report values by race (unadjusted for age); they are descriptive and not used as references here. The race counts in Table 4 (790 / 181 / 665) do not match Table 1 (687 Asian / 182 Black / 540 White / 176 Other).",
    },
    {
      id: "population",
      appliesTo: "all",
      severity: "info",
      text: "Multinational healthy volunteers (43% Asian, 34% White, 11% Black, 11% other); the equations have no race or ethnicity term. Few participants were older than 80.",
    },
  ],

  tests: [
    {
      kind: "independent", source: "parameterz/dilated-af scripts/data.js (WASE SOV 41-65, male): 19.0 ± 2.1 mm/m",
      input: { sex: "male", age: 50, height_cm: 175, weight_kg: 75 },
      y: { sov: 38 },
      expect: { "sov-ht-41to65": { pred: 33.25, z: 1.29 } },  // (38/1.75 − 19.0) / 2.1
      tol: { pred: 0.01 },
    },
    {
      kind: "independent", source: "parameterz/dilated-af scripts/data.js (WASE STJ >65, female): 17.0 ± 2.0 mm/m",
      input: { sex: "female", age: 72, height_cm: 160, weight_kg: 60 },
      y: { stj: 30 },
      expect: { "stj-ht-over65": { pred: 27.2, z: 0.88 } },  // (30/1.60 − 17.0) / 2.0
      tol: { pred: 0.01 },
    },
    {
      kind: "paper", source: "Figure 2, 18–40 y: mean 0.69·2.0 + 1.74; ULN 0.69·2.0 + 2.45",
      input: { sex: "female", age: 30, height_cm: 180, weight_kg: 80.34 },  // BSA (DuBois) = 2.000
      expect: { covariates: { bsa_dubois: 2.0 }, "sov-fig-bsa-18to40": { pred: 3.12, uln: 3.83 } },
      tol: { pred: 0.002, uln: 0.002, covariates: 0.002 },
    },
    {
      kind: "paper", source: "Figure 3, >65 y: mean 0.01·170 + 1.45; ULN 0.010·170 + 2.25",
      input: { sex: "male", age: 70, height_cm: 170, weight_kg: 70 },
      expect: { "sov-fig-ht-over65": { pred: 3.15, uln: 3.95 } },
    },
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14: Table 3 annulus absolute, women 18–40: 19.5 ± 1.9",
      input: { sex: "female", age: 40.9, height_cm: 165, weight_kg: 60 },
      y: { annulus: 23 },
      expect: { "annulus-abs-18to40": { pred: 19.5, z: 1.84 } },  // (23 − 19.5) / 1.9; age 40.9 is still "40"
    },
  ],

  verification: {
    status: "reviewed",
    reviewedBy: "Dan Dyar",
    date: "2026-11-15",
    against: "J Am Soc Echocardiogr 2022;35:267-274: Table 3; Figures 2 and 3 (equations read from the rendered page)",
    summary: "33 of 33 models checked against the paper; 5/5 tests passing (2 paper, 2 independent, 1 arithmetic). Agrees with values and notes.",
  },
};
