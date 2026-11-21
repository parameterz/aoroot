// Data for the "patient on the curve" card: predicted diameter and upper limit of
// normal for each reference, sweeping height (or age) with everything else held at the
// patient's values (weight fixed, so BSA moves with height). No DOM here.

import { score } from "../lib/evaluator.js";
import { modelsForSite, applyChoices } from "../lib/conventions.js";
import { convFromCode, picksFor, sdVariantFor } from "../lib/state.js";
import { scalingOf, componentsOf, isUnadjusted } from "../lib/describe.js";

const unadjusted = (m) => isUnadjusted(componentsOf(m));
/** One size-adjusted model per reference for the curve: the height-based one if there is one, else the first. */
function curveModel(models) {
  const adj = models.filter((m) => !unadjusted(m));
  return adj.find((x) => /height/.test(scalingOf(x))) ?? adj[0];
}

export const SWEEP = {
  height_cm: { label: "Height (cm)", min: 140, max: 205, step: 1 },
  age: { label: "Age (years)", min: 18, max: 85, step: 0.5 },
};

/**
 * One series per reference (its size-adjusted model), plus one per reference that also
 * has an unadjusted model (no body size: flat against height), flagged `unadj`.
 * `key` is unique per series (ref id, or ref id + "~unadj").
 * @returns {{ ref, model, key, unadj, label, sub, pts: { x, pred, uln, extrap }[] }[]}  (mm)
 */
export function curveSeries(registry, state, site, xVar = "height_cm") {
  const p = state.patient;
  const conv = convFromCode(state.conv[site]);
  const { min, max, step } = SWEEP[xVar];
  const out = [];
  const stem = (id) => id.replace(/-(18to40|41to65|over65)$/, ""); // WASE: same model across age groups
  for (const ref of registry) {
    const picks = picksFor(state, ref.id);
    const atPatient = applyChoices(modelsForSite(ref, p, site, conv), picks);
    if (!atPatient.length) continue;
    const kinds = [atPatient.find(unadjusted), curveModel(atPatient)].filter(Boolean); // unadjusted first, as in the rows
    for (const kind of kinds) {
      const pts = [];
      for (let x = min; x <= max + 1e-9; x += step) {
        const input = { ...p, [xVar]: x };
        const ms = applyChoices(modelsForSite(ref, input, site, conv), picks);
        const model = ms.find((m) => stem(m.id) === stem(kind.id));
        if (!model) { pts.push(null); continue; }
        const r = score(ref, model, input, null, { sdVariant: sdVariantFor(state, ref.id, model.id) });
        if (r.missing) { pts.push(null); continue; }
        pts.push({ x, pred: r.pred, uln: r.uln, extrap: r.extrapolated.length > 0 });
      }
      const un = unadjusted(kind);
      out.push({ ref, model: kind, key: ref.id + (un ? "~unadj" : ""), unadj: un,
        label: ref.label.split(" (")[0] + (un ? ", no body size" : ""), sub: scalingOf(kind), pts });
    }
  }
  return out;
}
