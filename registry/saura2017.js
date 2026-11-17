// @ts-check
// Copyright © 2026 Dan Dyar. Licensed under CC BY-NC-SA 4.0 (see LICENSE-DATA and LICENSING.md).
// Published equations and values belong to the cited paper; this entry's curation, notes and checks are covered here.
// NORRE (Saura 2017): proximal aorta, healthy European adults.
// Transcribed as published from Tables 3 and 5. Table 3 values were checked
// against parameterz/dilated-af scripts/data.js (height ratios: all 19 match).
//
// Two kinds of model:
//  1. Ratios (Table 3): mean ± SD of diameter/height and diameter/BSA, by sex,
//     for every level × edge convention × phase. Assumes the ratio is normally
//     distributed, so predicted = ratio × body size and SD = ratio SD × body size.
//     No age term.
// Model IDs: <site>-<ll|ii|sax-…>-<ed|ms>-<ht|bsa>[-reg]. Notes target groups by ID pattern.
//  2. Regressions (Table 5): age + sex + height or BSA, for SV (mean of three
//     short-axis diameters) and TAA, inner edge, end-diastole. No residual SD
//     published, so no normal range: SUPPRESSED (site rule from 2026-11-14:
//     a model is shown only if the paper gives a range). Kept as transcribed.

