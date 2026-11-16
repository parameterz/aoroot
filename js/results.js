// Results page: reads the hash, scores every reference for every entered site,
// and renders one comparison table per site. All state lives in the hash, so
// switching units, alternatives or SD variants just rewrites the hash.

import registry from "../registry/index.js";
import { score, notesFor } from "../lib/evaluator.js";
import { covariates } from "../lib/covariates.js";
import { SITES, modelsForSite, applyChoices } from "../lib/conventions.js";
import { decodeHash, encodeHash, convFromCode, picksFor, sdVariantFor, DEFAULT_CONV, FILTER_KINDS } from "../lib/state.js";
import { drawPctCard, drawLegend, drawCurveCard, drawThresholdCard } from "./cards.js";
import { THRESHOLDS, CMR_NORMAL, cmrThreshold, indexValue, diameterAt, appliesTo, crossoverHeight } from "../lib/thresholds.js";
import { curveSeries, SWEEP } from "./curve.js";
import { SITE_NAMES, scalingOf, adjustsFor, componentsOf, passesFilter, CHIP_OF, shortLabel, fmtZ, fmtPct, fmtLen, fmtObserved, reportLine, indexedReportLine } from "../lib/describe.js";

import { VERSION } from "../lib/version.js";
export { VERSION };
const CONV_LABEL = { "ll-ed": "leading edge, end-diastole", "ll-ms": "leading edge, mid-systole",
                     "ii-ed": "inner edge, end-diastole", "ii-ms": "inner edge, mid-systole" };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

let state;
const checked = new Set(); // report rows ticked (survives re-render, not saved in the link)
const curveView = { xVar: "height_cm", hidden: new Set() }; // curve card display choices (this visit only)
const thrView = { hidden: new Set() }; // thresholds chart: hidden groups (risk, surgery, normal, band); this visit only

function setHash(mutate) {
  mutate(state);
  history.replaceState(null, "", encodeHash(state));
  render();
}

