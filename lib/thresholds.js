// @ts-check
// Risk and surgical thresholds. These are NOT normal ranges: they come from outcome
// studies of patients with an already dilated aorta. Kept apart from the registry.
//
// Definitions (Desai 2026, Methods), echo leading edge, end-diastole, maximum of root or
// ascending aorta:
//   AHI  = diameter (cm) / height (m)                       [cm/m]
//   CSAH = π·r² (cm²) / height (m),  r = diameter / 2       [cm²/m]   (assumes a circular lumen)

/**
 * kind: "risk" (outcome association) | "surgery" (guideline indication)
 * index: "AHI" | "CSAH" | "diameter" (value in mm)
 * when: optional { sex } or { height_cm: [lo, hi) } restriction
 */
export const THRESHOLDS = [
  { id: "desai-ahi", short: "AHI 2.5", kind: "risk", index: "AHI", value: 2.5, label: "AHI ≥ 2.5 cm/m",
    source: "Desai 2026", detail: "Hazard of death rises (derivation spline; confirmed in validation, P = 0.009). All-cause mortality, AUC 0.56." },
  { id: "desai-csah", short: "CSAH 9", kind: "risk", index: "CSAH", value: 9, label: "CSAH ≥ 9 cm²/m",
    source: "Desai 2026", detail: "Hazard of death rises (derivation spline; confirmed in validation, P = 0.02). All-cause mortality, AUC 0.54." },
  { id: "desai-women", short: "45 mm (F)", kind: "risk", index: "diameter", value: 45, label: "≥ 45 mm (women)", when: { sex: "female" },
    source: "Desai 2026", detail: "Hazard of death rises in women (not in men or overall); not confirmed in the validation sample overall." },
  { id: "gl-csah", short: "CSAH 10", kind: "surgery", index: "CSAH", value: 10, label: "CSAH ≥ 10 cm²/m (IIa)",
    source: "2022 ACC/AHA, as cited by Desai 2026", detail: "Elective ascending aortic replacement, class IIa." },
  { id: "gl-ahi", short: "AHI 3.21", kind: "surgery", index: "AHI", value: 3.21, label: "AHI ≥ 3.21 cm/m (IIb)",
    source: "2022 ACC/AHA, as cited by Desai 2026", detail: "Elective ascending aortic replacement, class IIb (Zafar 2018 'severe' AHI category)." },
  { id: "gl-50", short: "50 mm", kind: "surgery", index: "diameter", value: 50, label: "≥ 50 mm (IIa)",
    source: "2022 ACC/AHA, as cited by Desai 2026", detail: "Elective replacement in selected patients, class IIa." },
  { id: "eacts-50", short: "50 mm < 1.69 m", kind: "surgery", index: "diameter", value: 50, label: "≥ 50 mm if < 1.69 m", when: { height_cm: [null, 169] },
    source: "EACTS/STS 2024, as cited by Desai 2026", detail: "Surgical threshold of 5.0 cm in patients shorter than 1.69 m." },
  { id: "gl-55", short: "55 mm", kind: "surgery", index: "diameter", value: 55, label: "≥ 55 mm (I)",
    source: "2022 ACC/AHA, as cited by Desai 2026", detail: "Elective replacement, class I (sporadic aneurysm without other indications)." },
];

/** The patient's index value from a diameter (mm) and height (cm). */
export function indexValue(index, d_mm, h_cm) {
  const d = d_mm / 10, h = h_cm / 100;
  if (index === "AHI") return d / h;
  if (index === "CSAH") return (Math.PI * (d / 2) ** 2) / h;
  return d_mm;
}

/** The diameter (mm) at which a threshold is reached for someone of this height. */
export function diameterAt(t, h_cm) {
  const h = h_cm / 100;
  if (t.index === "AHI") return t.value * h * 10;
  if (t.index === "CSAH") return 2 * Math.sqrt((t.value * h) / Math.PI) * 10;
  return t.value;
}

/** Does a threshold apply to this patient (sex / height restrictions)? */
export function appliesTo(t, patient) {
  if (!t.when) return true;
  if (t.when.sex && t.when.sex !== patient.sex) return false;
  if (t.when.height_cm) {
    const [lo, hi] = t.when.height_cm;
    if ((lo != null && patient.height_cm < lo) || (hi != null && patient.height_cm >= hi)) return false;
  }
  return true;
}

/** Height (cm) at which an AHI threshold and a CSAH threshold give the same diameter. */
export function crossoverHeight(ahi, csah) {
  return (4 * csah) / (Math.PI * ahi ** 2) * 100;
}

// ── CMR normal upper bound (context, not an echo reference) ──────────────────
// Tavolinejad 2025: the same index as CSAH (area / height, cm²/m), with the area taken
// as π·r² from the centerline-to-wall distance of a 3-D CMR segmentation. The upper
// bound (97.5th percentile of the UK Biobank healthy subgroup) is linear in age, by sex.
// Only an upper bound is published (no mean or SD), so it is shown on the thresholds
// card as a line, never scored as a z-score.
export const CMR_NORMAL = {
  id: "tavolinejad-csah",
  kind: "normal",
  index: "CSAH",
  sites: ["aao"],
  short: "CMR normal",
  label: "CMR upper normal for age and sex",
  upper: {
    female: { perYear: 0.0327, intercept: 3.68 },
    male: { perYear: 0.04, intercept: 3.74 },
  },
  validity: { age: [40, 70] },
  source: "Tavolinejad 2025, Results (Normative values): upper bound = age × 0.0327 + 3.68 (women), age × 0.04 + 3.74 (men); Supplemental Figure 11",
  citation: "Tavolinejad H, Beeche C, Dib MJ, et al. Ascending aortic dimensions and body size: allometric scaling, normative values, and prognostic performance. JACC Cardiovasc Imaging 2025;18(12):1315–1327.",
  doi: "10.1016/j.jcmg.2025.06.019",
  measurement: "CMR (UK Biobank axial SSFP), 3-D segmentation by neural network; lumen; maximum cross-section anywhere from the root to the arch apex; area = π·r² with r the centerline-to-wall distance; cardiac phase not stated in the main text",
  population: "UK Biobank reference subgroup, n = 11,310 (37% men; age 52 ± 8 y; 97% White): no cardiovascular disease, hypertension, diabetes or kidney disease, never smokers, BMI < 30, normal lipids. UK Biobank recruited ages 40–69.",
};

/** CMR upper normal CSAH (cm²/m) for this patient's age and sex. */
export function cmrUpper(patient) {
  const u = CMR_NORMAL.upper[patient.sex];
  return u.perYear * patient.age + u.intercept;
}

/** The CMR upper normal as a threshold-shaped object (works with diameterAt). */
export function cmrThreshold(patient) {
  const [lo, hi] = CMR_NORMAL.validity.age;
  return { ...CMR_NORMAL, value: cmrUpper(patient), extrapolated: patient.age < lo || patient.age > hi };
}
