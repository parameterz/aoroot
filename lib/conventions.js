// @ts-check
// Measurement conventions: which model of a reference matches how the user measured.
// The input form sets one convention per site, defaulting to ASE/EACVI 2015:
// annulus inner edge (hinge points) in mid-systole; everything else leading
// edge in end-diastole, parasternal long axis.

import { covariates } from "./covariates.js";
import { applies } from "./evaluator.js";

export const SITES = ["annulus", "sov", "stj", "aao"];
export const EDGES = ["leading", "inner"];
export const PHASES = ["end-diastole", "mid-systole"];
export const VIEWS = ["parasternal long axis", "parasternal short axis"];

const LL_ED = { edge: "leading", phase: "end-diastole", view: "parasternal long axis" };

/** ASE/EACVI 2015 defaults, one convention per site. */
export const ASE_DEFAULT = Object.freeze({
  annulus: { edge: "inner", phase: "mid-systole", view: "parasternal long axis" },
  sov: LL_ED,
  stj: LL_ED,
  aao: LL_ED,
});

/** Does a model's measurement match the site and convention? */
export function matchesConvention(model, site, conv) {
  const m = model.measurement;
  return m.site === site && m.edge === conv.edge && m.phase === conv.phase && m.view === conv.view && !m.sinus;
}

/**
 * Models of one reference to score for one site: matching convention, applicable
 * to this patient (`when` guards), not suppressed. Empty list = the reference has
 * nothing for this site and convention; the UI greys it out and says why.
 * @param {any} ref
 * @param {{ age:number, sex:"male"|"female", height_cm:number, weight_kg?:number }} input
 * @param {string} site
 * @param {{ edge:string, phase:string, view:string }} [conv]
 */
export function modelsForSite(ref, input, site, conv = ASE_DEFAULT[site]) {
  const cov = covariates(input);
  return ref.models.filter(
    (m) => m.status !== "suppressed" && matchesConvention(m, site, conv) && applies(m, cov),
  );
}
