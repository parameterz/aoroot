// @ts-check
// Plain-language descriptions of models and results, shared by the results page and
// the report text. No DOM here, so it is testable in Node.

import { fromMm } from "./state.js";
import { THRESHOLDS, indexValue, diameterAt } from "./thresholds.js";

export const SITE_NAMES = {
  annulus: "Aortic annulus",
  sov: "Sinus of Valsalva",
  stj: "Sinotubular junction",
  aao: "Ascending aorta",
};

const VAR_NAMES = {
  height_m: "height", height_cm: "height", weight_kg: "weight", bmi: "BMI",
  bsa_dubois: "BSA", bsa_mosteller: "BSA (Mosteller)", bsa_haycock: "BSA (Haycock)", bsa_gehan: "BSA (Gehan)",
};

/** Body-size variables a model's mean uses (age and sex excluded). */
function sizeVars(model) {
  const m = model.mean;
  const vars = [...(m.terms ?? []), ...(m.factors ?? [])].map((t) => t.var);
  if (m.var) vars.push(m.var);
  return [...new Set(vars.filter((v) => v !== "age" && v !== "sex"))];
}

/**
 * How a model scales for body size, in a few words:
 * "ratio to height", "BSA", "height and weight (allometric)", "none (absolute)".
 */
export function scalingOf(model) {
  const m = model.mean;
  const vars = sizeVars(model);
  if (!vars.length) return "none (absolute)";
  const names = [...new Set(vars.map((v) => VAR_NAMES[v] ?? v))];
  const isRatio = m.type === "linear" && !m.intercept && m.terms.length === 1 && !m.outcome;
  if (isRatio) return `ratio to ${names[0]}`;
  const list = names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names.at(-1) : names[0];
  if (m.type === "power") return `${list} (allometric)`;
  if (m.outcome) return `${list} (log scale)`;
  return list;
}

/** What the prediction adjusts for, e.g. "age, sex and height". */
export function adjustsFor(model) {
  const m = model.mean;
  const all = [...(m.terms ?? []), ...(m.factors ?? [])].map((t) => t.var);
  if (m.var) all.push(m.var);
  const sexKeyed = JSON.stringify(m).includes('"male"') || !!model.when?.sex;
  const ageGroup = !!model.when?.age;
  const parts = [];
  if (all.includes("age")) parts.push("age");
  else if (ageGroup) parts.push("age group");
  if (all.includes("sex") || sexKeyed) parts.push("sex");
  for (const v of sizeVars(model)) {
    const name = (VAR_NAMES[v] ?? v).replace(/ \(.*\)$/, "");
    if (!parts.includes(name)) parts.push(name);
  }
  if (!parts.length) return "nothing (single normal range)";
  return parts.length > 1 ? parts.slice(0, -1).join(", ") + " and " + parts.at(-1) : parts[0];
}

/** Model label without the repeated reference name: "SV L–L end-diastole, height-indexed". */
export function shortLabel(ref, model) {
  const stem = ref.label.split(" (")[0];
  const s = model.label.startsWith(stem) ? model.label.slice(stem.length).replace(/^[\s,]+/, "") : model.label;
  return s || model.label;
}

// ── Number formats ───────────────────────────────────────────────────────────
export const fmtZ = (z) => (z == null ? "—" : (z >= 0 ? "+" : "−") + Math.abs(z).toFixed(2));
export const fmtPct = (p) => (p == null ? "—" : `${Math.round(p)}%`);
export function fmtLen(mm, units = "mm") {
  if (mm == null) return "—";
  return units === "cm" ? `${fromMm(mm, "cm").toFixed(2)} cm` : `${mm.toFixed(1)} mm`;
}
export function fmtObserved(mm, units = "mm") {
  return units === "cm" ? `${Math.round(fromMm(mm, "cm") * 100) / 100} cm` : `${Math.round(mm * 10) / 10} mm`;
}

/**
 * One plain-text report line, reference named every time.
 * e.g. "Sinus of Valsalva 36 mm (z = +2.56; 128% of predicted for sex and height;
 *       NORRE (Saura 2017), SV L–L end-diastole, height-indexed)."
 */
