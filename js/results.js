// Results page: reads the hash, scores every reference for every entered site,
// and renders one comparison table per site. All state lives in the hash, so
// switching units, alternatives or SD variants just rewrites the hash.

import registry from "../registry/index.js";
import { score, notesFor } from "../lib/evaluator.js";
import { covariates } from "../lib/covariates.js";
import { SITES, modelsForSite, applyChoices } from "../lib/conventions.js";
import { decodeHash, encodeHash, convFromCode, picksFor, sdVariantFor, DEFAULT_CONV } from "../lib/state.js";
import { SITE_NAMES, scalingOf, shortLabel, fmtZ, fmtPct, fmtLen, fmtObserved, reportLine } from "../lib/describe.js";

export const VERSION = "v0.1";
const CONV_LABEL = { "ll-ed": "leading edge, end-diastole", "ll-ms": "leading edge, mid-systole",
                     "ii-ed": "inner edge, end-diastole", "ii-ms": "inner edge, mid-systole" };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

let state;
const checked = new Set(); // report rows ticked (survives re-render, not saved in the link)

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
  document.getElementById("version").textContent = VERSION;

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
            `<li>${esc(ref.citation.authors.split(",")[0])} et al. ${esc(ref.citation.journal)} ${ref.citation.year}. <a href="https://doi.org/${esc(ref.citation.doi)}">doi:${esc(ref.citation.doi)}</a></li></ul></details>`
          : "";
        const key = `${site}|${ref.id}|${model.id}`;
        const line = reportLine(site, y, r, ref, model, units);
        reportRows.push({ key, line });
        const zHi = r.z != null && Math.abs(r.z) >= 1.96 ? " hi" : "";
        rows += `<tr class="${first.trim()}">
          <td>${refCell}</td>
          <td><div>${esc(shortLabel(ref, model))}</div>
              <div class="model">${esc(scalingOf(model))}</div>${choice}${variant}${flags ? "<div>" + flags + "</div>" : ""}${notesHtml}</td>
          <td class="num">${fmtLen(r.pred, units)}</td>
          <td class="num">${r.lln == null ? "—" : `${fmtLen(r.lln, units).replace(/ (mm|cm)$/, "")}–${fmtLen(r.uln, units)}`}</td>
          <td class="num z${zHi}">${fmtZ(r.z)}</td>
          <td class="num">${fmtPct(r.pctPred)}</td>
          <td><input type="checkbox" data-report="${esc(key)}" aria-label="Include in report" ${checked.has(key) ? "checked" : ""}></td>
        </tr>`;
      });
    }

    const convNote = convCode === DEFAULT_CONV[site] ? "" : ` <span class="flag">non-default</span>`;
    main.insertAdjacentHTML("beforeend", `
      <h2>${SITE_NAMES[site]} ${fmtObserved(y, units)} <span class="muted small">(${CONV_LABEL[convCode]})</span>${convNote}</h2>
      <div class="tablewrap"><table>
        <thead><tr><th>Reference</th><th>Model</th><th class="num">Predicted</th><th class="num">Normal range</th>
          <th class="num">z</th><th class="num">% pred</th><th>Report</th></tr></thead>
        <tbody>${rows}</tbody></table></div>`);
  }

  // Wire up controls rendered above
  for (const s of main.querySelectorAll("select[data-pick]"))
    s.onchange = () => setHash((st) => { st.view.picks[s.dataset.pick] = s.value; });
  for (const c of main.querySelectorAll("input[data-sd]"))
    c.onchange = () => setHash((st) => { if (c.checked) st.view.sd[c.dataset.sd] = c.value; else delete st.view.sd[c.dataset.sd]; });
  for (const c of main.querySelectorAll("input[data-report]"))
    c.onchange = () => { c.checked ? checked.add(c.dataset.report) : checked.delete(c.dataset.report); updateReport(reportRows); };
  updateReport(reportRows);
}

function updateReport(rows) {
  const lines = rows.filter((r) => checked.has(r.key)).map((r) => r.line);
  document.getElementById("report").hidden = rows.length === 0;
  document.getElementById("reportText").value = lines.length ? [...lines, `aoroot.parameterz.com ${VERSION}`].join("\n") : "";
  document.getElementById("copy").disabled = !lines.length;
}

document.getElementById("copy").onclick = async () => {
  const text = document.getElementById("reportText").value;
  try { await navigator.clipboard.writeText(text); document.getElementById("copied").textContent = "Copied."; }
  catch { document.getElementById("reportText").select(); document.getElementById("copied").textContent = "Press Ctrl/Cmd+C to copy."; }
  setTimeout(() => (document.getElementById("copied").textContent = ""), 2500);
};

window.addEventListener("hashchange", render);
render();
