// @ts-check
// The evaluator. Registry files hold data; this file holds all the math.
//
// A model is three pieces:
//   mean  → predicted MEDIAN, in the model's published units
//   sd    → spread (meaning depends on dist; may be null = mean-only model)
//   dist  → how z is computed from (y, median, sd)
// % predicted = y / median for every model. z only when sd exists.

import { covariates, convert, VARIABLES } from "./covariates.js";

// ── Term transforms ─────────────────────────────────────────────────────────
const TRANSFORMS = { ln: Math.log, log10: Math.log10, sqrt: Math.sqrt, inv: (x) => 1 / x };
const INVERSE = { ln: Math.exp, log10: (x) => 10 ** x };

function transform(t, x) {
  if (!t) return x;
  if (typeof t === "object" && "pow" in t) return x ** t.pow;
  return TRANSFORMS[t](x);
}

/** Value of a variable for a term: applies `coding` (categorical) or `transform`. */
function value(term, cov) {
  const raw = cov[term.var];
  if (raw === undefined) throw new MissingInput(term.var);
  if (term.coding) {
    if (!(raw in term.coding)) throw new Error(`No coding for ${term.var}=${raw}`);
    return term.coding[raw];
  }
  return transform(term.transform, raw);
}

class MissingInput extends Error {
  constructor(v) { super(`missing input: ${v}`); this.variable = v; }
}

// ── Expression types (used by mean, sd, L) ──────────────────────────────────
// Each returns a number from (spec, covariates).
const EXPR = {
  constant: (s) => s.value,

  // intercept + Σ coef × value(term). Optional `outcome: "ln" | "log10"` means
  // the published equation predicts ln(y) or log10(y); we back-transform.
  linear: (s, cov) => {
    const lin = s.intercept + s.terms.reduce((sum, t) => sum + t.coef * value(t, cov), 0);
    return s.outcome ? INVERSE[s.outcome](lin) : lin;
  },

  // a × Π factors. Factor is { var, exp } → x^exp, or { var, coding, base } → base^code.
  // Matches papers that print the multiplicative form (Yao OMAM: 9.593 × 0.943^sex × age^0.054 …).
  power: (s, cov) =>
    s.factors.reduce(
      (prod, f) => prod * (f.coding ? f.base ** value(f, cov) : value(f, cov) ** f.exp),
      s.a,
    ),

  // Lookup along one variable. rows: [[x, value], ...] sorted by x.
  // interp "linear" interpolates; "step" takes the row at or below x.
  table: (s, cov) => {
    const x = cov[s.var];
    if (x === undefined) throw new MissingInput(s.var);
    const r = s.rows;
    if (x <= r[0][0]) return r[0][1];
    if (x >= r[r.length - 1][0]) return r[r.length - 1][1];
    const i = r.findIndex((row) => row[0] > x);
    const [x0, y0] = r[i - 1], [x1, y1] = r[i];
    return s.interp === "step" ? y0 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  },
};

// ── Distributions ───────────────────────────────────────────────────────────
// z(y) and y(z) given median m and spread s (and L for boxcox).
// sdFromLimit backs out s from a published limit at a given z.
const DIST = {
  normal: {
    z: (y, m, s) => (y - m) / s,
    y: (z, m, s) => m + z * s,
    sdFromLimit: (lim, m, z) => (lim - m) / z,
  },
  lognormal: {
    z: (y, m, s) => Math.log(y / m) / s,
    y: (z, m, s) => m * Math.exp(z * s),
    sdFromLimit: (lim, m, z) => Math.log(lim / m) / z,
  },
  boxcox: {
    z: (y, m, s, L) => (L === 0 ? Math.log(y / m) / s : ((y / m) ** L - 1) / (L * s)),
    y: (z, m, s, L) => (L === 0 ? m * Math.exp(z * s) : m * (1 + L * s * z) ** (1 / L)),
    sdFromLimit: () => { throw new Error("fromLimits not supported for boxcox"); },
  },
};

export const MEAN_TYPES = Object.keys(EXPR);
export const SD_TYPES = [...Object.keys(EXPR), "cv", "fromLimits"];
export const DISTS = Object.keys(DIST);