export function reportLine(site, y_mm, result, ref, model, units = "mm") {
  const parts = [];
  if (result.z != null) parts.push(`z = ${fmtZ(result.z).replace("−", "-")}`);
  parts.push(`${Math.round(result.pctPred)}% of predicted for ${adjustsFor(model)}`);
  parts.push(`${ref.label}, ${shortLabel(ref, model)}`);
  return `${SITE_NAMES[site]} ${fmtObserved(y_mm, units)} (${parts.join("; ")}).`;
}

/**
 * Terse plain-text report line for height-indexed size, e.g.
 *   "Ascending aorta 44 mm: AHI 2.78 cm/m, CSAH 9.6 cm2/m; above Desai 2026 risk thresholds (AHI 2.5, CSAH 9)."
 *   "Sinus of Valsalva 38 mm: AHI 2.41 cm/m, CSAH 7.2 cm2/m; below Desai 2026 risk thresholds (AHI 2.5, CSAH 9)."
 *   "…; above Desai 2026 AHI threshold (2.5), below CSAH (9)."
 * Guideline indexed thresholds are added only when met: "; meets 2022 ACC/AHA CSAH >= 10 (IIa)."
 */
export function indexedReportLine(site, y_mm, patient, units = "mm") {
  const h = patient.height_cm;
  const ahi = indexValue("AHI", y_mm, h), csah = indexValue("CSAH", y_mm, h);
  const T = (id) => THRESHOLDS.find((t) => t.id === id);
  const hit = (id) => y_mm >= diameterAt(T(id), h) - 1e-9;
  const a = hit("desai-ahi"), c = hit("desai-csah");
  let verdict;
  if (a && c) verdict = "above Desai 2026 risk thresholds (AHI 2.5, CSAH 9)";
  else if (!a && !c) verdict = "below Desai 2026 risk thresholds (AHI 2.5, CSAH 9)";
  else verdict = a ? "above Desai 2026 AHI threshold (2.5), below CSAH (9)" : "above Desai 2026 CSAH threshold (9), below AHI (2.5)";
  const gl = [hit("gl-csah") && "CSAH >= 10 (IIa)", hit("gl-ahi") && "AHI >= 3.21 (IIb)"].filter(Boolean);
  const glText = gl.length ? `; meets 2022 ACC/AHA ${gl.join(" and ")}` : "";
  return `${SITE_NAMES[site]} ${fmtObserved(y_mm, units)}: AHI ${ahi.toFixed(2)} cm/m, CSAH ${csah.toFixed(1)} cm2/m; ${verdict}${glText}.`;
}

// ── Equations as text (verification page) ───────────────────────────────────
const VAR_TEXT = {
  age: "age (y)", height_cm: "height (cm)", height_m: "height (m)", weight_kg: "weight (kg)", bmi: "BMI",
  bsa_dubois: "BSA DuBois (m²)", bsa_mosteller: "BSA Mosteller (m²)", bsa_haycock: "BSA Haycock (m²)", bsa_gehan: "BSA Gehan (m²)",
};
const num = (x) => (typeof x === "number" ? String(x) : "?");
/** Resolve a possibly sex-keyed number for one sex. */
const at = (x, sex) => (x && typeof x === "object" && !Array.isArray(x) ? x[sex] : x);
/** Does this model have any sex-keyed numbers (so it needs one equation per sex)? */
export function isSexKeyed(model) {
  const walk = (o) => {
    if (!o || typeof o !== "object") return false;
    if (!Array.isArray(o) && "male" in o && "female" in o && typeof o.male === "number") return true;
    return Object.entries(o).some(([k, v]) => k !== "coding" && walk(v));
  };
  return walk({ mean: model.mean, sd: model.sd, ratio: model.ratio });
}

function termText(t, sex) {
  const v = VAR_TEXT[t.var] ?? t.var;
  if (t.coding) return `${num(at(t.coef, sex))}·sex [${Object.entries(t.coding).map(([k, c]) => `${k === "male" ? "man" : "woman"} = ${c}`).join(", ")}]`;
  const per = t.transform && typeof t.transform === "object" && "per" in t.transform;
  const tv = !t.transform ? v
    : per ? (t.var === "age" && t.transform.per === 10 ? "age (decades)" : `${v}/${t.transform.per}`)
    : typeof t.transform === "object" ? `${v}^${t.transform.pow}` : `${t.transform}(${v})`;
  return `${num(at(t.coef, sex))}·${tv}`;
}

