// @ts-check
// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY ENTRY TEMPLATE  (schema 1)
// Copy to registry/<id>.js, fill in, add one line to registry/index.js.
//
// Rules
//  1. Data only. No functions, no imports except the type annotation below.
//  2. Transcribe AS PUBLISHED. Never silently fix a number. Put a suspected
//     correction in `sd.variants` (or a mean variant) with a note explaining why.
//  3. Every number gets a `source` (table / page / figure) so it can be audited.
//  4. Only the fields marked [EVAL] are read by the evaluator. Everything else
//     is documentation (References page, "why?" notes, report text).
//  5. Intervals are HALF-OPEN everywhere: [min, max). Use null for open ends.
//  6. IDs are permanent. They appear in shared URLs and report text. Never
//     rename one; retire it with status: "suppressed" instead.
//  7. No range, no model. A model is used only if the paper gives a spread:
//     an SD/SEE, a CV, or a published limit (ULN or percentile) from which the SD
//     can be backed out with `fromLimits` — the latter only when a normal
//     distribution looks reasonable (e.g. mean ≈ median, SDs agree within
//     rounding); say how that was checked in a note. Equations with no spread
//     (mean-only) are left out, or suppressed in an entry already reviewed.
//     The validator enforces this. (Decided 2026-11-14.)
// ─────────────────────────────────────────────────────────────────────────────

