// References page (references.html) and the curator's review page (review.html):
// both generated from the registry by this one module. On review.html
// (<body data-mode="review">) it adds the reconciliation tools: per-model ticks
// and comments kept in this browser only (localStorage), turned into a
// plain-text summary for the reviewer to send.

import registry from "../registry/index.js";
import { notesFor } from "../lib/evaluator.js";
import { runRefTests, runAll } from "../tests/cases.js";
import { THRESHOLDS, CMR_NORMAL } from "../lib/thresholds.js";
import { meanText, spreadText, isSexKeyed, SITE_NAMES } from "../lib/describe.js";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const REVIEW = document.body.dataset.mode === "review";
const STORE = "aoroot.review.v1";
const today = () => new Date().toISOString().slice(0, 10);

// ── Review state (per browser) ──────────────────────────────────────────────
function loadReview() {
  try { return JSON.parse(localStorage.getItem(STORE)) ?? {}; } catch { return {}; }
}
let review = loadReview();
function saveReview() {
  try { localStorage.setItem(STORE, JSON.stringify(review)); } catch { /* private mode: ticks last for this visit */ }
}
const rv = (refId) => (review[refId] ??= { checked: [], comments: "" });

// ── Formatting helpers ──────────────────────────────────────────────────────
function citation(c) {
  const authors = c.authors.split(", ");
  const short = authors.length > 6 ? authors.slice(0, 6).join(", ") + ", et al" : c.authors;
  return `${esc(short)}. ${esc(c.title)}. <i>${esc(c.journal)}</i> ${c.year};${esc(c.volume)}:${esc(c.pages)}.` +
    ` <a href="https://doi.org/${esc(c.doi)}">doi:${esc(c.doi)}</a>`;
}
const range = (r) => (r && (r[0] != null || r[1] != null) ? `${r[0] ?? "…"}–${r[1] ?? "…"}` : "not reported");
const convText = (m) => [m.edge === "leading" ? "leading edge" : "inner edge", m.phase, m.view, m.sinus ? `${m.sinus} sinus` : null].filter(Boolean).join(", ");
const whenText = (w) => !w ? "" : Object.entries(w).map(([k, v]) => Array.isArray(v) ? `${k} ${v[0] ?? ""}–${v[1] != null ? `<${v[1]}` : "…"}` : `${k} ${v}`).join("; ");
const validityText = (v) => !v ? "—" : Object.entries(v).map(([k, r]) => `${k.replace(/_cm|_kg|_dubois/g, "")} ${range(r)}`).join("; ");
const sources = (m) => [...new Set([m.mean?.source, m.sd?.source, m.ratio?.source].filter(Boolean))].join("; ");

// ── Render ──────────────────────────────────────────────────────────────────
const testResults = Object.fromEntries(registry.map((r) => [r.id, runRefTests(r)]));

function renderSummary() {
  document.querySelector("#summary tbody").innerHTML = registry.map((ref) => {
    const tr = testResults[ref.id];
    const kinds = ["paper", "independent", "arithmetic"].map((k) => [k, tr.filter((t) => t.kind === k).length]).filter(([, n]) => n);
    const pass = tr.filter((t) => t.pass).length;
    const sites = [...new Set(ref.models.map((m) => m.measurement.site))].map((s) => SITE_NAMES[s].replace("Sinus of Valsalva", "SoV").replace("Sinotubular junction", "STJ").replace("Ascending aorta", "AAo").replace("Aortic annulus", "annulus")).join(", ");
    const done = rv(ref.id).checked.filter((id) => ref.models.some((m) => m.id === id)).length;
    const st = ref.verification?.status ?? "draft";
    return `<tr><td class="lead"><a class="ref" href="#${ref.id}">${esc(ref.label)}</a></td><td class="num" data-label="n">${ref.population.n != null ? ref.population.n.toLocaleString() : "—"}${ref.population.via ? `<div class="model">via ${esc(ref.population.via)}</div>` : ""}</td>
      <td data-label="Sites">${esc(sites)}</td><td class="num" data-label="Models">${ref.models.length}</td>
      <td data-label="Tests"><span class="${pass === tr.length ? "ok" : "bad"}">${pass}/${tr.length} passing</span><div class="model">${kinds.map(([k, n]) => `${n} ${k}`).join(" · ")}</div></td>
      <td data-label="Status"><span class="flag ${st === "draft" ? "draft" : "ok"}">${esc(st)}</span></td>
      ${REVIEW ? `<td class="num" data-label="Your review"><span id="prog_${ref.id}">${done}/${ref.models.length}</span> checked</td>` : ""}</tr>`;
  }).join("");
}

