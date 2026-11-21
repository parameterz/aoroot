// @ts-check
// Page state and the URL hash. One state object; the hash is its shareable form.
// Everything in the hash is metric: measurements in mm, height in cm, weight in kg.
// Display units (mm/cm, metric/US) are view options and only change what is shown.
//
// Hash keys (defaults are omitted so links stay short):
//   sex=m|f  age  ht (cm)  wt (kg)  ann  sov  stj  aao (mm)
//   ann_c sov_c stj_c aao_c = ll-ed | ll-ms | ii-ed | ii-ms   (measurement convention)
//   u=cm (report/display units)   b=us (enter height/weight in in/lb)
//   pick.<refId>.<choiceGroup>=<modelId>      (alternative chosen, e.g. Yao population)
//   sd.<refId>.<modelId>=<variantId>          (SD variant, e.g. Devereux consistency-corrected)
//   f=age,bsa,ratio                           (percent-of-predicted filter: components, then ratio | eq)
//   sel=<site>.<refId>                        (reference open in the details sheet, e.g. sov.muraru2014)

import { SITES } from "./conventions.js";

export const SITE_KEYS = { annulus: "ann", sov: "sov", stj: "stj", aao: "aao" };

/** Convention codes ↔ convention objects. */
const EDGE = { ll: "leading", ii: "inner" };
const PHASE = { ed: "end-diastole", ms: "mid-systole" };
export const CONV_CODES = ["ll-ed", "ll-ms", "ii-ed", "ii-ms"];
export const DEFAULT_CONV = { annulus: "ii-ms", sov: "ll-ed", stj: "ll-ed", aao: "ll-ed" }; // ASE/EACVI 2015

/** "ii-ms" → { edge: "inner", phase: "mid-systole", view: "parasternal long axis" } */
export function convFromCode(code) {
  const [e, p] = code.split("-");
  return { edge: EDGE[e], phase: PHASE[p], view: "parasternal long axis" };
}

export function defaultState() {
  return {
    patient: { sex: null, age: null, height_cm: null, weight_kg: null },
    y: { annulus: null, sov: null, stj: null, aao: null }, // mm
    conv: { ...DEFAULT_CONV },
    view: { units: "mm", body: "metric", picks: {}, sd: {}, filter: [], sel: null },
  };
}

// ── Units ────────────────────────────────────────────────────────────────────
export const IN_TO_CM = 2.54;
export const LB_TO_KG = 0.45359237;
export const toMm = (x, units) => (units === "cm" ? x * 10 : x);
export const fromMm = (mm, units) => (units === "cm" ? mm / 10 : mm);

/** Plausible adult ranges (mm) for soft warnings. Values outside still go through. */
export const PLAUSIBLE_MM = { annulus: [12, 40], sov: [15, 70], stj: [12, 60], aao: [15, 70] };

/**
 * Check one entered measurement.
 * @returns {{ level: "ok" | "cm?" | "unusual", suggestion?: number, message?: string }}
 */
export function checkMeasurement(site, value, units = "mm") {
  if (value == null || Number.isNaN(value)) return { level: "ok" };
  if (units === "mm" && value > 0 && value < 10)
    return { level: "cm?", suggestion: Math.round(value * 100) / 10, message: `${value} mm? This looks like cm. Did you mean ${Math.round(value * 100) / 10} mm?` };
  const mm = toMm(value, units);
  const [lo, hi] = PLAUSIBLE_MM[site];
  if (mm < lo || mm > hi) return { level: "unusual", message: `${mm} mm is unusual for this site in an adult. Please check.` };
  return { level: "ok" };
}

// ── Hash ─────────────────────────────────────────────────────────────────────
/**
 * Percent-of-predicted filter tokens: components (all must be used) and one optional kind.
 * "none" (no body-size term: the unadjusted, sex-only models) can't combine with a body-size component.
 */
export const FILTER_COMPONENTS = ["age", "ht", "wt", "bsa"];
export const FILTER_KINDS = ["ratio", "eq", "none"];
export const FILTER_SIZE = ["ht", "wt", "bsa"];

/** Add one filter token, dropping the ones it can't combine with (or remove it if it's on). */
export function toggleFilter(filter, k) {
  if (filter.includes(k)) return filter.filter((x) => x !== k);
  const clash = (x) => (FILTER_KINDS.includes(k) && FILTER_KINDS.includes(x)) ||
    (k === "none" && FILTER_SIZE.includes(x)) || (FILTER_SIZE.includes(k) && x === "none");
  return [...filter.filter((x) => !clash(x)), k];
}

