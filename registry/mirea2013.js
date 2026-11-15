// @ts-check
// Mirea 2013: annulus, SoV, STJ and ascending aorta, INNER edge, end-diastole, in 500
// adults with normal echocardiograms (Centro Cardiologico Monzino, Milan).
// Transcribed as published from Tables 2 and 4. Table 2 checked against Figure 2B.
//
// Two kinds of model:
//  1. Table 2: diameter/BSA (mm/m²), mean ± SD by sex and age decade. One model per
//     decade (`when` guards), sex-keyed numbers. Predicted = ratio × BSA; SD scaled the same way.
//  2. Table 4: regressions on age, sex, height and weight, in two forms the user can
//     switch between (`choice`): AGWHr (linear, default) and AGWHa (log-log, printed as
//     a product). No residual SD is published, so both are mean-only: % predicted, no z.
//
// Model IDs: <site>-bsa-<under30|30to39|40to49|50to59|60to69|70plus>, <site>-agwhr, <site>-agwha.
// Decades use completed years: <30 → [−, 30), 30–39 → [30, 40), …, ≥70 → [70, ∞)
// (Figure 2 labels the last group "≥70"; Table 2 prints ">70").
// Not used: model AGr (age and sex only; the paper's Table 5 shows it leaves a body-size
// correlation); the "All" rows of Table 2 (no age); the aortic arch (suprasternal view,
// not a site on this form) and the aortic-septal angle.

