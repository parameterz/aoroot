// Details sheet: tapping a percent-of-predicted row opens that reference in a half-height,
// non-modal sheet at the bottom of the screen (its numbers, its curve with the patient,
// and a way into the full table). The chart stays visible and tappable above it, so
// tapping another row swaps the contents.
//
// The selection lives in the hash (sel=<site>.<refId>). Opening pushes one history
// entry, so the phone's Back button closes the sheet; swapping replaces it. Closing
// (✕, Esc, tapping the row again, swiping down, Back) never scrolls the page.

import { drawCurveCard } from "./cards.js";
import { SWEEP } from "./curve.js";
import { encodeHash } from "../lib/state.js";
import { SITE_NAMES, scalingOf, shortLabel, fmtZ, fmtPct, fmtLen, fmtObserved } from "../lib/describe.js";
import { notesFor } from "../lib/evaluator.js";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const ANIM_MS = 220;

let ctx, sheet, head, body;
let hideTimer = null;
let returnFocus = null;     // row to focus after closing, when focus was in the sheet
let inSheetEntry = false;   // the current history entry is the one we pushed on opening

const isOpen = () => sheet && !sheet.hidden && sheet.classList.contains("open");
const parseSel = (sel) => { const i = sel.indexOf("."); return { site: sel.slice(0, i), id: sel.slice(i + 1) }; };
const withSel = (st, sel) => ({ ...st, view: { ...st.view, sel } });

/**
 * ctx: { getState, setHashFromSheet(state, push), data, curveView, rerender }
 *   data[site][refId] = { ref, site, y, models: [{ model, r, flags }], curve, dim }  (built by render())
 */
export function initSheet(c) {
  ctx = c;
  sheet = document.getElementById("sheet");
  head = document.getElementById("sheetHead");
  body = document.getElementById("sheetBody");
  const main = document.getElementById("sites");

  // Rows (and reference names) in the percent-of-predicted charts.
  main.addEventListener("click", (e) => {
    const g = e.target.closest?.("svg.pct [data-ref]");
    if (!g || !g.dataset.ref || g.classList.contains("dim")) return;
    toggle(g.closest("svg").id.slice(4), g.dataset.ref, false);
  });
  main.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const g = e.target.closest?.("svg.pct .prow[role=button]");
    if (!g) return;
    e.preventDefault();
    toggle(g.closest("svg").id.slice(4), g.dataset.ref, true);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) { e.preventDefault(); close(); } });

  sheet.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) close();
    else if (e.target.closest("[data-full]")) fullDetails();
  });
  sheet.addEventListener("change", (e) => {
    if (e.target.name === "sheet_x") { ctx.curveView.xVar = e.target.value; ctx.rerender(); }
  });

  swipeToClose();
}

/**
 * Call first on every popstate/hashchange (results.js does). Leaving the entry pushed on
 * opening (Back, or close()) lands on an entry whose hash predates anything changed while
 * the sheet was open (units, filters, alternatives), so carry the current values over.
 */
export function beforeNav() {
  if (inSheetEntry && !history.state?.sheet) {
    const target = encodeHash(withSel(ctx.getState(), null));
    if (location.hash !== target) history.replaceState(null, "", target);
  }
  inSheetEntry = !!history.state?.sheet;
}

function toggle(site, id, fromKeyboard) {
  const st = ctx.getState();
  const key = `${site}.${id}`;
  if (st.view.sel === key) { close(); return; }
  const wasOpen = isOpen();
  const push = !history.state?.sheet;   // one entry per opening; swapping replaces it
  ctx.setHashFromSheet(withSel(st, key), push);
  if (push) inSheetEntry = true;
  renderSheet({ scroll: true, focus: fromKeyboard && !wasOpen });
}

function close() {
  const st = ctx.getState();
  if (!st.view.sel) return;
  if (sheet.contains(document.activeElement)) returnFocus = st.view.sel;
  if (history.state?.sheet) history.back();   // popstate → results.js → renderSheet()
  else { ctx.setHashFromSheet(withSel(st, null), false); renderSheet(); }
}