function evalSd(spec, median, cov, dist, variantId) {
  if (!spec) return null;
  if (variantId && spec.variants) {
    const v = spec.variants.find((x) => x.id === variantId);
    if (v) return v.value;
  }
  if (spec.type === "cv") return spec.value * median;
  if (spec.type === "fromLimits") return dist.sdFromLimit(EXPR[spec.uln.type](spec.uln, cov), median, spec.z);
  return EXPR[spec.type](spec, cov);
}

// ── Model selection ─────────────────────────────────────────────────────────
const inRange = (x, [lo, hi]) => (lo == null || x >= lo) && (hi == null || x < hi); // half-open

/** Does the model's `when` guard match these covariates? */
export function applies(model, cov) {
  if (!model.when) return true;
  return Object.entries(model.when).every(([k, cond]) =>
    Array.isArray(cond) ? inRange(cov[k], cond) : cov[k] === cond,
  );
}

/** Models of a reference that apply to this patient (suppressed ones excluded). */
export function modelsFor(ref, input) {
  const cov = covariates(input);
  return ref.models.filter((m) => m.status !== "suppressed" && applies(m, cov));
}

// ── Scoring ─────────────────────────────────────────────────────────────────
/**
 * Score one observed measurement against one model.
 * @param {any} ref    registry entry
 * @param {any} model  one of ref.models
 * @param {{ age:number, sex:"male"|"female", height_cm:number, weight_kg?:number }} input
 * @param {number|null} y_mm  observed diameter in mm (null = expected values only)
 * @param {{ ulnZ?: number, sdVariant?: string }} [opts]
 */
export function score(ref, model, input, y_mm, opts = {}) {
  const ulnZ = opts.ulnZ ?? 1.96;
  const units = model.measurement.units;
  const cov = covariates(input);
  const dist = DIST[model.dist ?? "normal"];
  const flags = [];
  if (model.status === "caution") flags.push("caution");
  if (ref.verification?.status === "draft") flags.push("draft");

  let median, sd, L;
  try {
    median = EXPR[model.mean.type](model.mean, cov);
    sd = evalSd(model.sd, median, cov, dist, opts.sdVariant);
    L = model.L ? EXPR[model.L.type](model.L, cov) : undefined;
  } catch (e) {
    if (e instanceof MissingInput) return { ref: ref.id, model: model.id, missing: e.variable, flags };
    throw e;
  }

  const extrapolated = Object.entries(model.validity ?? {})
    .filter(([k, [lo, hi]]) => cov[k] !== undefined && ((lo != null && cov[k] < lo) || (hi != null && cov[k] > hi)))
    .map(([k]) => k);
  if (extrapolated.length) flags.push("extrapolated");

  const y = y_mm == null ? null : convert(y_mm, "mm", units);
  const toMm = (x) => convert(x, units, "mm");
  const hasSd = sd != null;

  return {
    ref: ref.id,
    model: model.id,
    site: model.measurement.site,
    pred: toMm(median),                                         // mm
    pctPred: y == null ? null : (100 * y) / median,
    z: y == null || !hasSd ? null : dist.z(y, median, sd, L),
    uln: hasSd ? toMm(dist.y(ulnZ, median, sd, L)) : null,      // mm
    lln: hasSd ? toMm(dist.y(-ulnZ, median, sd, L)) : null,     // mm
    ulnPct: hasSd ? (100 * dist.y(ulnZ, median, sd, L)) / median : null,
    llnPct: hasSd ? (100 * dist.y(-ulnZ, median, sd, L)) / median : null,
    published: { pred: median, sd, units },                     // for tests and "why?" notes
    sdVariant: opts.sdVariant && model.sd?.variants?.some((v) => v.id === opts.sdVariant) ? opts.sdVariant : null,
    extrapolated,
    flags,
  };
}

/**
 * Local exponent of predicted diameter vs one body-size input:
 * d ln(pred) / d ln(x), by central difference. Works for every model type.
 * Changing height also changes BSA and BMI, so this is the total effect.
 */
export function impliedExponent(ref, model, input, wrt = "height_cm", h = 0.01) {
  const at = (f) => score(ref, model, { ...input, [wrt]: input[wrt] * f }, null).pred;
  return (Math.log(at(1 + h)) - Math.log(at(1 - h))) / (Math.log(1 + h) - Math.log(1 - h));
}

export { VARIABLES };