/** @type {any} */
export default {
  schema: 1,
  id: "saura2017",
  label: "NORRE (Saura 2017)",
  entryVersion: "0.3.0",
  changelog: [
    { version: "0.1.0", date: "2026-11-14", by: "Claude", change: "Initial draft from PDF (Tables 3 and 5)" },
    { version: "0.2.0", date: "2026-11-15", by: "Dan Dyar", change: "Reviewed against the paper: 42 of 42 models, all tests passing; agrees with values and notes" },
    { version: "0.3.0", date: "2026-11-14", by: "Claude", change: "Table 5 regressions (4) suppressed: no published SD, so no normal range (site rule adopted by Dan Dyar 2026-11-14). Coefficients unchanged." },
  ],

  citation: {
    authors: "Saura D, Dulgheru R, Caballero L, Bernard A, Kou S, Gonjilashvili N, Athanassopoulos GD, Barone D, Baroni M, Cardim N, Hagendorff A, Hristova K, Lopez T, de la Morena G, Popescu BA, Penicka M, Ozyigit T, Rodrigo Carbonero JD, Van De Veire N, Von Bardeleben RS, Vinereanu D, Zamorano JL, Gori AS, Cosyns B, Donal E, Habib G, Addetia K, Lang RM, Badano LP, Lancellotti P",
    title: "Two-dimensional transthoracic echocardiographic normal reference ranges for proximal aorta dimensions: results from the EACVI NORRE study",
    journal: "Eur Heart J Cardiovasc Imaging",
    year: 2017,
    volume: 18,
    pages: "167-179",
    doi: "10.1093/ehjci/jew053",
    pmid: null,
  },

  population: {
    n: 704,
    female: 0.56, // 394 of 704
    age: { range: [19, 78], mean: 46.0, sd: 13.5 },
    height: { range: [null, null] }, // only medians and IQRs reported (Table 1)
    bsa: { range: [null, null], formula: null }, // formula not stated
    composition: [{ group: "Caucasian (broad European origin)", n: 704 }],
    region: "22 EACVI-accredited laboratories, mostly Europe",
    inclusion: "Healthy volunteers with normal anthropometric and clinical characteristics; images analysed centrally (Liège core lab).",
    exclusion: "161 of 865 enrolled excluded for incompatible image format or inadequate image quality.",
    source: "Methods; Table 1",
  },

  models: [

    // ── Ratios to height (mm/m), by sex. Predicted = ratio × height_m; SD = ratio SD × height_m. ──
    {
      id: "annulus-ll-ed-ht", label: "NORRE VAJ L–L end-diastole, height-indexed", status: "ok",
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 12.4, female: 11.8 } }], source: "Table 3 (VAJ/Ht, L–L end-diastole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.2, female: 1.2 } }], source: "Table 3 (VAJ/Ht, L–L end-diastole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-ll-ed-ht", label: "NORRE SV L–L end-diastole, height-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 19.0, female: 18.1 } }], source: "Table 3 (SV/Ht, L–L end-diastole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.1, female: 2.0 } }], source: "Table 3 (SV/Ht, L–L end-diastole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "stj-ll-ed-ht", label: "NORRE STJ L–L end-diastole, height-indexed", status: "ok",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16.2, female: 15.8 } }], source: "Table 3 (STJ/Ht, L–L end-diastole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.8, female: 1.8 } }], source: "Table 3 (STJ/Ht, L–L end-diastole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "aao-ll-ed-ht", label: "NORRE TAA L–L end-diastole, height-indexed", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 17.0, female: 16.7 } }], source: "Table 3 (TAA/Ht, L–L end-diastole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.2, female: 2.2 } }], source: "Table 3 (TAA/Ht, L–L end-diastole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "annulus-ii-ed-ht", label: "NORRE VAJ I–I end-diastole, height-indexed", status: "ok",
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 11.7, female: 11.1 } }], source: "Table 3 (VAJ/Ht, I–I end-diastole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.2, female: 1.3 } }], source: "Table 3 (VAJ/Ht, I–I end-diastole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-ii-ed-ht", label: "NORRE SV I–I end-diastole, height-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 17.8, female: 16.9 } }], source: "Table 3 (SV/Ht, I–I end-diastole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.0, female: 1.9 } }], source: "Table 3 (SV/Ht, I–I end-diastole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "stj-ii-ed-ht", label: "NORRE STJ I–I end-diastole, height-indexed", status: "ok",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 15.0, female: 14.4 } }], source: "Table 3 (STJ/Ht, I–I end-diastole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.8, female: 1.7 } }], source: "Table 3 (STJ/Ht, I–I end-diastole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "aao-ii-ed-ht", label: "NORRE TAA I–I end-diastole, height-indexed", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 15.7, female: 15.6 } }], source: "Table 3 (TAA/Ht, I–I end-diastole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.1, female: 2.1 } }], source: "Table 3 (TAA/Ht, I–I end-diastole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "annulus-ll-ms-ht", label: "NORRE VAJ L–L mid-systole, height-indexed", status: "ok",
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "leading", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 12.9, female: 12.5 } }], source: "Table 3 (VAJ/Ht, L–L mid-systole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.1, female: 1.1 } }], source: "Table 3 (VAJ/Ht, L–L mid-systole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-ll-ms-ht", label: "NORRE SV L–L mid-systole, height-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 19.6, female: 18.9 } }], source: "Table 3 (SV/Ht, L–L mid-systole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.1, female: 1.9 } }], source: "Table 3 (SV/Ht, L–L mid-systole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "stj-ll-ms-ht", label: "NORRE STJ L–L mid-systole, height-indexed", status: "ok",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16.8, female: 16.4 } }], source: "Table 3 (STJ/Ht, L–L mid-systole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.8, female: 1.8 } }], source: "Table 3 (STJ/Ht, L–L mid-systole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "aao-ll-ms-ht", label: "NORRE TAA L–L mid-systole, height-indexed", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 17.8, female: 17.6 } }], source: "Table 3 (TAA/Ht, L–L mid-systole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.1, female: 2.1 } }], source: "Table 3 (TAA/Ht, L–L mid-systole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "annulus-ii-ms-ht", label: "NORRE VAJ I–I mid-systole, height-indexed", status: "ok",
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 12.1, female: 11.7 } }], source: "Table 3 (VAJ/Ht, I–I mid-systole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.1, female: 1.0 } }], source: "Table 3 (VAJ/Ht, I–I mid-systole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-ii-ms-ht", label: "NORRE SV I–I mid-systole, height-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 18.3, female: 17.6 } }], source: "Table 3 (SV/Ht, I–I mid-systole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.0, female: 1.9 } }], source: "Table 3 (SV/Ht, I–I mid-systole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "stj-ii-ms-ht", label: "NORRE STJ I–I mid-systole, height-indexed", status: "ok",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 15.4, female: 15.1 } }], source: "Table 3 (STJ/Ht, I–I mid-systole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 1.8, female: 1.7 } }], source: "Table 3 (STJ/Ht, I–I mid-systole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "aao-ii-ms-ht", label: "NORRE TAA I–I mid-systole, height-indexed", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16.5, female: 16.4 } }], source: "Table 3 (TAA/Ht, I–I mid-systole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.1, female: 2.0 } }], source: "Table 3 (TAA/Ht, I–I mid-systole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-sax-right-ed-ht", label: "NORRE RCor short axis end-diastole, height-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal short axis", sinus: "right" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16.8, female: 16.1 } }], source: "Table 3 (RCor/Ht, short-axis end-diastole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.0, female: 1.7 } }], source: "Table 3 (RCor/Ht, short-axis end-diastole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-sax-left-ed-ht", label: "NORRE LCor short axis end-diastole, height-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal short axis", sinus: "left" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16.8, female: 16.4 } }], source: "Table 3 (LCor/Ht, short-axis end-diastole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.0, female: 1.9 } }], source: "Table 3 (LCor/Ht, short-axis end-diastole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-sax-non-ed-ht", label: "NORRE NCor short axis end-diastole, height-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal short axis", sinus: "non" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16.8, female: 16.5 } }], source: "Table 3 (NCor/Ht, short-axis end-diastole, mm/m)" },
      sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.0, female: 1.9 } }], source: "Table 3 (NCor/Ht, short-axis end-diastole, mm/m)" },
      dist: "normal", validity: { age: [19, 78] },
    },

    // ── Ratios to BSA (mm/m²), by sex. Predicted = ratio × bsa_dubois; SD = ratio SD × bsa_dubois. ──
    {
      id: "annulus-ll-ed-bsa", label: "NORRE VAJ L–L end-diastole, BSA-indexed", status: "ok",
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 11.6, female: 11.8 } }], source: "Table 3 (VAJ/BSA, L–L end-diastole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.8, female: 1.8 } }], source: "Table 3 (VAJ/BSA, L–L end-diastole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-ll-ed-bsa", label: "NORRE SV L–L end-diastole, BSA-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 17.9, female: 18.1 } }], source: "Table 3 (SV/BSA, L–L end-diastole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.7, female: 2.6 } }], source: "Table 3 (SV/BSA, L–L end-diastole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "stj-ll-ed-bsa", label: "NORRE STJ L–L end-diastole, BSA-indexed", status: "ok",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.2, female: 15.8 } }], source: "Table 3 (STJ/BSA, L–L end-diastole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.5, female: 2.3 } }], source: "Table 3 (STJ/BSA, L–L end-diastole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "aao-ll-ed-bsa", label: "NORRE TAA L–L end-diastole, BSA-indexed", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.9, female: 16.6 } }], source: "Table 3 (TAA/BSA, L–L end-diastole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.8, female: 2.8 } }], source: "Table 3 (TAA/BSA, L–L end-diastole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "annulus-ii-ed-bsa", label: "NORRE VAJ I–I end-diastole, BSA-indexed", status: "ok",
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 10.9, female: 11.1 } }], source: "Table 3 (VAJ/BSA, I–I end-diastole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.7, female: 1.8 } }], source: "Table 3 (VAJ/BSA, I–I end-diastole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-ii-ed-bsa", label: "NORRE SV I–I end-diastole, BSA-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16.7, female: 16.8 } }], source: "Table 3 (SV/BSA, I–I end-diastole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.5, female: 2.4 } }], source: "Table 3 (SV/BSA, I–I end-diastole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "stj-ii-ed-bsa", label: "NORRE STJ I–I end-diastole, BSA-indexed", status: "ok",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 14.0, female: 14.4 } }], source: "Table 3 (STJ/BSA, I–I end-diastole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.3, female: 2.2 } }], source: "Table 3 (STJ/BSA, I–I end-diastole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "aao-ii-ed-bsa", label: "NORRE TAA I–I end-diastole, BSA-indexed", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 14.7, female: 15.5 } }], source: "Table 3 (TAA/BSA, I–I end-diastole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.6, female: 2.7 } }], source: "Table 3 (TAA/BSA, I–I end-diastole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "annulus-ll-ms-bsa", label: "NORRE VAJ L–L mid-systole, BSA-indexed", status: "ok",
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "leading", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 12.1, female: 12.5 } }], source: "Table 3 (VAJ/BSA, L–L mid-systole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.7, female: 1.7 } }], source: "Table 3 (VAJ/BSA, L–L mid-systole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-ll-ms-bsa", label: "NORRE SV L–L mid-systole, BSA-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 18.4, female: 18.8 } }], source: "Table 3 (SV/BSA, L–L mid-systole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.7, female: 2.6 } }], source: "Table 3 (SV/BSA, L–L mid-systole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "stj-ll-ms-bsa", label: "NORRE STJ L–L mid-systole, BSA-indexed", status: "ok",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.8, female: 16.4 } }], source: "Table 3 (STJ/BSA, L–L mid-systole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.4, female: 2.4 } }], source: "Table 3 (STJ/BSA, L–L mid-systole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "aao-ll-ms-bsa", label: "NORRE TAA L–L mid-systole, BSA-indexed", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16.7, female: 17.6 } }], source: "Table 3 (TAA/BSA, L–L mid-systole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.8, female: 2.7 } }], source: "Table 3 (TAA/BSA, L–L mid-systole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "annulus-ii-ms-bsa", label: "NORRE VAJ I–I mid-systole, BSA-indexed", status: "ok",
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 11.3, female: 11.7 } }], source: "Table 3 (VAJ/BSA, I–I mid-systole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.6, female: 1.6 } }], source: "Table 3 (VAJ/BSA, I–I mid-systole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-ii-ms-bsa", label: "NORRE SV I–I mid-systole, BSA-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 17.2, female: 17.5 } }], source: "Table 3 (SV/BSA, I–I mid-systole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.6, female: 2.4 } }], source: "Table 3 (SV/BSA, I–I mid-systole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "stj-ii-ms-bsa", label: "NORRE STJ I–I mid-systole, BSA-indexed", status: "ok",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 14.5, female: 15.1 } }], source: "Table 3 (STJ/BSA, I–I mid-systole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.3, female: 2.2 } }], source: "Table 3 (STJ/BSA, I–I mid-systole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "aao-ii-ms-bsa", label: "NORRE TAA I–I mid-systole, BSA-indexed", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.5, female: 16.4 } }], source: "Table 3 (TAA/BSA, I–I mid-systole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.6, female: 2.6 } }], source: "Table 3 (TAA/BSA, I–I mid-systole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-sax-right-ed-bsa", label: "NORRE RCor short axis end-diastole, BSA-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal short axis", sinus: "right" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.8, female: 16.1 } }], source: "Table 3 (RCor/BSA, short-axis end-diastole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.5, female: 2.4 } }], source: "Table 3 (RCor/BSA, short-axis end-diastole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-sax-left-ed-bsa", label: "NORRE LCor short axis end-diastole, BSA-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal short axis", sinus: "left" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.7, female: 16.4 } }], source: "Table 3 (LCor/BSA, short-axis end-diastole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.5, female: 2.5 } }], source: "Table 3 (LCor/BSA, short-axis end-diastole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    {
      id: "sov-sax-non-ed-bsa", label: "NORRE NCor short axis end-diastole, BSA-indexed", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal short axis", sinus: "non" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.8, female: 16.4 } }], source: "Table 3 (NCor/BSA, short-axis end-diastole, mm/m²)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.4, female: 2.6 } }], source: "Table 3 (NCor/BSA, short-axis end-diastole, mm/m²)" },
      dist: "normal", validity: { age: [19, 78] },
    },
    // ── Regressions (Table 5), mm. Sex coded male = 1, female = 0. Mean-only, so suppressed. ──
    // Minus signs are rendered as "2" in the PDF text: "21.67 (27.06 to 3.72)"
    // is −1.67 (−7.06 to 3.72); the CI confirms the sign.
    {
      id: "sov-sax-mean-ed-ht-reg", label: "NORRE SV regression, height model", status: "suppressed",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole",
        view: "parasternal short axis", sinus: "mean of three" },
      mean: {
        type: "linear", intercept: -1.67,
        terms: [
          { var: "age", coef: 0.08 },
          { var: "sex", coding: { male: 1, female: 0 }, coef: 0.98 },
          { var: "height_cm", coef: 0.15 },
        ],
        source: "Table 5",
      },
      sd: null,
      dist: "normal", validity: { age: [19, 78] },
      stats: { r2: 0.301 },
    },
    {
      id: "aao-ii-ed-ht-reg", label: "NORRE TAA regression, height model", status: "suppressed",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "linear", intercept: 2.4,
        terms: [
          { var: "age", coef: 0.13 },
          { var: "sex", coding: { male: 1, female: 0 }, coef: 0.87 },
          { var: "height_cm", coef: 0.11 },
        ],
        source: "Table 5",
      },
      sd: null,
      dist: "normal", validity: { age: [19, 78] },
      stats: { r2: 0.29 },
    },
    {
      id: "sov-sax-mean-ed-bsa-reg", label: "NORRE SV regression, BSA model", status: "suppressed",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole",
        view: "parasternal short axis", sinus: "mean of three" },
      mean: {
        type: "linear", intercept: 17.33,
        terms: [
          { var: "age", coef: 0.06 },
          { var: "sex", coding: { male: 1, female: 0 }, coef: 1.86 },
          { var: "bsa_dubois", coef: 4.15 },
        ],
        source: "Table 5",
      },
      sd: null,
      dist: "normal", validity: { age: [19, 78] },
      stats: { r2: 0.259 },
    },
    {
      id: "aao-ii-ed-bsa-reg", label: "NORRE TAA regression, BSA model", status: "suppressed",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "linear", intercept: 16.07,
        terms: [
          { var: "age", coef: 0.11 },
          { var: "sex", coding: { male: 1, female: 0 }, coef: 1.56 },
          { var: "bsa_dubois", coef: 2.56 },
        ],
        source: "Table 5",
      },
      sd: null,
      dist: "normal", validity: { age: [19, 78] },
      stats: { r2: 0.267 },
    },
  ],

  definitions: {
    ulnZ: null, // the paper reports mean ± SD and nomograms; it gives no z-score definition or cutoff
    bands: [],
    source: "Discussion: 'provision of Z scores ... is beyond the scope of this study'",
  },

  notes: [
    {
      id: "no-age-term",
      appliesTo: { match: "-(ht|bsa)$" },  // all ratio models
      severity: "important",
      text: "The indexed ratios have no age term, although every level except the annulus grows with age in this cohort (Table 4). A ratio-based z-score therefore runs high in older and low in younger patients, compared with references that include age.",
    },
    {
      id: "ratio-assumption",
      appliesTo: { match: "-(ht|bsa)$" },  // all ratio models
      severity: "info",
      text: "Indexing to height or BSA assumes diameter is proportional to body size (exponent 1). Predicted values here are the mean ratio × the patient's height or BSA, and the SD is scaled the same way.",
    },
    {
      id: "bsa-formula",
      appliesTo: { match: "-bsa(-reg)?$" },  // every BSA-based model
      severity: "info",
      text: "The paper does not state which BSA formula was used. DuBois is assumed; common formulas differ by about 1 to 2% in adults.",
    },
    {
      id: "regression-sv-outcome",
      appliesTo: ["sov-sax-mean-ed-ht-reg", "sov-sax-mean-ed-bsa-reg"],
      severity: "important",
      text: "The SV regression predicts the MEAN of the three short-axis sinus diameters (right, left and non-coronary, inner edge, end-diastole), not the long-axis SV diameter, even though Table 5 labels it 'SV II end-diastole' (Methods and Results).",
    },
    {
      id: "regression-no-sd",
      appliesTo: ["sov-sax-mean-ed-ht-reg", "aao-ii-ed-ht-reg", "sov-sax-mean-ed-bsa-reg", "aao-ii-ed-bsa-reg"],
      severity: "info",
      text: "Not shown on the site. No residual SD is published for the regressions (adjusted R² 0.26 to 0.30 only), so they have no normal range; the site uses only models whose paper gives one. Kept here as transcribed.",
    },
    {
      id: "regression-rounding",
      appliesTo: ["sov-sax-mean-ed-ht-reg", "aao-ii-ed-ht-reg"],
      severity: "important",
      text: "Coefficients are published to two decimals. For the height models, rounding the height coefficient (0.15, 0.11) alone can shift the prediction by up to about ±0.9 mm at typical heights (about ±3%).",
    },
    {
      id: "table-errata",
      appliesTo: "all",
      severity: "info",
      text: "Minor table errors not affecting the values used here: Table 2 TAA I–I end-diastole mean 26.0 lies outside its own 95% CI (26.2–26.8); Table 2 STJ L–L mid-systole IQR reads 25.9–20.3; Table 3 VAJ/Ht L–L mid-systole has IQR and CI columns swapped; Table 4 I–I end-diastole STJ and TAA by-sex columns repeat the L–L values.",
    },
    {
      id: "population",
      appliesTo: "all",
      severity: "info",
      text: "Healthy volunteers of European (Caucasian) origin; the authors caution that application to other populations may not hold.",
    },
  ],

  tests: [
    {
      kind: "independent", source: "parameterz/dilated-af scripts/data.js (SOV, diastole, leading): 19.0 ± 2.1 mm/m",
      input: { sex: "male", age: 50, height_cm: 175, weight_kg: 75 },
      y: { sov: 38 },
      expect: { "sov-ll-ed-ht": { pred: 33.25, z: 1.29 } },
      tol: { pred: 0.01 },  // (38/1.75 − 19.0) / 2.1
    },
    {
      kind: "independent", source: "parameterz/dilated-af scripts/data.js (STJ, systole, inside): 15.1 ± 1.7 mm/m",
      input: { sex: "female", age: 50, height_cm: 160, weight_kg: 60 },
      y: { stj: 28 },
      expect: { "stj-ii-ms-ht": { pred: 24.16, z: 1.41 } },
      tol: { pred: 0.01 },  // (28/1.60 − 15.1) / 1.7
    },
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14: 17.9 × 1.848",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      y: { sov: 38 },
      expect: { "sov-ll-ed-bsa": { pred: 33.08, z: 0.99 } },  // (38/1.848 − 17.9) / 2.7
      tol: { pred: 0.01 },
    },
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14: −1.67 + 0.08×40 + 0.98 + 0.15×175",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      y: { sov: 32 },
      expect: { "sov-sax-mean-ed-ht-reg": { pred: 28.76, pctPred: 111.3 } },
      tol: { pred: 0.01 },
    },
    {
      kind: "arithmetic", source: "Hand calculation, 2026-11-14: 16.07 + 0.11×65 + 2.56×1.622",
      input: { sex: "female", age: 65, height_cm: 160, weight_kg: 60 },
      y: { aao: 30 },
      expect: { "aao-ii-ed-bsa-reg": { pred: 27.37, pctPred: 109.6 } },
      tol: { pred: 0.01 },
    },
  ],

  verification: {
    status: "reviewed",
    reviewedBy: "Dan Dyar",
    date: "2026-11-15",
    against: "EHJ-CVI 2017;18:167-179 (online 3 April 2016): Tables 3 and 5",
    summary: "42 of 42 models checked against the paper; 5/5 tests passing (2 independent, 3 arithmetic). Agrees with values and notes.",
  },
};