function modelRow(ref, m) {
  const sexes = isSexKeyed(m) ? ["male", "female"] : [null];
  const eq = sexes.map((s) => `<div class="eq">${s ? `<span class="sex">${s === "male" ? "men" : "women"}</span> ` : ""}${esc(meanText(m, s ?? "male"))}</div>`).join("");
  const sp = sexes.map((s) => `<div class="eq sp">${s ? `<span class="sex">${s === "male" ? "men" : "women"}</span> ` : ""}${esc(spreadText(m, s ?? "male"))}</div>`).join("");
  const tags = [
    m.status !== "ok" ? `<span class="flag">${esc(m.status)}</span>` : "",
    m.choice ? `<span class="flag draft">${esc(m.choice.label)}${m.choice.default ? " · default" : ""}</span>` : "",
    m.when ? `<span class="flag draft">${esc(whenText(m.when))}</span>` : "",
  ].join("");
  const isChecked = rv(ref.id).checked.includes(m.id);
  return `<tr class="${REVIEW && isChecked ? "checked" : ""}">
    ${REVIEW ? `<td class="chk"><input type="checkbox" data-ref="${esc(ref.id)}" data-model="${esc(m.id)}" aria-label="Checked ${esc(m.id)} against the paper" ${isChecked ? "checked" : ""}></td>` : ""}
    <td><div><b>${esc(m.label)}</b></div><div class="model mono">${esc(m.id)}</div><div>${tags}</div>
      <div class="model">${esc(SITE_NAMES[m.measurement.site])} · ${esc(convText(m.measurement))}${m.measurement.edgeNote || m.measurement.viewNote ? `<br>${esc(m.measurement.edgeNote ?? m.measurement.viewNote)}` : ""}</div></td>
    <td>${eq}${sp}<div class="model">Valid: ${esc(validityText(m.validity))}</div></td>
    <td class="model srccol" data-label="Source">${esc(sources(m))}</td></tr>`;
}

function testRow(t) {
  const input = Object.entries(t.input).map(([k, v]) => `${k.replace(/_cm|_kg/, "")} ${v}`).join(", ") +
    (t.y ? ` · ${Object.entries(t.y).map(([k, v]) => `${k} ${v}`).join(", ")}` : "") + (t.sdVariant ? ` · ${t.sdVariant}` : "");
  const rows = t.rows.map((r) => `<div class="mono small ${r.ok ? "" : "bad"}">${esc(r.what)}: expected ${r.want}, got ${r.got == null ? "—" : (+r.got.toFixed(4))} (±${r.tol})</div>`).join("");
  return `<tr><td class="${t.pass ? "ok" : "bad"}">${t.pass ? "✓" : "✗"}</td><td><span class="kind ${t.kind === "paper" ? "risk" : t.kind === "independent" ? "surgery" : ""}">${esc(t.kind)}</span></td>
    <td><div>${esc(t.source)}</div><div class="model">${esc(input)}</div>${rows}</td></tr>`;
}