/** Close the sheet, then scroll to this reference in the comparison table and flash it. */
function fullDetails() {
  const sel = ctx.getState().view.sel;
  if (!sel) return;
  const { site, id } = parseSel(sel);
  returnFocus = null;
  close();
  const first = document.getElementById(`t_${site}_${id}`);
  if (!first) return;
  const rows = [first];
  for (let tr = first.nextElementSibling; tr && !tr.classList.contains("ref-start"); tr = tr.nextElementSibling) rows.push(tr);
  first.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
  for (const tr of rows) tr.classList.add("flash");
  setTimeout(() => rows.forEach((tr) => tr.classList.remove("flash")), 1800);
  const notes = first.querySelector("details.notes");
  if (notes) notes.open = true;
}

/** Show the selected reference (or hide the sheet). Called after every render(). */
export function renderSheet({ scroll = false, focus = false } = {}) {
  const st = ctx.getState();
  const sel = st.view.sel;
  for (const g of document.querySelectorAll("svg.pct .sel")) {
    g.classList.remove("sel");
    if (g.hasAttribute("aria-expanded")) g.setAttribute("aria-expanded", "false");
  }
  let d = null;
  if (sel) {
    const { site, id } = parseSel(sel);
    d = ctx.data[site]?.[id] ?? null;
    if (d?.dim) d = null;                                   // filtered out: close
    if (!d) ctx.setHashFromSheet(withSel(st, null), false); // stale or filtered selection: drop it from the link
  }
  if (!d) { hide(); return; }

  for (const g of document.querySelectorAll(`#pct_${d.site} [data-ref="${CSS.escape(d.ref.id)}"]`)) {
    g.classList.add("sel");
    if (g.hasAttribute("aria-expanded")) g.setAttribute("aria-expanded", "true");
  }
  const units = st.view.units;
  head.innerHTML = headHtml(d, units);
  body.innerHTML = bodyHtml(d, st);
  show();
  drawSheetCurve(d, st);
  document.body.style.paddingBottom = `${sheet.offsetHeight + 24}px`;
  if (scroll) keepRowVisible(d.site, d.ref.id);
  if (focus) document.getElementById("sheetTitle")?.focus({ preventScroll: true });
}

function headHtml(d, units) {
  const { ref, site, y } = d;
  const pop = ref.population ?? {};
  const ages = pop.age?.range;
  const cohort = [
    pop.n ? `n = ${pop.n.toLocaleString("en-US")}` : null,
    ages && ages[0] != null ? `ages ${ages[0]}${ages[1] != null ? `–${ages[1]}` : "+"}` : null,
  ].filter(Boolean).join(" · ");
  const cit = ref.citation ? `${ref.citation.authors.split(",")[0]} et al. ${ref.citation.journal} ${ref.citation.year}` : "";
  return `<div class="sheet-title">
      <h2 id="sheetTitle" tabindex="-1">${esc(ref.label)}</h2>
      <div class="small muted">${esc(SITE_NAMES[site])} ${fmtObserved(y, units)}${cohort ? ` · ${esc(cohort)}` : ""}</div>
      ${cit ? `<div class="small muted">${esc(cit)}</div>` : ""}
    </div>
    <button type="button" class="sheet-x" data-close aria-label="Close details">✕</button>`;
}

function bodyHtml(d, st) {
  const { ref, site, models, curve } = d;
  const units = st.view.units;
  const noteIds = new Set(models.flatMap(({ model }) => notesFor(ref, model).map((n) => n.id ?? n.text)));
  const rows = models.map(({ model, r, flags }) => {
    const range = r.lln == null ? "—" : `${fmtLen(r.lln, units).replace(/ (mm|cm)$/, "")}–${fmtLen(r.uln, units)}`;
    const hi = r.outside ? " hi" : "";
    return `<div class="sm-row">
        <div class="sm-name"><b>${esc(shortLabel(ref, model))}</b> <span class="model">${esc(scalingOf(model))}</span> ${flags}</div>
        <dl class="sm-nums">
          <div><dt>Predicted</dt><dd>${fmtLen(r.pred, units)}</dd></div>
          <div><dt>Normal</dt><dd>${range}</dd></div>
          <div><dt>z</dt><dd class="z${hi}">${fmtZ(r.z)}</dd></div>
          <div><dt>% pred</dt><dd class="${hi.trim()}">${fmtPct(r.pctPred)}</dd></div>
        </dl></div>`;
  }).join("");
  const xv = ctx.curveView.xVar;
  const curveHtml = curve && curve.pts.some(Boolean)
    ? `<div class="sm-curve-head"><span class="small muted">${esc(curve.sub)} model · solid: predicted · dashed: upper limit</span>
        <span class="seg small-seg"><label><input type="radio" name="sheet_x" value="height_cm" ${xv === "height_cm" ? "checked" : ""}> vs height</label>
        <label><input type="radio" name="sheet_x" value="age" ${xv === "age" ? "checked" : ""}> vs age</label></span></div>
       <svg class="curve sm-curve" id="sheetCurve" role="img" aria-label="${esc(ref.label)}: predicted diameter and upper limit of normal against ${xv === "age" ? "age" : "height"}, with this patient"></svg>`
    : "";
  const n = noteIds.size;
  return `${rows}${curveHtml}
    <div class="sm-links">
      <button type="button" class="linkbtn" data-full>Full details${n ? ` and ${n} “Why?” note${n > 1 ? "s" : ""}` : ""} ↓</button>
      <a href="references.html#${esc(ref.id)}">Equations and sources</a>
    </div>`;
}

