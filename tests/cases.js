// Shared test logic. Runs every registry entry's schema check and `tests`
// block, plus convention-matching checks. Used by tests/run.js (Node) and tests.html (browser).

import registry from "../registry/index.js";
import { score } from "../lib/evaluator.js";
import { covariates, convert } from "../lib/covariates.js";
import { validate } from "../lib/validate.js";
import { modelsForSite } from "../lib/conventions.js";

const TOL = { pred: 0.001, z: 0.01, pctPred: 0.1, uln: 0.01, lln: 0.01, covariates: 0.001 };

/** @returns {{ name: string, pass: boolean, detail: string }[]} */
export function runAll() {
  const results = [];
  const check = (name, pass, detail = "") => results.push({ name, pass, detail });

  for (const ref of registry) {
    const problems = validate(ref);
    check(`${ref.id}: schema`, problems.length === 0, problems.join("; "));

    (ref.tests ?? []).forEach((t, i) => {
      const label = `${ref.id}: test ${i + 1} (${t.kind}${t.sdVariant ? `, ${t.sdVariant}` : ""})`;
      const tol = { ...TOL, ...t.tol };
      const fails = [];

      const cov = covariates(t.input);
      for (const [k, want] of Object.entries(t.expect.covariates ?? {}))
        if (Math.abs(cov[k] - want) > tol.covariates) fails.push(`${k} ${cov[k].toFixed(4)} ≠ ${want}`);

      for (const [modelId, want] of Object.entries(t.expect)) {
        if (modelId === "covariates") continue;
        const model = ref.models.find((m) => m.id === modelId);
        const site = model.measurement.site;
        const y = t.y?.[site] == null ? null : convert(t.y[site], model.measurement.units, "mm");
        const r = score(ref, model, t.input, y, { sdVariant: t.sdVariant, ulnZ: t.ulnZ });
        const u = model.measurement.units;
        const got = { pred: r.published.pred, z: r.z, pctPred: r.pctPred, uln: r.uln == null ? null : convert(r.uln, "mm", u),
          lln: r.lln == null ? null : convert(r.lln, "mm", u) };
        for (const [k, w] of Object.entries(want))
          if (got[k] == null || Math.abs(got[k] - w) > tol[k])
            fails.push(`${modelId}.${k} ${got[k]?.toFixed(4)} ≠ ${w}`);
      }
      check(label, fails.length === 0, fails.join("; "));
    });
  }
  // Convention matching: which models each reference offers for a site + convention.
  const P = { sex: "male", age: 40, height_cm: 175, weight_kg: 70 };
  const II_ED = { edge: "inner", phase: "end-diastole", view: "parasternal long axis" };
  const expectations = [
    ["devereux2012", "sov", undefined, ["sov-bsa", "sov-height"]],
    ["devereux2012", "annulus", undefined, ["annulus-bsa", "annulus-height"]],
    ["devereux2012", "sov", II_ED, []],
    ["saura2017", "sov", undefined, ["sov-ll-ed-ht", "sov-ll-ed-bsa"]],
    ["saura2017", "annulus", undefined, ["annulus-ii-ms-ht", "annulus-ii-ms-bsa"]],
    ["saura2017", "aao", II_ED, ["aao-ii-ed-ht", "aao-ii-ed-bsa", "aao-ii-ed-ht-reg", "aao-ii-ed-bsa-reg"]],
    ["yao2026", "annulus", undefined, []],
    ["campens2014", "aao", undefined, ["aao-dubois", "aao-haycock"]],
    ["campens2014", "annulus", undefined, []],
    ["yao2026", "annulus", { edge: "leading", phase: "end-diastole", view: "parasternal long axis" }, ["annulus-combined", "annulus-chinese", "annulus-italian"]],
    ["yao2026", "sov", undefined, ["sov-combined", "sov-chinese", "sov-italian"]],
    ["patel2022", "sov", undefined, ["sov-abs-18to40", "sov-bsa-18to40", "sov-ht-18to40", "sov-fig-bsa-18to40", "sov-fig-ht-18to40"]],
  ];
  for (const [refId, site, conv, want] of expectations) {
    const ref = registry.find((r) => r.id === refId);
    const got = modelsForSite(ref, P, site, conv).map((m) => m.id).sort();
    const label = `conventions: ${refId} ${site} ${conv ? `${conv.edge}/${conv.phase}` : "ASE default"}`;
    check(label, JSON.stringify(got) === JSON.stringify([...want].sort()), `got [${got}]`);
  }
  return results;
}
