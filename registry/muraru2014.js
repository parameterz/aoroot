// @ts-check
// Copyright © 2026 Dan Dyar. Licensed under CC BY-NC-SA 4.0 (see LICENSE-DATA and LICENSING.md).
// Published equations and values belong to the cited paper; this entry's curation, notes and checks are covered here.
// Muraru 2014: ascending aorta (root, STJ, tubular) by leading-edge AND inner-edge
// conventions in 218 healthy Caucasian volunteers (Padua).
// Transcribed as published from Table 2.
//
// End-diastole only (the paper's reference values are end-diastolic).
// Table 2: median (IQR) and 95th percentile of diameter/BSA and diameter/height, by sex,
// both conventions. Predicted = median ratio × body size. The SD is backed out of the
// printed 95th percentile: (P95 − median) / 1.645, scaled the same way (rule 7; normality
// checked against Tables 3 and 5, see note normality-check). All values are printed as
// integers, so these models are `caution`.
//
// Model IDs: <site>-<ll|ii>-ed-<ht|bsa> (same scheme as NORRE).
// Not used: Table 4 regressions (age, sex, BSA): no residual SD, so no normal range
// (rule 7; drafted in 0.1.0, removed in 0.2.0); Table 2 absolute (mm) values (sex only,
// no age or body size); Table 5 systolic
// means (pooled mean ± SD only); the height-and-weight models in the Supplementary data
// (not in the project).