function drawSheetCurve(d, st) {
  const svg = document.getElementById("sheetCurve");
  if (!svg) return;
  const p = st.patient, xv = ctx.curveView.xVar, units = st.view.units;
  const px = xv === "age" ? p.age : p.height_cm;
  const narrow = window.innerWidth < 600;
  drawCurveCard(svg, [{ ...d.curve, hidden: false }],
    { x: Math.min(Math.max(px, SWEEP[xv].min), SWEEP[xv].max), y: d.y, label: fmtObserved(d.y, units) },
    SWEEP[xv].label, (v) => (units === "cm" ? (v / 10).toFixed(1) : `${v}`), { height: narrow ? 190 : 230 });
}

function show() {
  clearTimeout(hideTimer);
  sheet.style.transform = "";
  if (sheet.hidden) {
    sheet.hidden = false;
    void sheet.offsetHeight;            // start from the closed position so it slides in
  }
  sheet.classList.add("open");
}

function hide() {
  if (sheet.hidden) return;
  sheet.classList.remove("open");
  document.body.style.paddingBottom = "";
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { sheet.hidden = true; sheet.style.transform = ""; }, reducedMotion() ? 0 : ANIM_MS);
  if (returnFocus) {
    const { site, id } = parseSel(returnFocus);
    document.querySelector(`#pct_${site} .prow[role=button][data-ref="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
    returnFocus = null;
  }
}

/** Nudge the page so the selected rows aren't under the sheet or the sticky summary. */
function keepRowVisible(site, id) {
  const gs = [...document.querySelectorAll(`#pct_${site} .sel`)];
  if (!gs.length) return;
  const rects = gs.map((g) => g.getBoundingClientRect());
  const top = Math.min(...rects.map((r) => r.top)), bottom = Math.max(...rects.map((r) => r.bottom));
  const minTop = (document.getElementById("summary")?.getBoundingClientRect().bottom ?? 0) + 8;
  const maxBottom = window.innerHeight - sheet.offsetHeight - 12;
  let dy = 0;
  if (bottom > maxBottom) dy = bottom - maxBottom;
  if (top - dy < minTop) dy = top - minTop;
  if (Math.abs(dy) > 1) window.scrollBy({ top: dy, behavior: reducedMotion() ? "auto" : "smooth" });
}

/** Drag the handle or header down to close; a short drag springs back. */
function swipeToClose() {
  let startY = null, dy = 0, id = null;
  sheet.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".sheet-grab, .sheet-head") || e.target.closest("button, a, input, label")) return;
    startY = e.clientY; dy = 0; id = e.pointerId;
    sheet.setPointerCapture(id);
    sheet.classList.add("dragging");
  });
  sheet.addEventListener("pointermove", (e) => {
    if (startY == null || e.pointerId !== id) return;
    dy = Math.max(0, e.clientY - startY);
    sheet.style.transform = `translateY(${dy}px)`;
  });
  const end = (e) => {
    if (startY == null || e.pointerId !== id) return;
    startY = null;
    sheet.classList.remove("dragging");
    if (dy > 70) { sheet.style.transform = "translateY(100%)"; close(); }
    else sheet.style.transform = "";
  };
  sheet.addEventListener("pointerup", end);
  sheet.addEventListener("pointercancel", end);
}
