// @ts-check
// Mirea 2013: annulus, SoV, STJ and ascending aorta, INNER edge, end-diastole, in 500
// adults with normal echocardiograms (Centro Cardiologico Monzino, Milan).
// Transcribed as published from Table 2, checked against Figure 2B.
//
// Table 2: diameter/BSA (mm/m²), mean ± SD by sex and age decade. One model per
// decade (`when` guards), sex-keyed numbers. Predicted = ratio × BSA; SD scaled the same way.
//
// Model IDs: <site>-bsa-<under30|30to39|40to49|50to59|60to69|70plus>.
// Decades use completed years: <30 → [−, 30), 30–39 → [30, 40), …, ≥70 → [70, ∞)
// (Figure 2 labels the last group "≥70"; Table 2 prints ">70").
// Not used: the Table 4 regressions (AGr, AGWHr, AGWHa): no residual SD, so no normal
// range (site rule 7: no range, no model; drafted in 0.1.0, removed in 0.2.0); the "All"
// rows of Table 2 (no age); the aortic arch (suprasternal view,
// not a site on this form) and the aortic-septal angle.

/** @type {any} */
export default {
  schema: 1,
  id: "mirea2013",
  label: "Mirea 2013",
  entryVersion: "0.3.1",
  changelog: [
    { version: "0.1.0", date: "2026-11-14", by: "Claude", change: "Initial draft from PDF (Tables 2 and 4)" },
    { version: "0.2.0", date: "2026-11-14", by: "Claude", change: "Removed the 8 Table 4 regressions (AGWHr, AGWHa): no published SD (site rule 7, no range, no model). Table 2 models unchanged." },
    { version: "0.3.0", date: "2026-11-15", by: "Dan Dyar", change: "Reviewed against the paper: 24 of 24 models, all tests passing; agrees with values and notes" },
    { version: "0.3.1", date: "2026-11-15", by: "Claude", change: "Notes only: BSA-overcorrection note now says the paper's height-and-weight models are better by its own Table 5 but publish no residual SD; minor-inconsistencies note adds the Table 4 allometric footnote (sum printed, product intended). No values changed." },
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
      text: "Not healthy volunteers: consecutive patients referred for echocardiography whose studies were normal, enrolled retrospectively at one Italian centre (2007–2012), one expert reader. 14% had documented mild hypertension, and they are included in these Table 2 reference ranges. The authors describe the sample as homogeneous in race and ethnicity without naming it.",
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
      text: "The paper's own Table 5 shows that dividing by BSA overcorrects for body size: the BSA-indexed values still correlate with BSA, height and weight (r −0.30 to −0.48), so these z-scores run low in large and high in small patients. The paper's own regressions on age, sex, height and weight (Table 4, ratiometric and allometric) remove that correlation (|r| ≤ 0.03), and the authors conclude that scaling to height and weight would better separate normal from abnormal. Yet the reference ranges they publish are the BSA-indexed ones, and Table 4 reports coefficients and R² but no residual SD. Without that SD there is no normal range, so the better models cannot be used here.",
    },
    {
      id: "ratio-assumption",
      appliesTo: { match: "-bsa-" },
      severity: "info",
      text: "Predicted = the decade's mean ratio × the patient's BSA (DuBois), and the SD is scaled the same way.",
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
      text: "Minor inconsistencies not affecting the values used: Table 2 labels the oldest group '>70' where Figure 2 uses '≥70' (age 70 is placed in the oldest group here). In Table 4 (not used) the AGWHr SoV female constant 9.0 is printed with a 95% CI of 12.1 to 23.7, which excludes it. The Table 4 footnote prints the allometric model as a sum (constant·age^b + weight^b + height^b); the coefficients only reproduce the observed diameters as a product (constant × age^b × weight^b × height^b, height in cm).",
    },
  ],

  tests: [
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14: age 29.9 is still '<30'; 11.4 × 1.6221 ± 1.1 × 1.6221",
      input: { sex: "female", age: 29.9, height_cm: 160, weight_kg: 60 },
      y: { annulus: 21 },
      expect: { "annulus-bsa-under30": { pred: 18.492, z: 1.406, uln: 21.989 } },
      tol: { pred: 0.002, uln: 0.002 },
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
  ],

  verification: {
    status: "reviewed",
    reviewedBy: "Dan Dyar",
    date: "2026-11-15",
    against: "J Am Soc Echocardiogr 2013;26:419-427 (April 2013): Tables 1 and 2; Figure 2",
    summary: "24 of 24 models checked against the paper; 3/3 tests passing (3 arithmetic). Agrees with values and notes.",
  },
};