function renderRefs() {
  document.getElementById("refs").innerHTML = registry.map((ref) => {
    const p = ref.population, v = ref.verification ?? {};
    const tr = testResults[ref.id];
    const notes = (ref.notes ?? []).map((n) => {
      const scope = n.appliesTo === "all" ? "all models" : Array.isArray(n.appliesTo) ? n.appliesTo.join(", ") : `models matching ${n.appliesTo.match}`;
      return `<li class="${n.severity}">${esc(n.text)} <span class="model">(${esc(scope)})</span></li>`;
    }).join("");
    return `
    <section class="refsec" id="${esc(ref.id)}">
      <h2>${esc(ref.label)} <span class="flag ${v.status === "draft" ? "draft" : "ok"}">${esc(v.status ?? "draft")}</span>
        <span class="small muted mono">entry ${esc(ref.entryVersion)}</span></h2>
      <p class="cite">${citation(ref.citation)}</p>
      <div class="card">
        <dl class="facts">
          <dt>Population</dt><dd>${p.via ? `From ${esc(p.via)} (the source of this table): ` : ""}n = ${p.n != null ? p.n.toLocaleString() : "not stated"}${p.female != null ? ` · ${Math.round(p.female * 100)}% women` : ""} · age ${esc(range(p.age?.range))}${p.age?.mean != null ? ` (mean ${p.age.mean}${p.age.sd != null ? ` ± ${p.age.sd}` : ""})` : ""} · height ${p.height?.range?.some((x) => x != null) ? `${esc(range(p.height.range))} cm` : "not reported"} · BSA formula: ${esc(p.bsa?.formula ?? "not stated")}</dd>
          <dt>Composition</dt><dd>${(p.composition ?? []).map((c) => `${esc(c.group)}${c.n != null ? ` (${c.n})` : ""}`).join("; ") || "—"}</dd>
          <dt>Region</dt><dd>${esc(p.region)}</dd>
          <dt>Inclusion</dt><dd>${esc(p.inclusion)}</dd>
          <dt>Exclusion</dt><dd>${esc(p.exclusion)}</dd>
          <dt>Source</dt><dd>${esc(p.source)}</dd>
          <dt>Checked against</dt><dd>${esc(v.against ?? "—")}${v.reviewedBy ? ` · reviewed by ${esc(v.reviewedBy)}, ${esc(v.date)}` : ""}</dd>
          ${v.summary ? `<dt>Review</dt><dd>${esc(v.summary)}</dd>` : ""}
        </dl>
      </div>
      <h3 class="sub3">Models <span class="small muted">(${ref.models.length})</span></h3>
      <div class="tablewrap"><table class="models">
        <thead><tr>${REVIEW ? "<th>✓</th>" : ""}<th>Model</th><th>Equation, spread, valid range</th><th>Source</th></tr></thead>
        <tbody>${ref.models.map((m) => modelRow(ref, m)).join("")}</tbody></table></div>
      ${REVIEW ? `<div class="actions"><button type="button" class="secondary small-btn" data-checkall="${esc(ref.id)}">Tick all</button>
        <button type="button" class="secondary small-btn" data-clearall="${esc(ref.id)}">Clear ticks</button></div>` : ""}
      <h3 class="sub3">Tests <span class="small muted">(${tr.filter((t) => t.pass).length}/${tr.length} passing, run in your browser just now)</span></h3>
      <div class="tablewrap"><table class="tests"><tbody>${tr.map(testRow).join("")}</tbody></table></div>
      <h3 class="sub3">Curator's notes</h3>
      <ul class="notelist">${notes}</ul>
      <details class="notes source"><summary>Registry file as entered (registry/${esc(ref.id)}.js)</summary><pre class="src" data-src="${esc(ref.id)}">Loading…</pre></details>
      ${REVIEW ? `<div class="card review">
        <label>Your comments on ${esc(ref.label)}<textarea data-comments="${esc(ref.id)}" rows="3" placeholder="e.g. Table 2 checked; annulus SEE note agreed">${esc(rv(ref.id).comments)}</textarea></label>
        <div class="actions"><button type="button" class="primary" data-copy="${esc(ref.id)}">Copy review summary</button><span class="small muted" data-copied="${esc(ref.id)}"></span></div>
      </div>` : ""}
    </section>`;
  }).join("");
}