/** @type {any} */
export default {
  schema: 1,
  id: "muraru2014",
  label: "Muraru 2014",
  entryVersion: "0.3.1",
  changelog: [
    { version: "0.1.0", date: "2026-11-14", by: "Claude", change: "Initial draft from PDF (Tables 2 and 4)" },
    { version: "0.2.0", date: "2026-11-14", by: "Claude", change: "Removed the 6 Table 4 regressions: no published SD (site rule 7, no range, no model). Added the normality check and 95th-percentile paper tests. Table 2 models unchanged." },
    { version: "0.3.0", date: "2026-11-15", by: "Dan Dyar", change: "Reviewed against the paper: 12 of 12 models, all tests passing; agrees with values and notes" },
    { version: "0.3.1", date: "2026-11-16", by: "Claude", change: "Validity: BMI up to 30 on every model (Methods exclude BMI > 30), so obese patients get the 'outside study' flag. No values changed." },
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
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },
    {
      id: "stj-ll-ed-ht", label: "Muraru 2014 STJ L–L end-diastole, height-indexed", status: "caution",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 17, female: 17 } }], source: "Table 2 (sinotubular junction/height, leading edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "height_m", coef: { male: 21, female: 19 } }] }, source: "Table 2 (sinotubular junction/height, leading edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },
    {
      id: "aao-ll-ed-ht", label: "Muraru 2014 tubular aorta L–L end-diastole, height-indexed", status: "caution",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm from the STJ" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 17, female: 17 } }], source: "Table 2 (tubular/height, leading edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "height_m", coef: { male: 22, female: 20 } }] }, source: "Table 2 (tubular/height, leading edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },

    // ── Table 2, leading edge, end-diastole: ratio to BSA (mm/m²) ──
    {
      id: "sov-ll-ed-bsa", label: "Muraru 2014 aortic root L–L end-diastole, BSA-indexed", status: "caution",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Aortic root at the sinuses of Valsalva" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 18, female: 18 } }], source: "Table 2 (aortic root/BSA, leading edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 21, female: 22 } }] }, source: "Table 2 (aortic root/BSA, leading edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },
    {
      id: "stj-ll-ed-bsa", label: "Muraru 2014 STJ L–L end-diastole, BSA-indexed", status: "caution",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16, female: 17 } }], source: "Table 2 (sinotubular junction/BSA, leading edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 19, female: 20 } }] }, source: "Table 2 (sinotubular junction/BSA, leading edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },
    {
      id: "aao-ll-ed-bsa", label: "Muraru 2014 tubular aorta L–L end-diastole, BSA-indexed", status: "caution",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "leading", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm from the STJ" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16, female: 17 } }], source: "Table 2 (tubular/BSA, leading edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 19, female: 20 } }] }, source: "Table 2 (tubular/BSA, leading edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },

    // ── Table 2, inner edge, end-diastole: ratio to height (mm/m) ──
    {
      id: "sov-ii-ed-ht", label: "Muraru 2014 aortic root I–I end-diastole, height-indexed", status: "caution",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Aortic root at the sinuses of Valsalva" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 18, female: 17 } }], source: "Table 2 (aortic root/height, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "height_m", coef: { male: 22, female: 20 } }] }, source: "Table 2 (aortic root/height, inner edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },
    {
      id: "stj-ii-ed-ht", label: "Muraru 2014 STJ I–I end-diastole, height-indexed", status: "caution",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16, female: 15 } }], source: "Table 2 (sinotubular junction/height, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "height_m", coef: { male: 20, female: 18 } }] }, source: "Table 2 (sinotubular junction/height, inner edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },
    {
      id: "aao-ii-ed-ht", label: "Muraru 2014 tubular aorta I–I end-diastole, height-indexed", status: "caution",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm from the STJ" },
      mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 16, female: 16 } }], source: "Table 2 (tubular/height, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "height_m", coef: { male: 20, female: 19 } }] }, source: "Table 2 (tubular/height, inner edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },

    // ── Table 2, inner edge, end-diastole: ratio to BSA (mm/m²) ──
    {
      id: "sov-ii-ed-bsa", label: "Muraru 2014 aortic root I–I end-diastole, BSA-indexed", status: "caution",
      measurement: { site: "sov", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Aortic root at the sinuses of Valsalva" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 16, female: 17 } }], source: "Table 2 (aortic root/BSA, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 19, female: 20 } }] }, source: "Table 2 (aortic root/BSA, inner edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },
    {
      // Suppressed: the printed upper limit (28 mm/m² for both sexes) is 13–14 above the
      // median, about 8 SD on every other row. Transcribed as printed; see note stj-ii-bsa-uln.
      id: "stj-ii-ed-bsa", label: "Muraru 2014 STJ I–I end-diastole, BSA-indexed", status: "suppressed",
      measurement: { site: "stj", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 14, female: 15 } }], source: "Table 2 (sinotubular junction/BSA, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 28, female: 28 } }] }, source: "Table 2 (sinotubular junction/BSA, inner edge, upper limit = 95th percentile; as printed)" },
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },
    {
      id: "aao-ii-ed-bsa", label: "Muraru 2014 tubular aorta I–I end-diastole, BSA-indexed", status: "caution",
      measurement: { site: "aao", units: "mm", modality: "echo", edge: "inner", phase: "end-diastole", view: "parasternal long axis", viewNote: "Proximal tubular ascending aorta, 1 cm from the STJ" },
      mean: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 15, female: 16 } }], source: "Table 2 (tubular/BSA, inner edge, median)" },
      sd:   { type: "fromLimits", z: 1.645, uln: { type: "linear", terms: [{ var: "bsa_dubois", coef: { male: 18, female: 19 } }] }, source: "Table 2 (tubular/BSA, inner edge, upper limit = 95th percentile)" },
      dist: "normal", validity: { age: [18, 80], bmi: [null, 30] },
    },

  ],

  definitions: {
    ulnZ: 1.645, // the paper's own limit (documentation); the site keeps its 1.96 default (decided 2026-11-14)
    bands: [],
    source: "Table 2 footnote: upper limit = 95th percentile of normality (but Statistical analysis: limits = mean ± 2 SD)",
  },

  notes: [
    {
      id: "percentile-sd",
      appliesTo: { match: "-ed-(ht|bsa)$" },
      severity: "important",
      text: "Table 2 gives the median and the 95th percentile, not mean ± SD. Predicted here = median ratio × the patient's height or BSA; SD = (95th percentile − median) ÷ 1.645, scaled the same way. So z = +1.645 is the paper's own upper limit, and the site's default limit (z = 1.96, used for every reference) lies a little above it.",
    },
    {
      id: "integer-rounding",
      appliesTo: { match: "-ed-(ht|bsa)$" },
      severity: "important",
      text: "Every Table 2 value is printed as a whole number (e.g. 17 mm/m², upper limit 20). Rounding alone moves the predicted value by up to about ±3% and the SD by up to about ±25%, so z-scores from these models are approximate.",
    },
    {
      id: "normality-check",
      appliesTo: { match: "-ed-(ht|bsa)$" },
      severity: "info",
      text: "Is a normal distribution reasonable? The paper reports the pooled absolute diameters both ways (Table 3: median and 95th percentile; Table 5: mean ± SD). Mean and median agree within 1 mm at every level and convention, and the SD backed out of the 95th percentile (3.6 to 4.9 mm) agrees with the printed SD (3 to 4 mm, whole numbers) within rounding, with a slightly longer upper tail at the root. Close enough to normal to back out an SD.",
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
      text: "Hidden. Table 2 prints the inner-edge STJ/BSA upper limit as 28 mm/m² for both women (median 15) and men (median 14), about 8 SD above the median on the scale of every other row; probably a typesetting error (the pooled value in Table 3 is 18). Transcribed as printed and not shown. The inner-edge STJ height-indexed model is unaffected.",
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
      id: "aao-level",
      appliesTo: { match: "^aao-" },
      severity: "info",
      text: "The tubular ascending aorta was measured 1 cm from the STJ (as in NORRE), lower than the level of the right pulmonary artery used by Campens or the maximum diameter used by Mirea.",
    },
    {
      id: "errata",
      appliesTo: "all",
      severity: "info",
      text: "Minor inconsistencies not affecting the values used: Table 4 (regressions, not used here) does not state the sex coding or cardiac phase; Table 5 gives the leading-edge end-diastolic root as 30 ± 4 mm, against medians of 30 (women) and 34 (men) in Table 2 and 31 pooled in Table 3; the abstract gives age 42 ± 15 (all 227 enrolled) and Table 1 44 ± 15 (218 analysed). The paper notes that height- and weight-based models (Supplementary data, not reviewed here) did not improve on BSA.",
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
      kind: "paper", source: "Table 2 women, tubular/BSA, inner edge: median 16, upper limit 19 mm/m²; at BSA 1.6221 → 25.953 and 30.819 mm",
      input: { sex: "female", age: 65, height_cm: 160, weight_kg: 60 },
      ulnZ: 1.645,
      expect: { "aao-ii-ed-bsa": { pred: 25.953, uln: 30.819 } },
      tol: { pred: 0.002, uln: 0.002 },
    },
    {
      kind: "paper", source: "Table 2 women, sinotubular junction/height, leading edge: median 17, upper limit 19 mm/m; at 1.60 m → 27.2 and 30.4 mm",
      input: { sex: "female", age: 50, height_cm: 160, weight_kg: 60 },
      ulnZ: 1.645,
      expect: { "stj-ll-ed-ht": { pred: 27.2, uln: 30.4 } },
    },
    {
      kind: "paper", source: "Table 2 men, aortic root/BSA, inner edge: median 16, upper limit 19 mm/m²; at BSA 1.8481 → 29.570 and 35.114 mm",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      ulnZ: 1.645,
      expect: { "sov-ii-ed-bsa": { pred: 29.570, uln: 35.114 } },
      tol: { pred: 0.002, uln: 0.002 },
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
      kind: "arithmetic", source: "Hand calculation (Python), 2026-11-14: 19 × 1.75 + 1.96 × (24 − 19)/1.645 × 1.75 (site default limit)",
      input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
      expect: { "sov-ll-ed-ht": { uln: 43.676 } },
      tol: { uln: 0.002 },
    },
  ],

  verification: {
    status: "reviewed",
    reviewedBy: "Dan Dyar",
    date: "2026-11-15",
    against: "Eur Heart J Cardiovasc Imaging 2014;15:415-422 (online 4 October 2013): Tables 1, 2, 3 and 5",
    summary: "12 of 12 models checked against the paper; 6/6 tests passing (4 paper, 2 arithmetic). Agrees with values and notes.",
  },
};
