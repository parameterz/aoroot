// @ts-check
// Plain-language descriptions of models and results, shared by the results page and
// the report text. No DOM here, so it is testable in Node.

import { fromMm } from "./state.js";
import { THRESHOLDS, indexValue, diameterAt, appliesTo } from "./thresholds.js";

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
 * Plain-text report line for height-indexed size (AHI, CSAH) against the thresholds.
 * e.g. "Ascending aorta 44 mm at 158 cm: AHI 2.78 cm/m, CSAH 9.6 cm2/m (area from diameter,
 *       assumed circular). Desai 2026 risk thresholds reached: AHI >= 2.5 cm/m, CSAH >= 9 cm2/m;
 *       not reached: >= 45 mm (women). 2022 ACC/AHA indexed thresholds not reached:
 *       CSAH >= 10 cm2/m (IIa), AHI >= 3.21 cm/m (IIb)."
 */
export function indexedReportLine(site, y_mm, patient, units = "mm") {
  const h = patient.height_cm;
  const ahi = indexValue("AHI", y_mm, h), csah = indexValue("CSAH", y_mm, h);
  const plain = (t) => t.label.replace("≥", ">=").replace("cm²", "cm2");
  // Desai's risk thresholds (all that apply to this patient) and the guideline indexed ones.
  const picked = THRESHOLDS.filter((t) => appliesTo(t, patient) && (t.kind === "risk" || t.index !== "diameter"));
  const isReached = (t) => y_mm >= diameterAt(t, h) - 1e-9;
  const sentence = (kind, source) => {
    const ts = picked.filter((t) => t.kind === kind);
    if (!ts.length) return "";
    const yes = ts.filter(isReached).map(plain), no = ts.filter((t) => !isReached(t)).map(plain);
    const bits = [yes.length ? `reached: ${yes.join(", ")}` : "", no.length ? `not reached: ${no.join(", ")}` : ""].filter(Boolean);
    return `${source} ${bits.join("; ")}.`;
  };
  const parts = [`${SITE_NAMES[site]} ${fmtObserved(y_mm, units)} at ${Math.round(h)} cm: AHI ${ahi.toFixed(2)} cm/m, CSAH ${csah.toFixed(1)} cm2/m (area from diameter, assumed circular).`,
    sentence("risk", "Desai 2026 risk thresholds"), sentence("surgery", "2022 ACC/AHA indexed thresholds")].filter(Boolean);
  return parts.join(" ");
}