// ── Thresholds and context (lib/thresholds.js), reviewed like a reference ──
const THR = { id: "thresholds", label: "Thresholds and context (lib/thresholds.js)" };
const thrItems = [...THRESHOLDS, CMR_NORMAL];
const thrTests = runAll().filter((t) => /^(thresholds|CMR normal):/.test(t.name));
function thrValue(t) {
  if (t.kind === "normal") return `women ${t.upper.female.perYear} × age + ${t.upper.female.intercept}; men ${t.upper.male.perYear} × age + ${t.upper.male.intercept} (cm²/m, ${t.index})`;
  return `${t.index} ≥ ${t.value}${t.index === "AHI" ? " cm/m" : t.index === "CSAH" ? " cm²/m" : " mm"}`;
}
function renderThresholdSection() {
  const r = rv(THR.id);
  const rows = thrItems.map((t) => {
    const on = r.checked.includes(t.id);
    const restrict = t.when ? (t.when.sex ? `${t.when.sex === "female" ? "women" : "men"} only` : `height < ${t.when.height_cm[1]} cm`) : t.validity ? `age ${t.validity.age[0]}–${t.validity.age[1]} (fades outside)` : "";
    return `<tr class="${REVIEW && on ? "checked" : ""}">
      ${REVIEW ? `<td class="chk"><input type="checkbox" data-ref="${THR.id}" data-model="${esc(t.id)}" aria-label="Checked ${esc(t.id)}" ${on ? "checked" : ""}></td>` : ""}
      <td><span class="kind ${t.kind}">${t.kind === "normal" ? "CMR normal" : t.kind}</span> <b>${esc(t.label)}</b><div class="model mono">${esc(t.id)}</div>${restrict ? `<div><span class="flag draft">${esc(restrict)}</span></div>` : ""}</td>
      <td><div class="eq">${esc(thrValue(t))}</div><div class="model">${esc(t.detail ?? t.measurement)}</div></td>
      <td class="model srccol" data-label="Source">${esc(t.source)}</td></tr>`;
  }).join("");
  document.getElementById("refs").insertAdjacentHTML("beforeend", `
    <section class="refsec" id="${THR.id}">
      <h2>Thresholds and context <span class="small muted mono">lib/thresholds.js</span></h2>
      <p class="small" style="max-width:75ch">Not normal ranges: the risk and surgical thresholds shown on the risk-thresholds card (Desai 2026 and the guidelines as Desai cites them), plus the CMR upper normal from Tavolinejad 2025 shown on the ascending aorta card for context. AHI = D (cm) ÷ height (m); CSAH = π(D/2)² (cm²) ÷ height (m).</p>
      <div class="card"><dl class="facts">
        <dt>Desai 2026</dt><dd>Desai MY et al. JACC Adv 2026;5:102859. <a href="https://doi.org/10.1016/j.jacadv.2026.102859">doi:10.1016/j.jacadv.2026.102859</a></dd>
        <dt>Tavolinejad 2025</dt><dd>${esc(CMR_NORMAL.citation)} <a href="https://doi.org/${CMR_NORMAL.doi}">doi:${CMR_NORMAL.doi}</a></dd>
        <dt>CMR measurement</dt><dd>${esc(CMR_NORMAL.measurement)}</dd>
        <dt>CMR population</dt><dd>${esc(CMR_NORMAL.population)}</dd>
      </dl></div>
      <h3 class="sub3">Thresholds <span class="small muted">(${thrItems.length})</span></h3>
      <div class="tablewrap"><table class="models">
        <thead><tr>${REVIEW ? "<th>✓</th>" : ""}<th>Threshold</th><th>Value, detail</th><th>Source</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
      <h3 class="sub3">Tests <span class="small muted">(${thrTests.filter((t) => t.pass).length}/${thrTests.length} passing, run in your browser just now)</span></h3>
      <div class="tablewrap"><table class="tests"><tbody>${thrTests.map((t) => `<tr><td class="${t.pass ? "ok" : "bad"}">${t.pass ? "✓" : "✗"}</td><td><span class="kind">arithmetic</span></td><td>${esc(t.name)}${t.detail !== "" ? `<div class="model mono">got ${esc(t.detail)}</div>` : ""}</td></tr>`).join("")}</tbody></table></div>
      ${REVIEW ? `<div class="card review">
        <label>Your comments on the thresholds<textarea data-comments="${THR.id}" rows="3">${esc(r.comments)}</textarea></label>
        <div class="actions"><button type="button" class="primary" data-copythr="1">Copy review summary</button><span class="small muted" data-copied="${THR.id}"></span></div>
      </div>` : ""}
    </section>`);
}
function thrSummaryText() {
  const r = rv(THR.id);
  const done = thrItems.filter((t) => r.checked.includes(t.id)).map((t) => t.id);
  const not = thrItems.filter((t) => !r.checked.includes(t.id)).map((t) => t.id);
  return [
    `aoroot review: ${THR.label}, ${today()}`,
    `Thresholds checked against the papers: ${done.length} of ${thrItems.length}.`,
    not.length ? `Not checked: ${not.join(", ")}.` : "Not checked: none.",
    `Tests: ${thrTests.filter((t) => t.pass).length}/${thrTests.length} passing (arithmetic).`,
    `Comments: ${r.comments.trim() || "none"}`,
  ].join("\n");
}

