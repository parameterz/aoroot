// Shared test logic. Runs every registry entry's schema check and `tests`
// block, plus convention-matching checks. Used by tests/run.js (Node) and tests.html (browser).

import registry from "../registry/index.js";
import { score } from "../lib/evaluator.js";
import { covariates, convert } from "../lib/covariates.js";
import { validate } from "../lib/validate.js";
import { modelsForSite, applyChoices } from "../lib/conventions.js";
import { THRESHOLDS, indexValue, diameterAt, appliesTo, crossoverHeight, cmrThreshold } from "../lib/thresholds.js";
import { scalingOf, adjustsFor, reportLine, shortLabel, indexedReportLine } from "../lib/describe.js";
import { encodeHash, decodeHash, defaultState, checkMeasurement, convFromCode, picksFor } from "../lib/state.js";

const TOL = { pred: 0.001, z: 0.01, pctPred: 0.1, uln: 0.01, lln: 0.01, covariates: 0.001 };

/**
 * Run one reference's `tests` block. Each result lists every compared value
 * (expected, got, tolerance) so the verification page can show the working.
 */
export function runRefTests(ref) {
  return (ref.tests ?? []).map((t, i) => {
    const name = `${ref.id}: test ${i + 1} (${t.kind}${t.sdVariant ? `, ${t.sdVariant}` : ""})`;
    const tol = { ...TOL, ...t.tol };
    const rows = [];
    const cov = covariates(t.input);
    for (const [k, want] of Object.entries(t.expect.covariates ?? {}))
      rows.push({ what: k, want, got: cov[k], tol: tol.covariates, ok: Math.abs(cov[k] - want) <= tol.covariates });
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
        rows.push({ what: `${modelId}.${k}`, want: w, got: got[k], tol: tol[k], ok: got[k] != null && Math.abs(got[k] - w) <= tol[k] });
    }
    const fails = rows.filter((r) => !r.ok).map((r) => `${r.what} ${r.got?.toFixed(4)} ≠ ${r.want}`);
    return { name, kind: t.kind, source: t.source, input: t.input, y: t.y, sdVariant: t.sdVariant, rows, pass: fails.length === 0, detail: fails.join("; ") };
  });
}