/**
 * The mean equation as plain text, for one sex (or for both when not sex-keyed).
 * e.g. "D (cm) = 2.423 + 0.009·age (y) + 0.461·BSA DuBois (m²) − 0.267·sex [man = 1, woman = 2]"
 */
export function meanText(model, sex = "male") {
  const m = model.mean, u = model.measurement.units;
  const lhs = m.outcome ? `${m.outcome}(D, ${u})` : `D (${u})`;
  if (m.type === "constant") return `${lhs} = ${num(at(m.value, sex))}`;
  if (m.type === "linear") {
    const parts = [];
    if (m.intercept != null) parts.push(num(at(m.intercept, sex)));
    for (const t of m.terms) parts.push(termText(t, sex));
    return `${lhs} = ${parts.join(" + ")}`.replace(/\+ -/g, "− ");
  }
  if (m.type === "power") {
    const f = m.factors.map((x) => x.coding
      ? `${num(at(x.base, sex))}^(${Object.entries(x.coding).filter(([, c]) => c === 1).map(([k]) => (k === "male" ? "man" : "woman"))[0] ?? "sex"})`
      : `${VAR_TEXT[x.var] ?? x.var}^${num(at(x.exp, sex))}`);
    return `${lhs} = ${num(at(m.a, sex))} × ${f.join(" × ")}`;
  }
  if (m.type === "table") return `${lhs} = table of ${VAR_TEXT[m.var] ?? m.var} (${m.rows.length} rows, ${m.interp})`;
  return `${lhs} = (${m.type})`;
}

/** Spread and normal-range method as plain text, for one sex. */
export function spreadText(model, sex = "male") {
  const u = model.measurement.units;
  if (model.dist === "ratio") {
    const r = model.ratio;
    const iv = r.interval ? `; normal range = predicted × published limits ${r.interval[0]}–${r.interval[1]}` : "; normal range = predicted × (mean ± 1.96 SD)";
    return `Corrected value Yc = D / predicted: mean ${num(at(r.mean, sex))}, SD ${num(at(r.sd, sex))}${iv}`;
  }
  const sd = model.sd;
  if (!sd) return "No SD published: percent of predicted only (no z-score, no normal range)";
  const scale = model.dist === "lognormal10" ? " (log10 scale)" : model.dist === "lognormal" ? " (ln scale)" : ` ${u}`;
  let s;
  if (sd.type === "constant") s = `SD = ${num(at(sd.value, sex))}${scale}`;
  else if (sd.type === "cv") s = `SD = ${num(at(sd.value, sex))} × predicted`;
  else if (sd.type === "linear") s = `SD (${u}) = ${[sd.intercept != null ? num(at(sd.intercept, sex)) : null, ...sd.terms.map((t) => termText(t, sex))].filter(Boolean).join(" + ")}`;
  else if (sd.type === "fromLimits") {
    // Same rules as the mean equation: a missing intercept means 0 (as in the evaluator), so it is left out.
    const parts = [];
    if (sd.uln.intercept != null) parts.push(num(at(sd.uln.intercept, sex)));
    for (const t of sd.uln.terms) parts.push(termText(t, sex));
    s = `SD = (ULN − predicted) / ${sd.z}, with ULN (${u}) = ${parts.join(" + ")}`.replace(/\+ -/g, "− ");
  }
  else s = `SD: ${sd.type}`;
  const v = (sd.variants ?? []).map((x) => `; option "${x.label}": ${num(at(x.value, sex))}${scale}`).join("");
  const range = model.dist === "lognormal10" ? "; normal range = 10^(log10 predicted ± 1.96 SD)" : model.dist === "lognormal" ? "; normal range = exp(ln predicted ± 1.96 SD)" : "; normal range = predicted ± 1.96 SD";
  return s + v + range;
}
