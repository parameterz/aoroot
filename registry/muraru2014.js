// @ts-check
// Muraru 2014: ascending aorta (root, STJ, tubular) by leading-edge AND inner-edge
// conventions in 218 healthy Caucasian volunteers (Padua).
// Transcribed as published from Tables 2 and 4.
//
// Two kinds of model, end-diastole only (the paper's reference values are end-diastolic):
//  1. Table 2: median (IQR) and 95th percentile of diameter/BSA and diameter/height,
//     by sex, both conventions. Predicted = median ratio × body size. The SD is backed
//     out of the printed 95th percentile: (P95 − median) / 1.645, scaled the same way.
//     All values are printed as integers, so these models are `caution`.
//  2. Table 4: age + sex + BSA regressions, both conventions. No residual SD is
//     published, so these are mean-only: % predicted, no z-score.
//
// Model IDs: <site>-<ll|ii>-ed-<ht|bsa>, and <site>-<ll|ii>-ed-bsa-reg (same scheme as NORRE).
// Not used: Table 2 absolute (mm) values (sex only, no age or body size); Table 5 systolic
// means (pooled mean ± SD only); the height-and-weight models in the Supplementary data
// (not in the project).

/** @type {any} */
export default {
  schema: 1,
  id: "muraru2014",
  label: "Muraru 2014",
  entryVersion: "0.1.0",
  changelog: [
    { version: "0.1.0", date: "2026-11-14", by: "Claude", change: "Initial draft from PDF (Tables 2 and 4)" },
  ],

  citation: {
    authors: "Muraru D, Maffessanti F, Kocabay G, Peluso D, Dal Bianco L, Piasentini E, Jose SP, Iliceto S, Badano LP",
    title: "Ascending aorta diameters measured by echocardiography using both leading edge-to-leading edge and inner edge-to-inner edge conventions in healthy volunteers",
    journal: "Eur Heart J Cardiovasc Imaging",
    year: 2014,
    volume: 15,
    pages: "415-422",
    doi: "10.1093/ehjci/jet173",
    pmid: null,
  },

  population: {
    n: 218,
    female: 0.56, // 122 of 218
    age: { range: [18, 80], mean: 44, sd: 15 },
    height: { range: [null, null] }, // mean ± SD only: women 164 ± 7, men 177 ± 7 cm (Table 1)
    bsa: { range: [null, null], formula: "dubois" },
    composition: [{ group: "Caucasian", n: 218 }],
    region: "Single tertiary centre, University of Padua, Italy",
    inclusion: "Prospectively recruited healthy volunteers aged ≥18 (hospital employees, fellows, relatives, people attending driving- or work-licence medicals): no cardiovascular or lung disease or symptoms, no cardiovascular risk factors (hypertension, smoking, diabetes, dyslipidaemia), no cardio- or vaso-active treatment, normal ECG and examination.",
    exclusion: "Trained athletes, pregnancy, BMI > 30 kg/m², poor apical window; 9 of 227 enrolled excluded for poor parasternal window.",
    source: "Methods; Results; Table 1",
  },

  models: [

    // ── Table 2, leading edge, end-diastole: ratio to height (mm/m) ──
    {
      id: "sov-ll-ed-ht", label: "Muraru 2014 aortic root L–L end-diastole, height-indexed", status: "caution",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Aortic root at the sinuses of Valsalva" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 19, female: 18 } }], source: "Table 2 (aortic root/height, leading edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "height_m", coef: { male: 24, female: 21 } }] }, source: "Table 2 (aortic root/height, leading edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80] },
    },
    {
      id: "stj-ll-ed-ht", label: "Muraru 2014 STJ L–L end-diastole, height-indexed", status: "caution",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 17, female: 17 } }], source: "Table 2 (sinotubular junction/height, leading edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "height_m", coef: { male: 21, female: 19 } }] }, source: "Table 2 (sinotubular junction/height, leading edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80] },
    },
    {
      id: "aao-ll-ed-ht", label: "Muraru 2014 tubular aorta L–L end-diastole, height-indexed", status: "caution",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm from the STJ" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 17, female: 17 } }], source: "Table 2 (tubular/height, leading edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "height_m", coef: { male: 22, female: 20 } }] }, source: "Table 2 (tubular/height, leading edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80] },
    },

    // ── Table 2, leading edge, end-diastole: ratio to BSA (mm/m²) ──
    {
      id: "sov-ll-ed-bsa", label: "Muraru 2014 aortic root L–L end-diastole, BSA-indexed", status: "caution",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Aortic root at the sinuses of Valsalva" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 18, female: 18 } }], source: "Table 2 (aortic root/BSA, leading edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 21, female: 22 } }] }, source: "Table 2 (aortic root/BSA, leading edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80] },
    },
    {
      id: "stj-ll-ed-bsa", label: "Muraru 2014 STJ L–L end-diastole, BSA-indexed", status: "caution",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16, female: 17 } }], source: "Table 2 (sinotubular junction/BSA, leading edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 19, female: 20 } }] }, source: "Table 2 (sinotubular junction/BSA, leading edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80] },
    },
    {
      id: "aao-ll-ed-bsa", label: "Muraru 2014 tubular aorta L–L end-diastole, BSA-indexed", status: "caution",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm from the STJ" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16, female: 17 } }], source: "Table 2 (tubular/BSA, leading edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 19, female: 20 } }] }, source: "Table 2 (tubular/BSA, leading edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80] },
    },

    // ── Table 2, inner edge, end-diastole: ratio to height (mm/m) ──
    {
      id: "sov-ii-ed-ht", label: "Muraru 2014 aortic root I–I end-diastole, height-indexed", status: "caution",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Aortic root at the sinuses of Valsalva" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 18, female: 17 } }], source: "Table 2 (aortic root/height, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "height_m", coef: { male: 22, female: 20 } }] }, source: "Table 2 (aortic root/height, inner edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80] },
    },
    {
      id: "stj-ii-ed-ht", label: "Muraru 2014 STJ I–I end-diastole, height-indexed", status: "caution",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16, female: 15 } }], source: "Table 2 (sinotubular junction/height, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "height_m", coef: { male: 20, female: 18 } }] }, source: "Table 2 (sinotubular junction/height, inner edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80] },
    },
    {
      id: "aao-ii-ed-ht", label: "Muraru 2014 tubular aorta I–I end-diastole, height-indexed", status: "caution",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm from the STJ" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16, female: 16 } }], source: "Table 2 (tubular/height, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "height_m", coef: { male: 20, female: 19 } }] }, source: "Table 2 (tubular/height, inner edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80] },
    },

    // ── Table 2, inner edge, end-diastole: ratio to BSA (mm/m²) ──
    {
      id: "sov-ii-ed-bsa", label: "Muraru 2014 aortic root I–I end-diastole, BSA-indexed", status: "caution",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Aortic root at the sinuses of Valsalva" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16, female: 17 } }], source: "Table 2 (aortic root/BSA, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 19, female: 20 } }] }, source: "Table 2 (aortic root/BSA, inner edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80] },
    },
    {
      // Suppressed: the printed upper limit (28 mm/m² for both sexes) is 13–14 above the
      // median, about 8 SD on every other row. Transcribed as printed; see note stj-ii-bsa-uln.
      id: "stj-ii-ed-bsa", label: "Muraru 2014 STJ I–I end-diastole, BSA-indexed", status: "suppressed",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 14, female: 15 } }], source: "Table 2 (sinotubular junction/BSA, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 28, female: 28 } }] }, source: "Table 2 (sinotubular junction/BSA, inner edge, upper limit = 95th percentile; as printed)" },
      dist: "normal", validity: { age: [18, 80] },
    },
    {
      id: "aao-ii-ed-bsa", label: "Muraru 2014 tubular aorta I–I end-diastole, BSA-indexed", status: "caution",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm from the STJ" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15, female: 16 } }], source: "Table 2 (tubular/BSA, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 18, female: 19 } }] }, source: "Table 2 (tubular/BSA, inner edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80] },
    },

    // ── Table 4: age + sex + BSA regressions (mm), mean-only ──
    // Sex coding is not stated ("a dummy variable"); men = 1, women = 0 reproduces the
    // Table 2 medians at the Table 1 group means (tests 1–2). Phase is not stated in the
    // table; the predictions at the group means match end-diastole (Table 5), not end-systole.
    {
      id: "sov-ii-ed-bsa-reg", label: "Muraru 2014 aortic root I–I end-diastole, regression", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", phaseNote: "Not stated for Table 4; end-diastole inferred", view: "parasternal long axis", viewNote: "Aortic root at the sinuses of Valsalva" },
      mean: {
        type: "linear", intercept: 8.1,
        terms: [
          { var: "sex", coding: { male: 1, female: 0 }, coef: 1.5 },
          { var: "age", coef: 0.11 },
          { var: "bsa_dubois", coef: 8.7 },
        ],
        source: "Table 4 (root, inner edge)",
      },
      sd: null, dist: "normal", validity: { age: [18, 80] },
      stats: { r2: 0.48, n: 218 },
    },
    {
      id: "stj-ii-ed-bsa-reg", label: "Muraru 2014 STJ I–I end-diastole, regression", status: "ok",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", phaseNote: "Not stated for Table 4; end-diastole inferred", view: "parasternal long axis" },
      mean: {
        type: "linear", intercept: 7.1,
        terms: [
          { var: "sex", coding: { male: 1, female: 0 }, coef: 0.8 },
          { var: "age", coef: 0.09 },
          { var: "bsa_dubois", coef: 8.3 },
        ],
        source: "Table 4 (STJ, inner edge)",
      },
      sd: null, dist: "normal", validity: { age: [18, 80] },
      stats: { r2: 0.46, n: 218 },
    },
    {
      id: "aao-ii-ed-bsa-reg", label: "Muraru 2014 tubular aorta I–I end-diastole, regression", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", phaseNote: "Not stated for Table 4; end-diastole inferred", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm from the STJ" },
      mean: {
        type: "linear", intercept: 2.1,
        terms: [
          { var: "sex", coding: { male: 1, female: 0 }, coef: -0.9 },
          { var: "age", coef: 0.15 },
          { var: "bsa_dubois", coef: 10.5 },
        ],
        source: "Table 4 (Asc Ao, inner edge)",
      },
      sd: null, dist: "normal", validity: { age: [18, 80] },
      stats: { r2: 0.51, n: 218 },
    },
    {
      id: "sov-ll-ed-bsa-reg", label: "Muraru 2014 aortic root L–L end-diastole, regression", status: "ok",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", phaseNote: "Not stated for Table 4; end-diastole inferred", view: "parasternal long axis", viewNote: "Aortic root at the sinuses of Valsalva" },
      mean: {
        type: "linear", intercept: 7.8,
        terms: [
          { var: "sex", coding: { male: 1, female: 0 }, coef: 1.5 },
          { var: "age", coef: 0.13 },
          { var: "bsa_dubois", coef: 9.9 },
        ],
        source: "Table 4 (root, leading edge)",
      },
      sd: null, dist: "normal", validity: { age: [18, 80] },
      stats: { r2: 0.52, n: 218 },
    },
    {
      id: "stj-ll-ed-bsa-reg", label: "Muraru 2014 STJ L–L end-diastole, regression", status: "ok",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", phaseNote: "Not stated for Table 4; end-diastole inferred", view: "parasternal long axis" },
      mean: {
        type: "linear", intercept: 7.4,
        terms: [
          { var: "sex", coding: { male: 1, female: 0 }, coef: 1.0 },
          { var: "age", coef: 0.11 },
          { var: "bsa_dubois", coef: 9.1 },
        ],
        source: "Table 4 (STJ, leading edge)",
      },
      sd: null, dist: "normal", validity: { age: [18, 80] },
      stats: { r2: 0.52, n: 218 },
    },
    {
      id: "aao-ll-ed-bsa-reg", label: "Muraru 2014 tubular aorta L–L end-diastole, regression", status: "ok",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", phaseNote: "Not stated for Table 4; end-diastole inferred", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm from the STJ" },
      mean: {
        type: "linear", intercept: 4.6,
        terms: [
          { var: "sex", coding: { male: 1, female: 0 }, coef: -0.3 },
          { var: "age", coef: 0.16 },
          { var: "bsa_dubois", coef: 10.0 },
        ],
        source: "Table 4 (Asc Ao, leading edge)",
      },
      sd: null, dist: "normal", validity: { age: [18, 80] },
      stats: { r2: 0.55, n: 218 },
    },
  ],

  definitions: {
    ulnZ: 1.645,
    bands: [],
    source: "Table 2 footnote: upper limit = 95th percentile of normality (but Statistical analysis: limits = mean ± 2 SD)",
  },

  notes: [
    {
      id: "percentile-sd",
      appliesTo: { match: "-ed-(ht|bsa)$" },
      severity: "important",
      text: "Table 2 gives the median and the 95th percentile, not mean ± SD. Predicted here = median ratio × the patient's height or BSA; SD = (95th percentile − median) ÷ 1.645, scaled the same way. So z = +1.645 is the paper's own upper limit, and the site's default limit (z = 1.96) lies a little above it.",
    },
    {
      id: "integer-rounding",
      appliesTo: { match: "-ed-(ht|bsa)$" },
      severity: "important",
      text: "Every Table 2 value is printed as a whole number (e.g. 17 mm/m², upper limit 20). Rounding alone moves the predicted value by up to about ±3% and the SD by up to about ±25%, so z-scores from these models are approximate. The regressions (Table 4) are more precise for the predicted value but have no SD.",
    },
    {
      id: "uln-definition",
      appliesTo: { match: "-ed-(ht|bsa)$" },
      severity: "info",
      text: "The paper is inconsistent about its limits: the Table 2 footnote defines the upper limit as the 95th percentile, while Statistical analysis says limits were computed as mean ± 2 SD. The 95th percentile is used here because that is what the table says it prints.",
    },
    {
      id: "stj-ii-bsa-uln",
      appliesTo: ["stj-ii-ed-bsa"],
      severity: "important",
      text: "Hidden. Table 2 prints the inner-edge STJ/BSA upper limit as 28 mm/m² for both women (median 15) and men (median 14), about 8 SD above the median on the scale of every other row; probably a typesetting error (the pooled value in Table 3 is 18). Transcribed as printed and not shown. The inner-edge STJ height-indexed model and regression are unaffected.",
    },
    {
      id: "no-age-term",
      appliesTo: { match: "-ed-(ht|bsa)$" },
      severity: "important",
      text: "The indexed ratios have no age term, although age was an independent predictor at every level (Table 4). A ratio-based z-score therefore runs high in older and low in younger patients, compared with references that include age.",
    },
    {
      id: "ratio-assumption",
      appliesTo: { match: "-ed-(ht|bsa)$" },
      severity: "info",
      text: "Indexing to height or BSA assumes diameter is proportional to body size (exponent 1). The authors recommend the BSA-indexed, sex-specific values; height-indexed values are offered for obese patients.",
    },
    {
      id: "regression-no-sd",
      appliesTo: { match: "-reg$" },
      severity: "info",
      text: "No residual SD is published for the regressions (R² 0.46 to 0.55), so they give percent of predicted but no z-score.",
    },
    {
      id: "regression-coding",
      appliesTo: { match: "-reg$" },
      severity: "info",
      text: "The paper does not state how sex was coded or the cardiac phase for Table 4. Men = 1, women = 0 and end-diastole are inferred: with that coding, predictions at the Table 1 group means reproduce all twelve Table 2 medians within 1 mm, and the pooled predictions match the end-diastolic (not end-systolic) means in Table 5.",
    },
    {
      id: "aao-level",
      appliesTo: { match: "^aao-" },
      severity: "info",
      text: "The tubular ascending aorta was measured 1 cm from the STJ (as in NORRE), lower than the level of the right pulmonary artery used by Campens or the maximum diameter used by Mirea.",
    },
    {
      id: "errata",
      appliesTo: "all",
      severity: "info",
      text: "Minor inconsistencies not affecting the values used: Table 5 gives the leading-edge end-diastolic root as 30 ± 4 mm, against medians of 30 (women) and 34 (men) in Table 2 and 31 pooled in Table 3; the abstract gives age 42 ± 15 (all 227 enrolled) and Table 1 44 ± 15 (218 analysed). The paper notes that height- and weight-based models (Supplementary data, not reviewed here) did not improve on BSA.",
    },
    {
      id: "population",
      appliesTo: "all",
      severity: "info",
      text: "Prospectively recruited healthy Caucasian volunteers from one Italian centre, without hypertension or other cardiovascular risk factors, BMI ≤ 30; three experienced readers. Measured with modern harmonic imaging (2011–2013).",
    },
  ],

  tests: [
    {
      kind: "paper", source: "Table 1 women (45 y, 164 cm, 61 kg) → Table 2 women medians: root 28 / 30, STJ 25 / 27, tubular 26 / 29 mm (inner / leading edge); prediction at the group means ≈ group median",
      input: { sex: "female", age: 45, height_cm: 164, weight_kg: 61 },
      expect: {
        "sov-ii-ed-bsa-reg": { pred: 28 }, "stj-ii-ed-bsa-reg": { pred: 25 }, "aao-ii-ed-bsa-reg": { pred: 26 },
        "sov-ll-ed-bsa-reg": { pred: 30 }, "stj-ll-ed-bsa-reg": { pred: 27 }, "aao-ll-ed-bsa-reg": { pred: 29 },
      },
      tol: { pred: 1.0 },
    },
    {
      kind: "paper", source: "Table 1 men (44 y, 177 cm, 76 kg) → Table 2 men medians: root 31 / 34, STJ 28 / 31, tubular 29 / 31 mm (inner / leading edge)",
      input: { sex: "male", age: 44, height_cm: 177, weight_kg: 76 },
      expect: {
        "sov-ii-ed-bsa-reg": { pred: 31 }, "stj-ii-ed-bsa-reg": { pred: 28 }, "aao-ii-ed-bsa-reg": { pred: 29 },
        "sov-ll-ed-bsa-reg": { pred: 34 }, "stj-ll-ed-bsa-reg": { pred: 31 }, "aao-ll-ed-bsa-reg": { pred: 31 },
      },
      tol: { pred: 1.0 },
    },
    {
      kind: "paper", source: "Table 2 men, aortic root/height, leading edge: median 19, upper limit 24 mm/m; at 1.75 m → 33.25 and 42.0 mm",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      ulnZ: 1.645,
      expect: { "sov-ll-ed-ht": { pred: 33.25, uln: 42.0 } },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14: 16 × 1.6221; SD (19 − 16)/1.645 × 1.6221",
      input: { sex: "female", age: 65, height_cm: 160, weight_kg: 60 },
      y: { aao: 30 },
      expect: { "aao-ii-ed-bsa": { pred: 25.953, z: 1.368, uln: 31.751 } },
      tol: { pred: 0.002, uln: 0.002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14: 4.6 − 0.3 + 0.16 × 40 + 10.0 × 1.8481",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      y: { aao: 36 },
      expect: { "aao-ll-ed-bsa-reg": { pred: 29.181, pctPred: 123.4 } },
      tol: { pred: 0.002 },
    },
    {
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14: 19 × 1.75 + 1.96 × (24 − 19)/1.645 × 1.75 (site default limit)",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      expect: { "sov-ll-ed-ht": { uln: 43.676 } },
      tol: { uln: 0.002 },
    },
  ],

  verification: {
    status: "draft",
    reviewedBy: null,
    date: null,
    against: "Eur Heart J Cardiovasc Imaging 2014;15:415-422 (online 4 October 2013): Tables 1, 2, 4 and 5",
  },
};