/** @type {any} */  // later: import('../lib/schema.js').Reference for editor autocomplete
export default {
  schema: 1,                       // [EVAL] schema version this file follows
  id: "author2026",                // [EVAL] lowercase author + year (+ letter if needed)
  label: "Author 2026",            // short name shown in tables and report text
  entryVersion: "0.1.0",           // bump on any change to an [EVAL] field
  changelog: [
    // { version: "0.1.0", date: "2026-11-14", by: "Claude", change: "Initial draft from PDF" },
  ],

  citation: {
    authors: "",
    title: "",
    journal: "",
    year: 0,
    volume: 0,
    pages: "",
    doi: "",
    pmid: null,
  },

  // ── Documentation only ────────────────────────────────────────────────────
  population: {
    n: 0,
    female: null,                  // fraction, e.g. 0.54
    age: { range: [null, null], mean: null, sd: null },        // years
    height: { range: [null, null] },                           // cm
    bsa: { range: [null, null], formula: null },               // m²
    // Use the paper's own labels verbatim. Don't harmonize ("Asian" in WASE is
    // not "Chinese Han" in Yao). Race/ethnicity is never a patient input.
    composition: [
      // { group: "White", n: 540 }, { group: "Asian", n: 687 },
    ],
    region: "",                    // countries / sites
    inclusion: "",
    exclusion: "",
    source: "",                    // e.g. "Methods; Table 1"
  },

  // ── Models: one per (site × body-size approach × stratum) ─────────────────
  models: [
    {
      id: "sov-height",            // [EVAL] unique within this file
      label: "Author 2026, height model",
      status: "ok",                // [EVAL] "ok" | "caution" (show with warning) | "suppressed" (hide)

      measurement: {               // [EVAL] site + units; the rest is documentation
        site: "sov",               //   "annulus" | "sov" | "stj" | "aao"
        units: "cm",               //   units of the published outcome: "cm" | "mm"
        modality: "echo",          //   "echo" | "ct" | "cmr"
        // edge / phase / view are enums (lib/conventions.js); they decide which model
        // matches the convention the user selected. Put the paper's own wording in
        // edgeNote / phaseNote / viewNote. Hinge-to-hinge annulus = "inner".
        edge: "leading",           //   "leading" | "inner"
        phase: "end-diastole",     //   "end-diastole" | "mid-systole"
        view: "parasternal long axis", // "parasternal long axis" | "parasternal short axis"
        // sinus: "right" | "left" | "non" | "mean of three"   (short-axis measurements only)
      },

      // Alternatives: when a paper gives several versions of the same equation and only
      // one should be shown at a time (Yao: Chinese / Italian / combined populations;
      // Campens: DuBois / Haycock BSA), give each a `choice` with the same group. Exactly
      // one per group is the default; the user can switch (a view option, saved in the link).
      // Never a patient attribute.
      // choice: { group: "sov-population", label: "Chinese (Han)", default: false },
      // population: "Chinese (Han)",   // documentation: where this equation was derived

      // Optional stratum guard. The model applies only when ALL conditions hold.
      // Use for sex-specific equations (Campens) or age-group tables (WASE).
      // Guards may use only patient inputs (sex, age, body size), never race.
      // when: { sex: "female", age: [18, 41] },

      // [EVAL] Mean = predicted MEDIAN in published units. Types:
      //   constant  { value }
      //   linear    { intercept, terms: [{ var, coef, transform?, coding? }], outcome? }
      //             outcome: "ln" | "log10" if the paper predicts ln(y) or log10(y)
      //   power     { a, factors: [{ var, exp } | { var, coding, base }] }
      //             a × x^exp × base^code, for papers printing the multiplicative form
      //   table     { var, interp: "linear" | "step", rows: [[x, value], ...] }
      // Variables come from lib/covariates.js ONLY:
      //   age, sex, height_cm, height_m, weight_kg, bmi,
      //   bsa_dubois, bsa_mosteller, bsa_haycock, bsa_gehan
      // Term transforms: "ln" | "log10" | "sqrt" | "inv" | { pow: n } | { per: n }
      //   { per: 10 } on age = coefficient per decade, as some tables print it (Devereux)
      // Any number (intercept, coef, value, a, exp, base) may be keyed by sex:
      //   coef: { male: 19.0, female: 18.1 }
      // Ratio-indexed references (NORRE, WASE) are linear with no intercept:
      //   mean: { type: "linear", terms: [{ var: "height_m", coef: { male: 19.0, female: 18.1 } }] }
      //   sd:   { type: "linear", terms: [{ var: "height_m", coef: { male: 2.1,  female: 2.0  } }] }
      // Allometric (OMAM-style) models: `power` mean (or linear on ln terms with
      // outcome: "ln"), and dist: "lognormal" if the paper gives a log-scale SD.
      mean: {
        type: "linear",
        intercept: 0,
        terms: [
          { var: "age", coef: 0 },                                  // per YEAR
          { var: "height_cm", coef: 0 },
          { var: "sex", coding: { male: 1, female: 2 }, coef: 0 },  // copy the paper's coding exactly
        ],
        source: "Table 1",
      },

      // [EVAL] Spread. Types:
      //   constant    { value }                 SEE or residual SD, outcome units
      //   cv          { value }                 SD = value × mean (constant CV)
      //   linear / table                        same shapes as mean
      //   fromLimits  { uln: <mean-like spec>, z: 1.96 }
      //               for papers that publish only a ULN; SD = (ULN − mean) / z.
      //               z = 1.96 for a 97.5th percentile / mean + 1.96 SD,
      //               z = 1.645 for a 95th percentile, z = 2 for mean + 2 SD.
      // Optional variants: alternative values the UI can toggle, each tied to a note.
      // sd is REQUIRED (rule 7). Only `dist: "ratio"` takes its spread from `ratio`
      // instead, and a suppressed model may keep sd: null.
      // % predicted = observed / predicted median, for EVERY model (exp(μ) for lognormal).
      sd: {
        type: "constant",
        value: 0,
        source: "Table 1",
        // variants: [{ id: "corrected", value: 0, label: "", note: "note-id" }],
      },

      // [EVAL] How z is computed from mean (μ) and SD (σ):
      //   "normal"     z = (y − μ) / σ
      //   "lognormal"  z = (ln y − μ) / σ        (μ, σ on the ln scale)
      //   "lognormal10" z = (log10 y − μ) / σ    (σ = SEE on the log10 scale, e.g. Campens)
      //   "boxcox"     z = ((y/μ)^L − 1) / (L·σ) (LMS; σ is S, needs `L` below)
      //   "ratio"      z = (y/μ − c) / s          (OMAM-style corrected value; sd: null and
      //                ratio: { mean: c, sd: s, interval?: [lo, hi] } — the paper's mean and SD of
      //                observed/predicted; a published `interval` is used as the normal range)
      dist: "normal",
      // L: { type: "constant", value: 1 },

      // [EVAL] Inputs outside these ranges flag the result as extrapolated.
      // Exception to rule 5: these are observed min/max, so both ends are inclusive.
      // Use the ranges actually observed for THIS model (by sex if reported).
      validity: {
        age: [null, null],
        height_cm: [null, null],
        // bsa_dubois: [null, null],
      },

      stats: { r: null, r2: null, n: null },   // documentation
    },
  ],

  // How the paper itself defines abnormal (documentation + optional labels).
  definitions: {
    ulnZ: 1.96,
    bands: [
      // { label: "mild", z: [1.96, 3) }  → write as [1.96, 3]; half-open by rule 5
    ],
    source: "",
  },

  // Curator's notes. Shown wherever an affected model appears.
  notes: [
    // { id: "note-id", appliesTo: ["sov-height"] | "all" | { match: "-bsa$" }, severity: "important" | "info", text: "" },
    // `match` is a regular expression tested against model IDs, for notes that cover a group.
  ],

  // [EVAL] Test cases. Three kinds, in order of value:
  //   paper        values printed in the paper (tables, worked examples, figures).
  //                The ONLY kind that checks the transcription itself.
  //   independent  output of another implementation (old aoroot site, Marfan
  //                Foundation calculator, authors' spreadsheet).
  //   arithmetic   hand-calculated. Done from the PAPER's equations, these also
  //                guard against later edits to the file; done from the file's
  //                own coefficients, they check the evaluator only.
  // Expect any of: pred, z, pctPred, uln, lln (published units). covariates: { bsa_dubois: … }.
  // Optional per test: sdVariant: "<variant id>", ulnZ: 2 (default 1.96), tol: { pred, z, pctPred, uln }.
  // A legacy calculator that showed predicted mean and ULN only is still a good
  // `independent` test: expect { pred, uln } with no observed y.
  tests: [
    // {
    //   kind: "paper", source: "Table 3, row 2",
    //   input: { sex: "male", age: 40, height_cm: 175, weight_kg: 70 },
    //   y: { sov: 3.8 },                                  // observed, in published units
    //   expect: { "sov-height": { mean: 3.422, z: 1.76 } },
    //   tol: { mean: 0.001, z: 0.01 },
    // },
  ],

  verification: {
    status: "draft",               // [EVAL] "draft" | "reviewed" | "verified"; drafts are labelled in the UI
    reviewedBy: null,
    date: null,
    against: "",                   // which version of the paper (online-first vs print, erratum)
  },
};