/** @type {any} */
export default {
  schema: 1,
  id: "mirea2013",
  label: "Mirea 2013",
  entryVersion: "0.1.0",
  changelog: [
    { version: "0.1.0", date: "2026-11-14", by: "Claude", change: "Initial draft from PDF (Tables 2 and 4)" },
  ],

  citation: {
    authors: "Mirea O, Maffessanti F, Gripari P, Tamborini G, Muratori M, Fusini L, Claudia C, Fiorentini C, Plesea IE, Pepi M",
    title: "Effects of aging and body size on proximal and ascending aorta and aortic arch: inner edge-to-inner edge reference values in a large adult population by two-dimensional transthoracic echocardiography",
    journal: "J Am Soc Echocardiogr",
    year: 2013,
    volume: 26,
    pages: "419-427",
    doi: "10.1016/j.echo.2012.12.013",
    pmid: null,
  },

  population: {
    n: 500,
    female: 0.462, // 231 of 500
    age: { range: [null, null], mean: 48, sd: 18 }, // range not stated; youngest group "<30"
    height: { range: [null, null] }, // mean ± SD only: women 163 ± 7, men 175 ± 8 cm (Table 1)
    bsa: { range: [null, null], formula: "dubois" },
    composition: [], // not named; Limitations: "homogeneous with respect to race and ethnicity"
    region: "Single centre, Centro Cardiologico Monzino IRCCS, Milan, Italy (2007–2012)",
    inclusion: "500 consecutive patients referred for echocardiography (routine evaluation, murmurs, suspected coronary disease, rhythm disturbances, other) with normal findings by 2005 ASE/EAE guidelines, retrospectively enrolled; aim ≥25 per sex and age decade. 70 (14%) had documented mild hypertension (SBP 140–160, DBP 90–100 mm Hg) without LV hypertrophy.",
    exclusion: "Poor image quality; BMI ≥ 30; diabetes; coronary, valve or congenital heart disease; renal disease; previous cardiac intervention.",
    source: "Methods; Table 1; Figure 2",
  },

  models: [

    // ── Table 2: aortic annulus/BSA (mm/m²), hinge points, inner edge, END-DIASTOLE ──
    {
      id: "annulus-bsa-under30", label: "Mirea 2013 annulus, BSA-indexed, <30 y", status: "ok",
      when: { age: [null, 30] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", edgeNote: "Hinge points of the right and noncoronary leaflets" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 11.4, female: 11.4 } }], source: "Table 2 (aortic annulus, <30)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.2, female: 1.1 } }], source: "Table 2 (aortic annulus, <30)" },
      dist: "normal", validity: {},
    },
    {
      id: "annulus-bsa-30to39", label: "Mirea 2013 annulus, BSA-indexed, 30–39 y", status: "ok",
      when: { age: [30, 40] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", edgeNote: "Hinge points of the right and noncoronary leaflets" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 11.4, female: 11.7 } }], source: "Table 2 (aortic annulus, 30–39)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.1, female: 1.0 } }], source: "Table 2 (aortic annulus, 30–39)" },
      dist: "normal", validity: {},
    },
    {
      id: "annulus-bsa-40to49", label: "Mirea 2013 annulus, BSA-indexed, 40–49 y", status: "ok",
      when: { age: [40, 50] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", edgeNote: "Hinge points of the right and noncoronary leaflets" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 11.5, female: 11.7 } }], source: "Table 2 (aortic annulus, 40–49)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 0.9, female: 1.0 } }], source: "Table 2 (aortic annulus, 40–49)" },
      dist: "normal", validity: {},
    },
    {
      id: "annulus-bsa-50to59", label: "Mirea 2013 annulus, BSA-indexed, 50–59 y", status: "ok",
      when: { age: [50, 60] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", edgeNote: "Hinge points of the right and noncoronary leaflets" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 11.5, female: 12.0 } }], source: "Table 2 (aortic annulus, 50–59)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 0.9, female: 0.9 } }], source: "Table 2 (aortic annulus, 50–59)" },
      dist: "normal", validity: {},
    },
    {
      id: "annulus-bsa-60to69", label: "Mirea 2013 annulus, BSA-indexed, 60–69 y", status: "ok",
      when: { age: [60, 70] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", edgeNote: "Hinge points of the right and noncoronary leaflets" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 12.1, female: 11.7 } }], source: "Table 2 (aortic annulus, 60–69)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.0, female: 1.1 } }], source: "Table 2 (aortic annulus, 60–69)" },
      dist: "normal", validity: {},
    },
    {
      id: "annulus-bsa-70plus", label: "Mirea 2013 annulus, BSA-indexed, ≥70 y", status: "ok",
      when: { age: [70, null] },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", edgeNote: "Hinge points of the right and noncoronary leaflets" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 12.0, female: 11.6 } }], source: "Table 2 (aortic annulus, >70)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.0, female: 1.1 } }], source: "Table 2 (aortic annulus, >70)" },
      dist: "normal", validity: {},
    },

    // ── Table 2: SoV/BSA (mm/m²) ──
    {
      id: "sov-bsa-under30", label: "Mirea 2013 SoV, BSA-indexed, <30 y", status: "ok",
      when: { age: [null, 30] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.3, female: 15.5 } }], source: "Table 2 (SoV, <30)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.8, female: 1.5 } }], source: "Table 2 (SoV, <30)" },
      dist: "normal", validity: {},
    },
    {
      id: "sov-bsa-30to39", label: "Mirea 2013 SoV, BSA-indexed, 30–39 y", status: "ok",
      when: { age: [30, 40] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.7, female: 16.5 } }], source: "Table 2 (SoV, 30–39)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.3, female: 1.6 } }], source: "Table 2 (SoV, 30–39)" },
      dist: "normal", validity: {},
    },
    {
      id: "sov-bsa-40to49", label: "Mirea 2013 SoV, BSA-indexed, 40–49 y", status: "ok",
      when: { age: [40, 50] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16.6, female: 16.8 } }], source: "Table 2 (SoV, 40–49)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.5, female: 1.4 } }], source: "Table 2 (SoV, 40–49)" },
      dist: "normal", validity: {},
    },
    {
      id: "sov-bsa-50to59", label: "Mirea 2013 SoV, BSA-indexed, 50–59 y", status: "ok",
      when: { age: [50, 60] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16.8, female: 17.9 } }], source: "Table 2 (SoV, 50–59)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.7, female: 1.6 } }], source: "Table 2 (SoV, 50–59)" },
      dist: "normal", validity: {},
    },
    {
      id: "sov-bsa-60to69", label: "Mirea 2013 SoV, BSA-indexed, 60–69 y", status: "ok",
      when: { age: [60, 70] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 17.8, female: 17.5 } }], source: "Table 2 (SoV, 60–69)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.6, female: 1.7 } }], source: "Table 2 (SoV, 60–69)" },
      dist: "normal", validity: {},
    },
    {
      id: "sov-bsa-70plus", label: "Mirea 2013 SoV, BSA-indexed, ≥70 y", status: "ok",
      when: { age: [70, null] },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 18.1, female: 18.2 } }], source: "Table 2 (SoV, >70)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.7, female: 1.9 } }], source: "Table 2 (SoV, >70)" },
      dist: "normal", validity: {},
    },

    // ── Table 2: STJ/BSA (mm/m²) ──
    {
      id: "stj-bsa-under30", label: "Mirea 2013 STJ, BSA-indexed, <30 y", status: "ok",
      when: { age: [null, 30] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 12.7, female: 13.5 } }], source: "Table 2 (STJ, <30)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 2.3, female: 1.4 } }], source: "Table 2 (STJ, <30)" },
      dist: "normal", validity: {},
    },
    {
      id: "stj-bsa-30to39", label: "Mirea 2013 STJ, BSA-indexed, 30–39 y", status: "ok",
      when: { age: [30, 40] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 13.3, female: 14.3 } }], source: "Table 2 (STJ, 30–39)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.3, female: 1.5 } }], source: "Table 2 (STJ, 30–39)" },
      dist: "normal", validity: {},
    },
    {
      id: "stj-bsa-40to49", label: "Mirea 2013 STJ, BSA-indexed, 40–49 y", status: "ok",
      when: { age: [40, 50] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 14.1, female: 14.6 } }], source: "Table 2 (STJ, 40–49)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.5, female: 1.2 } }], source: "Table 2 (STJ, 40–49)" },
      dist: "normal", validity: {},
    },
    {
      id: "stj-bsa-50to59", label: "Mirea 2013 STJ, BSA-indexed, 50–59 y", status: "ok",
      when: { age: [50, 60] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 14.1, female: 15.7 } }], source: "Table 2 (STJ, 50–59)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.5, female: 1.3 } }], source: "Table 2 (STJ, 50–59)" },
      dist: "normal", validity: {},
    },
    {
      id: "stj-bsa-60to69", label: "Mirea 2013 STJ, BSA-indexed, 60–69 y", status: "ok",
      when: { age: [60, 70] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.1, female: 14.7 } }], source: "Table 2 (STJ, 60–69)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.6, female: 1.6 } }], source: "Table 2 (STJ, 60–69)" },
      dist: "normal", validity: {},
    },
    {
      id: "stj-bsa-70plus", label: "Mirea 2013 STJ, BSA-indexed, ≥70 y", status: "ok",
      when: { age: [70, null] },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 14.7, female: 15.5 } }], source: "Table 2 (STJ, >70)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.6, female: 2.0 } }], source: "Table 2 (STJ, >70)" },
      dist: "normal", validity: {},
    },

    // ── Table 2: ascending aorta/BSA (mm/m²), maximum diameter visualized ──
    {
      id: "aao-bsa-under30", label: "Mirea 2013 ascending aorta, BSA-indexed, <30 y", status: "ok",
      when: { age: [null, 30] },
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Maximum diameter visualized; modified view one intercostal space higher if needed" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 14.3, female: 15.1 } }], source: "Table 2 (ascending aorta, <30)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.6, female: 1.6 } }], source: "Table 2 (ascending aorta, <30)" },
      dist: "normal", validity: {},
    },
    {
      id: "aao-bsa-30to39", label: "Mirea 2013 ascending aorta, BSA-indexed, 30–39 y", status: "ok",
      when: { age: [30, 40] },
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Maximum diameter visualized; modified view one intercostal space higher if needed" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 14.5, female: 16.4 } }], source: "Table 2 (ascending aorta, 30–39)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.4, female: 1.8 } }], source: "Table 2 (ascending aorta, 30–39)" },
      dist: "normal", validity: {},
    },
    {
      id: "aao-bsa-40to49", label: "Mirea 2013 ascending aorta, BSA-indexed, 40–49 y", status: "ok",
      when: { age: [40, 50] },
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Maximum diameter visualized; modified view one intercostal space higher if needed" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15.5, female: 16.4 } }], source: "Table 2 (ascending aorta, 40–49)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.5, female: 1.4 } }], source: "Table 2 (ascending aorta, 40–49)" },
      dist: "normal", validity: {},
    },
    {
      id: "aao-bsa-50to59", label: "Mirea 2013 ascending aorta, BSA-indexed, 50–59 y", status: "ok",
      when: { age: [50, 60] },
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Maximum diameter visualized; modified view one intercostal space higher if needed" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16.2, female: 18.0 } }], source: "Table 2 (ascending aorta, 50–59)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.6, female: 1.4 } }], source: "Table 2 (ascending aorta, 50–59)" },
      dist: "normal", validity: {},
    },
    {
      id: "aao-bsa-60to69", label: "Mirea 2013 ascending aorta, BSA-indexed, 60–69 y", status: "ok",
      when: { age: [60, 70] },
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Maximum diameter visualized; modified view one intercostal space higher if needed" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 17.3, female: 17.6 } }], source: "Table 2 (ascending aorta, 60–69)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.7, female: 1.7 } }], source: "Table 2 (ascending aorta, 60–69)" },
      dist: "normal", validity: {},
    },
    {
      id: "aao-bsa-70plus", label: "Mirea 2013 ascending aorta, BSA-indexed, ≥70 y", status: "ok",
      when: { age: [70, null] },
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Maximum diameter visualized; modified view one intercostal space higher if needed" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 17.5, female: 18.2 } }], source: "Table 2 (ascending aorta, >70)" },
      sd:   { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 1.4, female: 3.3 } }], source: "Table 2 (ascending aorta, >70)" },
      dist: "normal", validity: {},
    },

    // ── Table 4, model AGWHr (ratiometric): constant(sex) + age + weight + height (mm) ──
    // Height in cm, weight in kg (the only units that reproduce Table 2 at the Table 1 means).
    {
      id: "annulus-agwhr", label: "Mirea 2013 annulus, regression (linear)", status: "ok",
      choice: { group: "annulus-regression", label: "Linear (AGWHr)", default: true },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", edgeNote: "Hinge points of the right and noncoronary leaflets" },
      mean: {
        type: "linear", intercept: { male: 10.4, female: 8.7 },
        terms: [{ var: "age", coef: 0.020 }, { var: "weight_kg", coef: 0.048 }, { var: "height_cm", coef: 0.040 }],
        source: "Table 4 (model AGWHr, aortic annulus)",
      },
      sd: null, dist: "normal", validity: {},
      stats: { r2: 0.556 },
    },
    {
      id: "sov-agwhr", label: "Mirea 2013 SoV, regression (linear)", status: "ok",
      choice: { group: "sov-regression", label: "Linear (AGWHr)", default: true },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "linear", intercept: { male: 11.2, female: 9.0 },
        terms: [{ var: "age", coef: 0.097 }, { var: "weight_kg", coef: 0.056 }, { var: "height_cm", coef: 0.066 }],
        source: "Table 4 (model AGWHr, SoV)",
      },
      sd: null, dist: "normal", validity: {},
      stats: { r2: 0.577 },
    },
    {
      id: "stj-agwhr", label: "Mirea 2013 STJ, regression (linear)", status: "ok",
      choice: { group: "stj-regression", label: "Linear (AGWHr)", default: true },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "linear", intercept: { male: 13.3, female: 12.1 },
        terms: [{ var: "age", coef: 0.069 }, { var: "weight_kg", coef: 0.066 }, { var: "height_cm", coef: 0.028 }],
        source: "Table 4 (model AGWHr, STJ)",
      },
      sd: null, dist: "normal", validity: {},
      stats: { r2: 0.425 },
    },
    {
      id: "aao-agwhr", label: "Mirea 2013 ascending aorta, regression (linear)", status: "ok",
      choice: { group: "aao-regression", label: "Linear (AGWHr)", default: true },
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Maximum diameter visualized; modified view one intercostal space higher if needed" },
      mean: {
        type: "linear", intercept: { male: 16.6, female: 15.3 },
        terms: [{ var: "age", coef: 0.103 }, { var: "weight_kg", coef: 0.066 }, { var: "height_cm", coef: 0.020 }],
        source: "Table 4 (model AGWHr, ascending aorta)",
      },
      sd: null, dist: "normal", validity: {},
      stats: { r2: 0.531 },
    },

    // ── Table 4, model AGWHa (allometric): constant(sex) × age^b × weight^b × height^b (mm) ──
    {
      id: "annulus-agwha", label: "Mirea 2013 annulus, regression (allometric)", status: "caution",
      choice: { group: "annulus-regression", label: "Allometric (AGWHa)", default: false },
      measurement: { site: "annulus", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", edgeNote: "Hinge points of the right and noncoronary leaflets" },
      mean: {
        type: "power", a: { male: 1.6, female: 1.5 },
        factors: [{ var: "age", exp: 0.047 }, { var: "weight_kg", exp: 0.150 }, { var: "height_cm", exp: 0.347 }],
        source: "Table 4 (model AGWHa, aortic annulus)",
      },
      sd: null, dist: "normal", validity: {},
      stats: { r2: 0.566 },
    },
    {
      id: "sov-agwha", label: "Mirea 2013 SoV, regression (allometric)", status: "caution",
      choice: { group: "sov-regression", label: "Allometric (AGWHa)", default: false },
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "power", a: { male: 1.7, female: 1.6 },
        factors: [{ var: "age", exp: 0.143 }, { var: "weight_kg", exp: 0.102 }, { var: "height_cm", exp: 0.375 }],
        source: "Table 4 (model AGWHa, SoV)",
      },
      sd: null, dist: "normal", validity: {},
      stats: { r2: 0.605 },
    },
    {
      id: "stj-agwha", label: "Mirea 2013 STJ, regression (allometric)", status: "caution",
      choice: { group: "stj-regression", label: "Allometric (AGWHa)", default: false },
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: {
        type: "power", a: { male: 3.5, female: 3.3 },
        factors: [{ var: "age", exp: 0.130 }, { var: "weight_kg", exp: 0.176 }, { var: "height_cm", exp: 0.148 }],
        source: "Table 4 (model AGWHa, STJ)",
      },
      sd: null, dist: "normal", validity: {},
      stats: { r2: 0.340 },
    },
    {
      id: "aao-agwha", label: "Mirea 2013 ascending aorta, regression (allometric)", status: "ok",
      choice: { group: "aao-regression", label: "Allometric (AGWHa)", default: false },
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Maximum diameter visualized; modified view one intercostal space higher if needed" },
      mean: {
        type: "power", a: { male: 6.52, female: 6.20 },
        factors: [{ var: "age", exp: 0.150 }, { var: "weight_kg", exp: 0.145 }, { var: "height_cm", exp: 0.063 }],
        source: "Table 4 (model AGWHa, ascending aorta)",
      },
      sd: null, dist: "normal", validity: {},
      stats: { r2: 0.440 },
    },
  ],

  definitions: {
    ulnZ: 1.96,
    bands: [],
    source: "Not defined in the paper (Table 2 gives mean ± SD; the text quotes 95% CIs of the absolute values)",
  },

  notes: [
    {
      id: "population",
      appliesTo: "all",
      severity: "important",
      text: "Not healthy volunteers: consecutive patients referred for echocardiography whose studies were normal, enrolled retrospectively at one Italian centre (2007–2012), one expert reader. 14% had documented mild hypertension; they are included in the Table 2 reference ranges but excluded from the Table 4 regressions. The authors describe the sample as homogeneous in race and ethnicity without naming it.",
    },
    {
      id: "inner-edge-ed",
      appliesTo: "all",
      severity: "info",
      text: "Every level is inner edge at end-diastole, including the annulus (hinge points of the right and noncoronary leaflets). Mirea therefore appears only when the site's convention is set to I–I end-diastole; ASE recommends measuring the annulus in mid-systole.",
    },
    {
      id: "age-steps",
      appliesTo: { match: "-bsa-" },
      severity: "important",
      text: "Normal values change in steps at ages 30, 40, 50, 60 and 70 (one Table 2 row per decade), and do not always rise with age (e.g. women's STJ and ascending aorta are lower at 60–69 than at 50–59), so a z-score can jump on a birthday.",
    },
    {
      id: "bsa-overcorrects",
      appliesTo: { match: "-bsa-" },
      severity: "important",
      text: "The paper's own Table 5 shows that dividing by BSA overcorrects for body size: the BSA-indexed values still correlate with BSA, height and weight (r −0.30 to −0.48), so these z-scores run low in large and high in small patients. The height-and-weight regressions leave almost no residual correlation (|r| ≤ 0.03) but have no SD.",
    },
    {
      id: "ratio-assumption",
      appliesTo: { match: "-bsa-" },
      severity: "info",
      text: "Predicted = the decade's mean ratio × the patient's BSA (DuBois), and the SD is scaled the same way.",
    },
    {
      id: "regression-no-sd",
      appliesTo: { match: "-agwh[ra]$" },
      severity: "info",
      text: "No residual SD is published for the Table 4 regressions, so they give percent of predicted but no z-score. The paper's own 'aortic index' is the same quantity: observed ÷ expected.",
    },
    {
      id: "regression-forms",
      appliesTo: { match: "-agwh[ra]$" },
      severity: "info",
      text: "Two forms of the same adjustment: AGWHr is linear (constant for each sex + age + weight + height); AGWHa is the log-log fit, written as constant × age^b × weight^b × height^b (height in cm, weight in kg). The authors found no clear gain from the allometric form. The Table 4 footnote prints the AGWHa formula with '+' between the powers; a product is meant (only the product reproduces the Table 2 values).",
    },
    {
      id: "agwha-rounding",
      appliesTo: ["annulus-agwha", "sov-agwha", "stj-agwha"],
      severity: "important",
      text: "The AGWHa constants for the annulus, SoV and STJ are printed to one decimal (1.5/1.6, 1.6/1.7, 3.3/3.5), and the whole prediction scales with the constant: rounding alone can move it by up to about ±3% (annulus, SoV) or ±1.5% (STJ), roughly ±0.4 to ±0.9 mm. The ascending aorta constants have two decimals.",
    },
    {
      id: "height-weak",
      appliesTo: { match: "^(stj|aao)-agwh[ra]$" },
      severity: "info",
      text: "At the STJ and ascending aorta, height was not a significant predictor once weight was in the model (Table 4); weight and age carry most of the body-size effect here.",
    },
    {
      id: "aao-level",
      appliesTo: { match: "^aao-" },
      severity: "info",
      text: "The ascending aorta is the maximum diameter visualized, from a view one intercostal space higher when needed, so it may sit higher than the 1 cm above the STJ used by NORRE and Muraru.",
    },
    {
      id: "aao-70plus-women",
      appliesTo: ["aao-bsa-70plus"],
      severity: "info",
      text: "Women ≥70: SD 3.3 mm/m², about twice that of every other group, so the normal range for older women is wide.",
    },
    {
      id: "no-age-range",
      appliesTo: "all",
      severity: "info",
      text: "The paper gives no age range (mean 48 ± 18; youngest group '<30', oldest '≥70', at least 27 per sex and decade), so no age extrapolation warnings are shown.",
    },
    {
      id: "errata",
      appliesTo: "all",
      severity: "info",
      text: "Minor table errors not affecting the values used: Table 4 AGWHr SoV female constant 9.0 is printed with a 95% CI of 12.1 to 23.7, which excludes it; Table 2 labels the oldest group '>70' where Figure 2 uses '≥70'.",
    },
  ],

  tests: [
    {
      kind: "paper", source: "Table 1 women (49 y, 163 cm, 62 kg); Table 2 'All' women × mean BSA 1.65: SoV 17.0 → 28.05, ascending aorta 16.9 → 27.89, STJ 14.7 → 24.26 mm (prediction at the group means ≈ group mean)",
      input: { sex: "female", age: 49, height_cm: 163, weight_kg: 62 },
      expect: { "sov-agwhr": { pred: 28.05 }, "aao-agwha": { pred: 27.89 }, "stj-agwha": { pred: 24.26 } },
      tol: { pred: 0.5 },
    },
    {
      kind: "paper", source: "Table 1 men (47 y, 175 cm, 78 kg); Table 2 'All' men × mean BSA 1.92: ascending aorta 15.7 → 30.14, annulus 11.6 → 22.27 mm",
      input: { sex: "male", age: 47, height_cm: 175, weight_kg: 78 },
      expect: { "aao-agwhr": { pred: 30.14 }, "annulus-agwha": { pred: 22.27 } },
      tol: { pred: 0.5 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14: 17.9 × 1.6221 ± 1.6 × 1.6221",
      input: { sex: "female", age: 55, height_cm: 160, weight_kg: 60 },
      y: { sov: 33 },
      expect: { "sov-bsa-50to59": { pred: 29.035, z: 1.528, uln: 34.122 } },
      tol: { pred: 0.002, uln: 0.002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14: age 70 falls in the ≥70 group; 17.5 × 1.9803 ± 1.4 × 1.9803",
      input: { sex: "male", age: 70, height_cm: 178, weight_kg: 80 },
      y: { aao: 36 },
      expect: { "aao-bsa-70plus": { pred: 34.655, z: 0.485, uln: 40.089 } },
      tol: { pred: 0.002, uln: 0.002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14: 10.4 + 0.020 × 30 + 0.048 × 80 + 0.040 × 178",
      input: { sex: "male", age: 30, height_cm: 178, weight_kg: 80 },
      y: { annulus: 24 },
      expect: { "annulus-agwhr": { pred: 21.96, pctPred: 109.3 } },
      tol: { pred: 0.002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14: 1.7 × 62^0.143 × 70^0.102 × 170^0.375",
      input: { sex: "male", age: 62, height_cm: 170, weight_kg: 70 },
      y: { sov: 36 },
      expect: { "sov-agwha": { pred: 32.462, pctPred: 110.9 } },
      tol: { pred: 0.002 },
    },
  ],

  verification: {
    status: "draft",
    reviewedBy: null,
    date: null,
    against: "J Am Soc Echocardiogr 2013;26:419-427 (April 2013): Tables 1, 2 and 4; Figure 2",
  },
};