const LIMITS = { age: [0, 120], ht: [50, 250], wt: [2, 400], mm: [3, 120] };
const fmt = (x) => String(Math.round(x * 100) / 100);

/** State → "#sex=m&age=40&…" (defaults and empty fields omitted). */
export function encodeHash(state) {
  const q = [];
  const { patient: p, y, conv, view } = state;
  if (p.sex) q.push(`sex=${p.sex === "male" ? "m" : "f"}`);
  if (p.age != null) q.push(`age=${fmt(p.age)}`);
  if (p.height_cm != null) q.push(`ht=${fmt(p.height_cm)}`);
  if (p.weight_kg != null) q.push(`wt=${fmt(p.weight_kg)}`);
  for (const site of SITES) {
    if (y[site] != null) q.push(`${SITE_KEYS[site]}=${fmt(y[site])}`);
    if (conv[site] !== DEFAULT_CONV[site]) q.push(`${SITE_KEYS[site]}_c=${conv[site]}`);
  }
  if (view.units === "cm") q.push("u=cm");
  if (view.body === "us") q.push("b=us");
  for (const [k, v] of Object.entries(view.picks)) q.push(`pick.${k}=${encodeURIComponent(v)}`);
  for (const [k, v] of Object.entries(view.sd)) q.push(`sd.${k}=${encodeURIComponent(v)}`);
  if (view.filter?.length) q.push(`f=${view.filter.join(",")}`);
  if (view.sel) q.push(`sel=${view.sel}`);
  return "#" + q.join("&");
}

/**
 * "#…" → { state, errors }. Never throws: bad or out-of-range values are dropped
 * and reported, so a mangled link still opens with whatever was valid.
 */
export function decodeHash(hash) {
  const state = defaultState();
  const errors = [];
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const num = (key, [lo, hi]) => {
    const raw = params.get(key);
    if (raw == null || raw === "") return null;
    const x = Number(raw);
    if (!Number.isFinite(x) || x <= lo || x > hi) { errors.push(`${key}=${raw} is out of range`); return null; }
    return x;
  };

  const sex = params.get("sex");
  if (sex === "m" || sex === "f") state.patient.sex = sex === "m" ? "male" : "female";
  else if (sex != null) errors.push(`sex=${sex} should be m or f`);
  state.patient.age = num("age", LIMITS.age);
  state.patient.height_cm = num("ht", LIMITS.ht);
  state.patient.weight_kg = num("wt", LIMITS.wt);

  for (const site of SITES) {
    const k = SITE_KEYS[site];
    state.y[site] = num(k, LIMITS.mm);
    const c = params.get(`${k}_c`);
    if (c != null) {
      if (CONV_CODES.includes(c)) state.conv[site] = c;
      else errors.push(`${k}_c=${c} should be one of ${CONV_CODES.join(", ")}`);
    }
  }
  if (params.get("u") === "cm") state.view.units = "cm";
  if (params.get("b") === "us") state.view.body = "us";
  const f = params.get("f");
  if (f) {
    const ok = [...FILTER_COMPONENTS, ...FILTER_KINDS];
    for (const t of f.split(",")) {
      if (!ok.includes(t)) errors.push(`f: unknown filter "${t}"`);
      else if (!state.view.filter.includes(t)) {
        const next = toggleFilter(state.view.filter, t);
        if (next.length === state.view.filter.length + 1) state.view.filter = next; // first token wins a clash
      }
    }
  }
  const sel = params.get("sel");
  if (sel) {
    if (new RegExp(`^(${SITES.join("|")})\\.[a-z0-9_-]+$`).test(sel)) state.view.sel = sel;
    else errors.push(`sel=${sel} should be <site>.<reference>`);
  }
  for (const [k, v] of params) {
    if (k.startsWith("pick.")) state.view.picks[k.slice(5)] = v;
    if (k.startsWith("sd.")) state.view.sd[k.slice(3)] = v;
  }
  return { state, errors };
}

/** Enough entered to score anything? (Weight is optional; BSA models then say "needs weight".) */
export function isComplete(state) {
  const p = state.patient;
  return !!p.sex && p.age != null && p.height_cm != null && SITES.some((s) => state.y[s] != null);
}

/** Picks for one reference, in the form applyChoices() expects: { "<group>": "<modelId>" }. */
export function picksFor(state, refId) {
  const out = {};
  for (const [k, v] of Object.entries(state.view.picks)) {
    const [r, ...g] = k.split(".");
    if (r === refId) out[g.join(".")] = v;
  }
  return out;
}

/** SD variant chosen for one model, or undefined. */
export const sdVariantFor = (state, refId, modelId) => state.view.sd[`${refId}.${modelId}`];