function render() {
  const decoded = decodeHash(location.hash);
  state = decoded.state;
  const { patient: p, view } = state;
  const units = view.units;
  document.getElementById("version").textContent = `v${VERSION}`;

  // Summary bar
  const cov = p.sex && p.height_cm ? covariates(p) : {};
  const bsa = cov.bsa_dubois ? ` · BSA ${cov.bsa_dubois.toFixed(2)} m²` : "";
  document.getElementById("summary").innerHTML = p.sex
    ? `<span><b>${p.sex === "male" ? "Male" : "Female"}</b> · ${p.age} y · ${Math.round(p.height_cm * 10) / 10} cm` +
      `${p.weight_kg != null ? ` · ${Math.round(p.weight_kg * 10) / 10} kg` : " · no weight"}${bsa}</span>` +
      `<a href="index.html${esc(location.hash)}">Edit</a>` +
      `<span class="seg" style="margin-left:auto"><label><input type="radio" name="u" value="mm" ${units === "mm" ? "checked" : ""}> mm</label>` +
      `<label><input type="radio" name="u" value="cm" ${units === "cm" ? "checked" : ""}> cm</label></span>`
    : `Nothing entered yet. <a href="index.html">Enter a patient</a>.`;
  for (const r of document.querySelectorAll("[name=u]")) r.onchange = () => setHash((s) => { s.view.units = r.value; });

  document.getElementById("errors").innerHTML = decoded.errors.length
    ? `<p class="errors">Some values in the link were ignored: ${esc(decoded.errors.join("; "))}.</p>` : "";

  const main = document.getElementById("sites");
  main.innerHTML = "";
  const reportRows = [];

  for (const site of SITES) {
    const y = state.y[site];
    if (y == null || !p.sex) continue;
    const convCode = state.conv[site];
    const conv = convFromCode(convCode);
    let rows = "";
    const pctRows = [];

    for (const ref of registry) {
      if (!ref.models.some((m) => m.measurement.site === site && !m.measurement.sinus)) continue; // reference doesn't cover this site
      const candidates = modelsForSite(ref, p, site, conv);
      const models = applyChoices(candidates, picksFor(state, ref.id));
      if (!models.length) {
        const anyConv = ref.models.some((m) => m.measurement.site === site && m.measurement.edge === conv.edge && m.measurement.phase === conv.phase);
        rows += `<tr class="na ref-start"><td><span class="ref">${esc(ref.label)}</span></td><td colspan="6">` +
          (anyConv ? "No equation for this patient's age or sex." : `Not measured this way (${CONV_LABEL[convCode]}).`) + `</td></tr>`;
        continue;
      }
      models.forEach((model, i) => {
        const sdVar = sdVariantFor(state, ref.id, model.id);
        const r = score(ref, model, p, y, { sdVariant: sdVar });
        const first = i === 0 ? " ref-start" : "";
        const refCell = i === 0 ? `<span class="ref">${esc(ref.label)}</span>` : "";
        if (r.missing) {
          rows += `<tr class="na${first}"><td>${refCell}</td><td>${esc(model.label)}</td><td colspan="5">Needs weight (uses ${esc(r.missing.replace("_", " "))}).</td></tr>`;
          return;
        }
        // Alternatives (population, BSA formula)
        let choice = "";
        if (model.choice) {
          const opts = candidates.filter((m) => m.choice?.group === model.choice.group);
          if (opts.length > 1)
            choice = `<br><select data-pick="${esc(ref.id)}.${esc(model.choice.group)}" aria-label="Choose version">` +
              opts.map((m) => `<option value="${esc(m.id)}" ${m.id === model.id ? "selected" : ""}>${esc(m.choice.label)}</option>`).join("") + `</select>`;
        }
        // SD variants (Devereux consistency-corrected SEE)
        let variant = "";
        for (const v of model.sd?.variants ?? [])
          variant += `<br><label class="small" style="flex-direction:row;gap:.3rem"><input type="checkbox" data-sd="${esc(ref.id)}.${esc(model.id)}" value="${esc(v.id)}" ${sdVar === v.id ? "checked" : ""}> ${esc(v.label)} SD</label>`;
        // Flags and notes
        const flags = [
          ...(model.status === "caution" ? ['<span class="flag">caution</span>'] : []),
          ...(r.extrapolated.length ? [`<span class="flag">outside study ${esc(r.extrapolated.join(", ").replace(/_cm|_kg|_dubois|_haycock/g, ""))}</span>`] : []),
          ...(ref.verification?.status === "draft" ? ['<span class="flag draft">draft</span>'] : []),
        ].join("");
        const notes = notesFor(ref, model);
        const notesHtml = notes.length
          ? `<details class="notes"><summary>Why? (${notes.length} note${notes.length > 1 ? "s" : ""})</summary><ul>` +
            notes.map((n) => `<li class="${n.severity}">${esc(n.text)}</li>`).join("") +
            `<li>${esc(ref.citation.authors.split(",")[0])} et al. ${esc(ref.citation.journal)} ${ref.citation.year}. <a href="https://doi.org/${esc(ref.citation.doi)}">doi:${esc(ref.citation.doi)}</a> · <a href="references.html#${esc(ref.id)}">equations and sources</a></li></ul></details>`
          : "";
        const comps = componentsOf(model);
        pctRows.push({
          ref: i === 0 ? ref.label : "", groupStart: i === 0, comps,
          extrap: [...new Set(r.extrapolated.map(CHIP_OF).filter(Boolean))],
          title: `${ref.label} · ${shortLabel(ref, model)}\n${scalingOf(model)}; adjusts for ${adjustsFor(model)}` +
            (r.pctPred == null ? "" : `\n${fmtPct(r.pctPred)} of predicted` + (r.llnPct == null ? "" : ` (normal ${fmtPct(r.llnPct)}–${fmtPct(r.ulnPct)})`)),
          pct: r.pctPred, lo: r.llnPct, hi: r.ulnPct, outside: !!r.outside,
          dim: !passesFilter(comps, view.filter),
        });
        const key = `${site}|${ref.id}|${model.id}`;
        const line = reportLine(site, y, r, ref, model, units);
        reportRows.push({ key, line });
        const zHi = r.outside ? " hi" : "";
        rows += `<tr class="${first.trim()}">
          <td>${refCell}</td>
          <td><div>${esc(shortLabel(ref, model))}</div>
              <div class="model">${esc(scalingOf(model))}</div>${choice}${variant}${flags ? "<div>" + flags + "</div>" : ""}${notesHtml}</td>
          <td class="num" data-label="Predicted">${fmtLen(r.pred, units)}</td>
          <td class="num" data-label="Normal range">${r.lln == null ? "—" : `${fmtLen(r.lln, units).replace(/ (mm|cm)$/, "")}–${fmtLen(r.uln, units)}`}</td>
          <td class="num z${zHi}" data-label="z">${fmtZ(r.z)}</td>
          <td class="num" data-label="% pred">${fmtPct(r.pctPred)}</td>
          <td class="rep" data-label="Report"><input type="checkbox" data-report="${esc(key)}" aria-label="Include in report" ${checked.has(key) ? "checked" : ""}></td>
        </tr>`;
      });
    }

    const convNote = convCode === DEFAULT_CONV[site] ? "" : ` <span class="flag">non-default</span>`;
    main.insertAdjacentHTML("beforeend", `
      <h2>${SITE_NAMES[site]} ${fmtObserved(y, units)} <span class="muted small">(${CONV_LABEL[convCode]})</span>${convNote}</h2>
      <div class="tablewrap"><table class="cmp">
        <thead><tr><th>Reference</th><th>Model</th><th class="num">Predicted</th><th class="num">Normal range</th>
          <th class="num">z</th><th class="num">% pred</th><th>Report</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
      <section class="card" aria-label="${SITE_NAMES[site]}: percent of predicted">
        <div class="card-head"><h3>Percent of predicted</h3>
          <span class="handnote">same ${fmtObserved(y, units)}, as a share of what each reference expects</span></div>
        <svg class="pct" id="pct_${site}" role="img" aria-label="Percent of predicted for each reference; values are in the table above"></svg>
        <div class="legend"><span><span data-lg="band"></span> normal range</span><span><span data-lg="dot"></span> this patient</span>
          <span><span data-lg="out"></span> outside the normal range</span>${pctRows.some((r) => r.extrap.length) ? `<span><span data-lg="hollow"></span> outside the study's range</span>` : ""}
          <span class="muted">dashed line: 100% of predicted</span></div>
        <div class="legend chips-key"><span><span class="chipkey">BSA</span> in the equation</span><span><span class="chipkey">÷BSA</span> simple ratio</span>
          <span><span class="chipkey age">age</span> age in the equation</span><span><span class="chipkey band">age 41–65</span> age group used</span>
          ${pctRows.some((r) => r.extrap.length) ? `<span><span class="chipkey warn">ht</span> patient outside the study's range</span>` : ""}<span class="muted">no age chip: age ignored · sex not shown (nearly all are sex-specific)</span></div>
        <div class="pfilter"><span>Show only references using</span>
          ${[["age", "age"], ["ht", "ht"], ["wt", "wt"], ["bsa", "BSA"]].map(([k, t]) => `<button type="button" class="pf" data-pf="${k}" aria-pressed="${view.filter.includes(k)}">${t}</button>`).join("")}
          <span class="sep"></span>
          ${[["ratio", "÷ ratios"], ["eq", "fitted equations"]].map(([k, t]) => `<button type="button" class="pf" data-pf="${k}" aria-pressed="${view.filter.includes(k)}">${t}</button>`).join("")}
          <span class="count">${view.filter.length ? `showing ${pctRows.filter((r) => !r.dim).length} of ${pctRows.length}` : ""}</span></div>
      </section>`);
    const svg = document.getElementById(`pct_${site}`);
    if (pctRows.length) { drawPctCard(svg, pctRows); drawLegend(svg.parentElement); }
    else svg.closest(".card").hidden = true;

    // Card 2: patient on the curve.
    const series = curveSeries(registry, state, site, curveView.xVar).map((s) => ({
      ...s, colorIndex: registry.indexOf(s.ref), hidden: curveView.hidden.has(s.ref.id),
    }));
    if (series.some((s) => s.pts.some(Boolean))) {
      const xv = curveView.xVar;
      main.insertAdjacentHTML("beforeend", `
        <section class="card" aria-label="${SITE_NAMES[site]}: patient on the curve">
          <div class="card-head"><h3>Patient on the curve</h3>
            <span class="handnote">${xv === "age" ? "same person, any age" : "same person, any height"}: what each reference expects</span>
            <span class="seg small-seg" style="margin-left:auto">
              <label><input type="radio" name="cx_${site}" value="height_cm" ${xv === "height_cm" ? "checked" : ""}> vs height</label>
              <label><input type="radio" name="cx_${site}" value="age" ${xv === "age" ? "checked" : ""}> vs age</label></span></div>
          <svg class="curve" id="curve_${site}" role="img" aria-label="Predicted diameter and upper limit of normal for each reference against ${xv === "age" ? "age" : "height"}; values for this patient are in the table above"></svg>
          <div class="legend keys">${series.map((s) => `<button type="button" class="key c${s.colorIndex}" data-ref="${esc(s.ref.id)}" aria-pressed="${!s.hidden}" title="${esc(s.sub)}">${esc(s.label)}</button>`).join("")}
            <span class="muted">solid: predicted · dashed: upper limit of normal · faded: outside the study's range · ${xv === "age" ? "height and weight" : "age, sex and weight"} held at this patient's values</span></div>
        </section>`);
      const csvg = document.getElementById(`curve_${site}`);
      const px = xv === "age" ? p.age : p.height_cm;
      drawCurveCard(csvg, series, { x: Math.min(Math.max(px, SWEEP[xv].min), SWEEP[xv].max), y, label: fmtObserved(y, units) },
        SWEEP[xv].label, (v) => (units === "cm" ? (v / 10).toFixed(1) : `${v}`));
    }
  }
  for (const site of ["sov", "aao"]) {
    if (state.y[site] == null || !p.sex) continue;
    renderThresholds(main, site, state.y[site], units, p, reportRows);
  }
  for (const b of main.querySelectorAll("button[data-pf]"))
    b.onclick = () => setHash((st) => {
      const k = b.dataset.pf, f = st.view.filter;
      if (f.includes(k)) st.view.filter = f.filter((x) => x !== k);
      else st.view.filter = [...f.filter((x) => !(FILTER_KINDS.includes(k) && FILTER_KINDS.includes(x))), k];
    });
  for (const r of main.querySelectorAll("input[name^=cx_]"))
    r.onchange = () => { curveView.xVar = r.value; render(); };
  for (const b of main.querySelectorAll("button.key"))
    b.onclick = () => { const id = b.dataset.ref; curveView.hidden.has(id) ? curveView.hidden.delete(id) : curveView.hidden.add(id); render(); };

  // Wire up controls rendered above
  for (const s of main.querySelectorAll("select[data-pick]"))
    s.onchange = () => setHash((st) => { st.view.picks[s.dataset.pick] = s.value; });
  for (const c of main.querySelectorAll("input[data-sd]"))
    c.onchange = () => setHash((st) => { if (c.checked) st.view.sd[c.dataset.sd] = c.value; else delete st.view.sd[c.dataset.sd]; });
  for (const c of main.querySelectorAll("input[data-report]"))
    c.onchange = () => { c.checked ? checked.add(c.dataset.report) : checked.delete(c.dataset.report); updateReport(reportRows); };
  updateReport(reportRows);
}

/** Card 3: risk thresholds (AHI / CSAH / diameter) for the SoV and ascending aorta. */
function renderThresholds(main, site, y, units, p, reportRows) {
  const key = `${site}|indexed`;
  reportRows.push({ key, line: indexedReportLine(site, y, p, units) });
  const h = p.height_cm;
  const ahi = indexValue("AHI", y, h), csah = indexValue("CSAH", y, h);
  const cmr = CMR_NORMAL.sites.includes(site) ? cmrThreshold(p) : null;
  const ths = [...THRESHOLDS.filter((t) => appliesTo(t, p)), ...(cmr ? [cmr] : [])]
    .map((t) => ({ ...t, d: diameterAt(t, h) })).sort((a, b) => a.d - b.d);
  const KIND = { risk: "risk", surgery: "surgery", normal: "CMR normal" };
  const fmtIdx = (t) => (t.index === "AHI" ? `${ahi.toFixed(2)} cm/m` : t.index === "CSAH" ? `${csah.toFixed(1)} cm²/m` : fmtObserved(y, units));
  const rows = ths.map((t) => {
    const reached = y >= t.d - 1e-9;
    const gap = t.d - y;
    if (t.kind === "normal") return `<tr class="normal${reached ? " above" : ""}">
      <td><span class="kind normal">${KIND.normal}</span> ${esc(t.label)} (${t.value.toFixed(2)} cm²/m)<div class="model">Tavolinejad 2025, UK Biobank, lumen${t.extrapolated ? ` · <span class="flag draft">age outside 40–70: extrapolated</span>` : ""}</div></td>
      <td class="num">${fmtLen(t.d, units)}</td>
      <td class="num">${fmtIdx(t)}</td>
      <td>${reached ? "<b>above</b>" : `${fmtLen(gap, units)} below`}</td></tr>`;
    return `<tr class="${reached ? "reached" : ""}">
      <td><span class="kind ${t.kind}">${KIND[t.kind]}</span> ${esc(t.label)}<div class="model">${esc(t.source)}</div></td>
      <td class="num">${fmtLen(t.d, units)}</td>
      <td class="num">${fmtIdx(t)}</td>
      <td>${reached ? "<b>reached</b>" : `${fmtLen(gap, units)} below`}</td></tr>`;
  }).join("");

  // Chart data: thresholds and the references' upper limits across heights (rest of the patient fixed).
  const xRange = [140, 205];
  // Chart: one line per distinct rule (the EACTS 50 mm rule coincides with the 50 mm line, so table only).
  const allLines = THRESHOLDS.filter((t) => (!t.when?.sex || t.when.sex === p.sex) && !t.when?.height_cm).map((t) => {
    const pts = [];
    for (let x = xRange[0]; x <= xRange[1]; x += 1) if (appliesTo(t, { ...p, height_cm: x })) pts.push({ x, y: diameterAt(t, x) });
    return { id: t.id, kind: t.kind, label: t.label, short: t.short, pts };
  });
  if (cmr) {
    const pts = [];
    for (let x = xRange[0]; x <= xRange[1]; x += 1) pts.push({ x, y: diameterAt(cmr, x) });
    allLines.push({ id: cmr.id, kind: "normal", label: `CMR normal, ${Math.round(p.age)} y`, short: "CMR normal", pts, faded: cmr.extrapolated });
  }
  const series = curveSeries(registry, state, site, "height_cm");
  const envelope = [];
  for (let i = 0; i <= xRange[1] - xRange[0]; i++) {
    const ulns = series.map((s) => s.pts[i]?.uln).filter((v) => v != null);
    if (ulns.length) envelope.push({ x: xRange[0] + i, lo: Math.min(...ulns), hi: Math.max(...ulns) });
  }
  const hid = thrView.hidden;
  const lines = allLines.filter((l) => !hid.has(l.kind));
  const cx = crossoverHeight(2.5, 9);
  const tk = (k, inner, text) => `<button type="button" class="tkey" data-thr="${k}" aria-pressed="${!hid.has(k)}">${inner} ${text}</button>`;
  main.insertAdjacentHTML("beforeend", `
    <section class="card thresholds" aria-label="${SITE_NAMES[site]}: risk thresholds">
      <div class="card-head"><h3>Risk thresholds</h3>
        <span class="handnote">"abnormal for you" and "at risk" are different questions</span></div>
      <p class="small" style="margin:6px 0 10px">${SITE_NAMES[site]} ${fmtObserved(y, units)} at ${Math.round(h)} cm:
        <b class="mono">AHI ${ahi.toFixed(2)} cm/m</b> (diameter ÷ height) ·
        <b class="mono">CSAH ${csah.toFixed(1)} cm²/m</b> (π·(D/2)² ÷ height, assuming a circular cross-section)
        <label class="inline-report"><input type="checkbox" data-report="${key}" ${checked.has(key) ? "checked" : ""}> add AHI and CSAH to the report</label></p>
      <div class="tablewrap"><table>
        <thead><tr><th>Threshold</th><th class="num">As diameter at this height</th><th class="num">This patient</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
      <svg class="curve" id="thr_${site}" role="img" aria-label="Threshold diameters against height with this patient; values are in the table above"></svg>
      <div class="legend">${tk("risk", `<span class="sw risk"></span>`, "risk association (Desai 2026)")}${tk("surgery", `<span class="sw surg"></span>`, "guideline surgical threshold")}${cmr ? tk("normal", `<span class="sw norm"></span>`, "CMR upper normal for age and sex (Tavolinejad 2025)") : ""}
        ${tk("band", `<span data-lg="band"></span>`, "upper limits of normal across the references")}<span><span data-lg="dot"></span> this patient</span>
        <span class="small muted handnote">tap to hide or show</span></div>
      <details class="notes"><summary>About these thresholds</summary><ul>
        <li class="important">These are not normal ranges. Desai 2026 studied 8,887 unoperated patients with a 4–5 cm ascending aorta (mean age 68, 79% men, echo L–L end-diastole) and all-cause death; AHI and CSAH separated risk only modestly (AUC 0.56 and 0.54).</li>
        <li>Desai used the larger of the root and ascending aorta for every index. The site applies each threshold to whichever level you entered.</li>
        <li>CSAH from an echo diameter assumes a circular lumen (π·r²); Desai notes it may be inaccurate with an eccentric root.</li>
        <li>AHI rises in proportion to height (D ∝ H) and CSAH with its square root (D ∝ √H). Desai's two thresholds give the same diameter only at ${(cx / 100).toFixed(2)} m: below that AHI ≥ 2.5 is reached first, above it CSAH ≥ 9.</li>
        <li>Guideline classes (I, IIa, IIb) as cited by Desai 2026 from the 2022 ACC/AHA guideline and the 2024 EACTS/STS guideline (5.0 cm if shorter than 1.69 m). Check the guidelines themselves before acting on them.</li>
        ${cmr ? `<li class="important">The CMR line is a normal limit, not a risk threshold, and it comes from another modality. Tavolinejad 2025 used the same index as CSAH (area ÷ height): its upper limit of normal is ${CMR_NORMAL.upper.male.perYear} × age + ${CMR_NORMAL.upper.male.intercept} cm²/m in men and ${CMR_NORMAL.upper.female.perYear} × age + ${CMR_NORMAL.upper.female.intercept} in women (97.5th percentile, ${esc(CMR_NORMAL.population)})</li>
        <li>CMR measures the lumen (closer to echo inner edge than leading edge), takes the largest cross-section anywhere from the root to the arch apex, and gets the area from a 3-D segmentation (π·r², r = centerline-to-wall distance). The cardiac phase isn't stated in the main text. Expect an echo leading-edge diameter to run a little larger than the CMR lumen for the same aorta.${cmr.extrapolated ? " This patient's age is outside 40–70, so the CMR line is extrapolated (shown faded)." : ""}</li>
        <li>For a measured CMR value, see <a href="https://parameterz.github.io/aao-cmr">parameterz.github.io/aao-cmr</a>. ${esc(CMR_NORMAL.citation)} <a href="https://doi.org/${CMR_NORMAL.doi}">doi:${CMR_NORMAL.doi}</a></li>` : ""}
        <li>Desai MY et al. JACC Adv 2026;5:102859. <a href="https://doi.org/10.1016/j.jacadv.2026.102859">doi:10.1016/j.jacadv.2026.102859</a></li></ul></details>
    </section>`);
  const svg = document.getElementById(`thr_${site}`);
  for (const b of svg.parentElement.querySelectorAll("button.tkey"))
    b.onclick = () => { const k = b.dataset.thr; hid.has(k) ? hid.delete(k) : hid.add(k); render(); };
  drawThresholdCard(svg, { lines, envelope: hid.has("band") ? [] : envelope, patient: { x: h, y, label: fmtObserved(y, units) },
    cross: hid.has("risk") ? null : { x: cx, y: diameterAt({ index: "AHI", value: 2.5 }, cx), label: "AHI 2.5 = CSAH 9 here" }, xRange },
    (v) => (units === "cm" ? (v / 10).toFixed(1) : `${v}`));
  drawLegend(svg.parentElement);
}

function updateReport(rows) {
  // Report order: by site, then as the rows appear (indexed line after that site's references).
  const lines = rows.filter((r) => checked.has(r.key))
    .map((r, i) => ({ ...r, i, s: SITES.indexOf(r.key.split("|")[0]) }))
    .sort((a, b) => a.s - b.s || a.i - b.i).map((r) => r.line);
  document.getElementById("report").hidden = rows.length === 0;
  document.getElementById("reportText").value = lines.length ? [...lines, `aoroot.parameterz.com v${VERSION}`].join("\n") : "";
  document.getElementById("copy").disabled = !lines.length;
}

document.getElementById("copy").onclick = async () => {
  const text = document.getElementById("reportText").value;
  try { await navigator.clipboard.writeText(text); document.getElementById("copied").textContent = "Copied."; }
  catch { document.getElementById("reportText").select(); document.getElementById("copied").textContent = "Press Ctrl/Cmd+C to copy."; }
  setTimeout(() => (document.getElementById("copied").textContent = ""), 2500);
};

window.addEventListener("hashchange", render);
// Redraw the sketches when the width changes (text in the cards stays a fixed size).
let lastW = window.innerWidth, resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { if (Math.abs(window.innerWidth - lastW) > 40) { lastW = window.innerWidth; render(); } }, 150);
});
render();
