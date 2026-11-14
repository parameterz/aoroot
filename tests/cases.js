// Shared test logic. Runs every registry entry's schema check and `tests`
// block, plus convention-matching checks. Used by tests/run.js (Node) and tests.html (browser).

import registry from "../registry/index.js";
import { score } from "../lib/evaluator.js";
import { covariates, convert } from "../lib/covariates.js";
import { validate } from "../lib/validate.js";
import { modelsForSite, applyChoices } from "../lib/conventions.js";
import { scalingOf, adjustsFor, reportLine, shortLabel } from "../lib/describe.js";
import { encodeHash, decodeHash, defaultState, checkMeasurement, convFromCode, picksFor } from "../lib/state.js";

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
  // Choices: one model per choice group (default unless picked).
  {
    const yao = registry.find((r) => r.id === "yao2026");
    const cam = registry.find((r) => r.id === "campens2014");
    const ids = (ms) => ms.map((m) => m.id).sort().join(",");
    check("choices: Yao SoV default = combined", ids(applyChoices(modelsForSite(yao, P, "sov"))) === "sov-combined");
    check("choices: Yao SoV pick = chinese", ids(applyChoices(modelsForSite(yao, P, "sov"), { "sov-population": "sov-chinese" })) === "sov-chinese");
    check("choices: Campens AAo default = DuBois", ids(applyChoices(modelsForSite(cam, P, "aao"))) === "aao-dubois");
    check("choices: bad pick falls back to default", ids(applyChoices(modelsForSite(cam, P, "sov"), { "sov-bsa": "nonsense" })) === "sov-dubois");
  }

  // State ↔ hash.
  {
    const st = defaultState();
    Object.assign(st.patient, { sex: "female", age: 65.5, height_cm: 160, weight_kg: 60 });
    Object.assign(st.y, { sov: 36, annulus: 21 });
    st.conv.annulus = "ll-ed";
    st.view.units = "cm";
    st.view.picks["yao2026.sov-population"] = "sov-italian";
    st.view.sd["devereux2012.sov-height"] = "consistency-corrected";
    const h = encodeHash(st);
    check("hash: encodes only what is set", h === "#sex=f&age=65.5&ht=160&wt=60&ann=21&ann_c=ll-ed&sov=36&u=cm&pick.yao2026.sov-population=sov-italian&sd.devereux2012.sov-height=consistency-corrected", h);
    const back = decodeHash(h);
    check("hash: round trip", JSON.stringify(back.state) === JSON.stringify(st) && back.errors.length === 0, JSON.stringify(back));
    check("hash: picksFor", JSON.stringify(picksFor(back.state, "yao2026")) === JSON.stringify({ "sov-population": "sov-italian" }));
    const bad = decodeHash("#sex=x&age=-3&ht=170&sov=abc&stj=500&aao_c=zz");
    check("hash: bad values dropped and reported", bad.errors.length === 5 && bad.state.patient.height_cm === 170 && bad.state.y.sov === null, bad.errors.join("; "));
    check("hash: default conventions omitted", encodeHash(defaultState()) === "#");
    check("conv: ii-ms", JSON.stringify(convFromCode("ii-ms")) === JSON.stringify({ edge: "inner", phase: "mid-systole", view: "parasternal long axis" }));
  }

  // Descriptions and report text.
  {
    const get = (r, m) => { const ref = registry.find((x) => x.id === r); return [ref, ref.models.find((x) => x.id === m)]; };
    const cases = [
      ["saura2017", "sov-ll-ed-ht", "ratio to height", "sex and height"],
      ["devereux2012", "sov-height", "height", "age, sex and height"],
      ["campens2014", "sov-dubois", "BSA (log scale)", "age, sex and BSA"],
      ["patel2022", "sov-abs-over65", "none (absolute)", "age group and sex"],
      ["yao2026", "sov-combined", "height and weight (allometric)", "age, sex, height and weight"],
    ];
    for (const [r, m, sc, adj] of cases) {
      const [, model] = get(r, m);
      check(`describe: ${r}/${m}`, scalingOf(model) === sc && adjustsFor(model) === adj, `${scalingOf(model)} | ${adjustsFor(model)}`);
    }
    const [ref, model] = get("saura2017", "sov-ll-ed-ht");
    const p = { sex: "female", age: 70, height_cm: 155, weight_kg: 55 };
    const line = reportLine("sov", 36, score(ref, model, p, 36), ref, model, "mm");
    check("report line", line === "Sinus of Valsalva 36 mm (z = +2.56; 128% of predicted for sex and height; NORRE (Saura 2017), SV L–L end-diastole, height-indexed).", line);
    const [dref, dmodel] = get("devereux2012", "sov-height");
    check("short label", shortLabel(dref, dmodel) === "height model", shortLabel(dref, dmodel));
  }

  // Input checks.
  check("input: 3.8 mm flagged as cm", checkMeasurement("sov", 3.8, "mm").level === "cm?" && checkMeasurement("sov", 3.8, "mm").suggestion === 38);
  check("input: 3.8 cm is fine", checkMeasurement("sov", 3.8, "cm").level === "ok");
  check("input: 85 mm SoV unusual", checkMeasurement("sov", 85, "mm").level === "unusual");
  check("input: 36 mm SoV ok", checkMeasurement("sov", 36, "mm").level === "ok");
  return results;
}