/** @returns {{ name: string, pass: boolean, detail: string }[]} */
export function runAll() {
  const results = [];
  const check = (name, pass, detail = "") => results.push({ name, pass, detail });

  for (const ref of registry) {
    const problems = validate(ref);
    check(`${ref.id}: schema`, problems.length === 0, problems.join("; "));

    for (const r of runRefTests(ref)) check(r.name, r.pass, r.detail);
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
    ["saura2017", "aao", II_ED, ["aao-ii-ed-ht", "aao-ii-ed-bsa"]],  // Table 5 regressions suppressed (rule 7)
    ["yao2026", "annulus", undefined, []],
    ["campens2014", "aao", undefined, ["aao-dubois", "aao-haycock"]],
    ["campens2014", "annulus", undefined, []],
    ["yao2026", "annulus", { edge: "leading", phase: "end-diastole", view: "parasternal long axis" }, ["annulus-combined", "annulus-chinese", "annulus-italian"]],
    ["yao2026", "sov", undefined, ["sov-combined", "sov-chinese", "sov-italian"]],
    ["muraru2014", "sov", undefined, ["sov-ll-ed-ht", "sov-ll-ed-bsa"]],
    ["muraru2014", "stj", II_ED, ["stj-ii-ed-ht"]],  // stj-ii-ed-bsa suppressed
    ["muraru2014", "annulus", undefined, []],
    ["lang2015", "sov", undefined, ["sov-bsa"]],
    ["lang2015", "annulus", undefined, ["annulus-bsa"]],
    ["lang2015", "sov", II_ED, []],
    ["mirea2013", "sov", undefined, []],
    ["mirea2013", "aao", II_ED, ["aao-bsa-40to49"]],
    ["mirea2013", "annulus", II_ED, ["annulus-bsa-40to49"]],
    ["patel2022", "sov", undefined, ["sov-bsa-18to40", "sov-ht-18to40", "sov-fig-bsa-18to40", "sov-fig-ht-18to40"]],
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

  // Thresholds (Desai 2026 definitions).
  {
    const near = (a, b, t = 0.01) => Math.abs(a - b) < t;
    const T = (id) => THRESHOLDS.find((t) => t.id === id);
    // Desai's cohort means: D 4.4 cm, height 1.76 m → AHI 2.50 cm/m, CSAH 8.64 cm²/m (paper: 2.53 ± 0.3, 8.8 ± 1)
    check("thresholds: AHI 44 mm / 176 cm = 2.50", near(indexValue("AHI", 44, 176), 2.5));
    check("thresholds: CSAH 44 mm / 176 cm = 8.64", near(indexValue("CSAH", 44, 176), 8.64));
    check("thresholds: AHI 2.5 at 175 cm = 43.75 mm", near(diameterAt(T("desai-ahi"), 175), 43.75));
    check("thresholds: CSAH 10 at 175 cm = 47.2 mm", near(diameterAt(T("gl-csah"), 175), 47.20, 0.01), diameterAt(T("gl-csah"), 175).toFixed(3));
    check("thresholds: round trip", near(indexValue("CSAH", diameterAt(T("desai-csah"), 160), 160), 9, 1e-9));
    // Crossovers quoted in the design notes: Desai pair 1.83 m; AHI 2.43 vs CSAH 10 at 2.16 m; AHI 3.21 vs CSAH 10 at 1.24 m
    check("thresholds: Desai crossover 183 cm", near(crossoverHeight(2.5, 9), 183.3, 0.1), crossoverHeight(2.5, 9).toFixed(1));
    check("thresholds: 2.43 vs 10 at 216 cm", near(crossoverHeight(2.43, 10), 215.6, 0.1), crossoverHeight(2.43, 10).toFixed(1));
    check("thresholds: 3.21 vs 10 at 124 cm", near(crossoverHeight(3.21, 10), 123.6, 0.1), crossoverHeight(3.21, 10).toFixed(1));
    check("thresholds: women-only and short-only rules", !appliesTo(T("desai-women"), { sex: "male", height_cm: 180 }) &&
      appliesTo(T("eacts-50"), { sex: "male", height_cm: 165 }) && !appliesTo(T("eacts-50"), { sex: "male", height_cm: 169 }));

    // Tavolinejad 2025 CMR upper normal (hand-calculated): man 55 y: 0.04×55 + 3.74 = 5.94 cm²/m;
    // at 1.78 m area 10.573 cm² → D = 2·√(10.573/π) = 36.69 mm. Woman 40 y: 0.0327×40 + 3.68 = 4.988;
    // at 1.60 m area 7.981 cm² → 31.88 mm.
    const cm = cmrThreshold({ sex: "male", age: 55, height_cm: 178 });
    const cf = cmrThreshold({ sex: "female", age: 40, height_cm: 160 });
    check("CMR normal: man 55 y = 5.94 cm²/m", near(cm.value, 5.94, 1e-9), cm.value);
    check("CMR normal: man 55 y, 178 cm = 36.69 mm", near(diameterAt(cm, 178), 36.69), diameterAt(cm, 178).toFixed(3));
    check("CMR normal: woman 40 y = 4.988 cm²/m", near(cf.value, 4.988, 1e-9), cf.value);
    check("CMR normal: woman 40 y, 160 cm = 31.88 mm", near(diameterAt(cf, 160), 31.88), diameterAt(cf, 160).toFixed(3));
    check("CMR normal: extrapolated outside 40–70 y", cmrThreshold({ sex: "male", age: 30, height_cm: 180 }).extrapolated &&
      !cm.extrapolated && cmrThreshold({ sex: "female", age: 75, height_cm: 160 }).extrapolated);
  }

  // Indexed report line (terse).
  {
    const F = { sex: "female", age: 62, height_cm: 158, weight_kg: 60 };
    const cases = [
      ["aao", 44, F, "mm", "Ascending aorta 44 mm: AHI 2.78 cm/m, CSAH 9.6 cm2/m; above Desai 2026 risk thresholds (AHI 2.5, CSAH 9)."],
      ["sov", 38, F, "mm", "Sinus of Valsalva 38 mm: AHI 2.41 cm/m, CSAH 7.2 cm2/m; below Desai 2026 risk thresholds (AHI 2.5, CSAH 9)."],
      ["aao", 41, F, "mm", "Ascending aorta 41 mm: AHI 2.59 cm/m, CSAH 8.4 cm2/m; above Desai 2026 AHI threshold (2.5), below CSAH (9)."],
      ["aao", 46, F, "mm", "Ascending aorta 46 mm: AHI 2.91 cm/m, CSAH 10.5 cm2/m; above Desai 2026 risk thresholds (AHI 2.5, CSAH 9); meets 2022 ACC/AHA CSAH >= 10 (IIa)."],
      ["aao", 44, { sex: "male", age: 60, height_cm: 190, weight_kg: 95 }, "cm", "Ascending aorta 4.4 cm: AHI 2.32 cm/m, CSAH 8.0 cm2/m; below Desai 2026 risk thresholds (AHI 2.5, CSAH 9)."],
    ];
    for (const [site, y, pt, u, want] of cases) {
      const got = indexedReportLine(site, y, pt, u);
      check(`report: indexed ${site} ${y} mm ${pt.height_cm} cm`, got === want, got);
    }
  }

  // Input checks.
  check("input: 3.8 mm flagged as cm", checkMeasurement("sov", 3.8, "mm").level === "cm?" && checkMeasurement("sov", 3.8, "mm").suggestion === 38);
  check("input: 3.8 cm is fine", checkMeasurement("sov", 3.8, "cm").level === "ok");
  check("input: 85 mm SoV unusual", checkMeasurement("sov", 85, "mm").level === "unusual");
  check("input: 36 mm SoV ok", checkMeasurement("sov", 36, "mm").level === "ok");
  return results;
}
