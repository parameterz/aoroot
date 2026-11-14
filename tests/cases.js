// Shared test logic. Runs every registry entry's schema check and `tests`
// block. Used by tests/run.js (Node) and tests.html (browser).

import registry from "../registry/index.js";
import { score } from "../lib/evaluator.js";
import { covariates, convert } from "../lib/covariates.js";
import { validate } from "../lib/validate.js";

const TOL = { pred: 0.001, z: 0.01, pctPred: 0.1, covariates: 0.001 };

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
        const r = score(ref, model, t.input, y, { sdVariant: t.sdVariant });
        const got = { pred: r.published.pred, z: r.z, pctPred: r.pctPred };
        for (const [k, w] of Object.entries(want))
          if (got[k] == null || Math.abs(got[k] - w) > tol[k])
            fails.push(`${modelId}.${k} ${got[k]?.toFixed(4)} ≠ ${w}`);
      }
      check(label, fails.length === 0, fails.join("; "));
    });
  }
  return results;
}