// ── Review summary text ─────────────────────────────────────────────────────
function summaryText(ref) {
  const r = rv(ref.id), tr = testResults[ref.id];
  const checked = ref.models.filter((m) => r.checked.includes(m.id)).map((m) => m.id);
  const unchecked = ref.models.filter((m) => !r.checked.includes(m.id)).map((m) => m.id);
  const kinds = ["paper", "independent", "arithmetic"].map((k) => `${k} ${tr.filter((t) => t.kind === k).length}`).join(", ");
  return [
    `aoroot review: ${ref.label} (${ref.id}, entry ${ref.entryVersion}), ${today()}`,
    `Models checked against the paper: ${checked.length} of ${ref.models.length}.`,
    unchecked.length ? `Not checked: ${unchecked.join(", ")}.` : "Not checked: none.",
    `Tests: ${tr.filter((t) => t.pass).length}/${tr.length} passing (${kinds}).`,
    `Comments: ${r.comments.trim() || "none"}`,
  ].join("\n");
}

async function copy(text, statusEl) {
  try { await navigator.clipboard.writeText(text); statusEl.textContent = "Copied."; }
  catch { window.prompt("Copy this text:", text); }
  setTimeout(() => (statusEl.textContent = ""), 2500);
}

// ── Wire up ─────────────────────────────────────────────────────────────────
function wireSource() {
  // Raw registry file, fetched when opened (both pages).
  document.getElementById("refs").addEventListener("toggle", async (e) => {
    const pre = e.target.querySelector?.("pre[data-src]");
    if (!e.target.open || !pre || pre.dataset.loaded) return;
    try { pre.textContent = await (await fetch(`registry/${pre.dataset.src}.js`)).text(); pre.dataset.loaded = "1"; }
    catch { pre.textContent = "Could not load the file."; }
  }, true);
}

function wireReview() {
  const main = document.getElementById("refs");
  main.addEventListener("change", (e) => {
    const c = e.target;
    if (c.dataset.model) {
      const r = rv(c.dataset.ref);
      r.checked = c.checked ? [...new Set([...r.checked, c.dataset.model])] : r.checked.filter((x) => x !== c.dataset.model);
      c.closest("tr").classList.toggle("checked", c.checked);
      saveReview(); renderSummary();
    }
  });
  main.addEventListener("input", (e) => {
    if (e.target.dataset.comments) { rv(e.target.dataset.comments).comments = e.target.value; saveReview(); }
  });
  main.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.copythr) return copy(thrSummaryText(), main.querySelector(`[data-copied="${THR.id}"]`));
    const ref = registry.find((r) => r.id === (b.dataset.copy ?? b.dataset.checkall ?? b.dataset.clearall));
    if (b.dataset.copy) copy(summaryText(ref), main.querySelector(`[data-copied="${ref.id}"]`));
    if (b.dataset.checkall || b.dataset.clearall) {
      rv(ref.id).checked = b.dataset.checkall ? ref.models.map((m) => m.id) : [];
      saveReview(); renderSummary();
      for (const c of main.querySelectorAll(`input[data-ref="${ref.id}"]`)) { c.checked = !!b.dataset.checkall; c.closest("tr").classList.toggle("checked", c.checked); }
    }
  });
  document.getElementById("copyAll").onclick = () =>
    copy([...registry.map(summaryText), thrSummaryText()].join("\n\n"), document.getElementById("copiedAll"));
}

renderSummary();
renderRefs();
renderThresholdSection();
wireSource();
if (REVIEW) wireReview();
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
