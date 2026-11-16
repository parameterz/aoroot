// Input form: fill from the hash (when coming back via "Edit"), check entries,
// and send the user to results.html#… . All values stored metric (mm, cm, kg).

import { SITES } from "../lib/conventions.js";
import { SITE_NAMES } from "../lib/describe.js";
import { covariates } from "../lib/covariates.js";
import { bmiNote } from "../lib/body.js";
import {
  decodeHash, encodeHash, defaultState, isComplete, checkMeasurement,
  CONV_CODES, DEFAULT_CONV, IN_TO_CM, LB_TO_KG, toMm, fromMm,
} from "../lib/state.js";

const form = document.getElementById("form");
const meas = document.getElementById("meas");
const go = document.getElementById("go");

const CONV_LABEL = {
  "ll-ed": "Leading edge · end-diastole",
  "ll-ms": "Leading edge · mid-systole",
  "ii-ed": "Inner edge · end-diastole",
  "ii-ms": "Inner edge · mid-systole",
};

// One state object; every control writes into it, then render() updates the page.
let state = location.hash.length > 1 ? decodeHash(location.hash).state : defaultState();

// ── Build the measurement rows ───────────────────────────────────────────────
for (const site of SITES) {
  const opts = CONV_CODES.map((c) =>
    `<option value="${c}">${CONV_LABEL[c]}${c === DEFAULT_CONV[site] ? " (ASE)" : ""}</option>`).join("");
  meas.insertAdjacentHTML("beforeend", `
    <span class="name">${SITE_NAMES[site]}</span>
    <input type="number" name="y_${site}" step="0.1" min="0" inputmode="decimal" aria-label="${SITE_NAMES[site]}">
    <select name="c_${site}" aria-label="${SITE_NAMES[site]} measurement convention">${opts}</select>
    <div class="msg" id="msg_${site}" aria-live="polite"></div>`);
}

const $ = (name) => form.elements.namedItem(name);
const num = (el) => (el.value.trim() === "" ? null : Number(el.value));
const round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;

// ── State → controls (on load, and after switching units) ───────────────────
function fill() {
  const { patient: p, y, conv, view } = state;
  for (const r of form.querySelectorAll('[name=sex]')) r.checked = r.value === p.sex;
  $("age").value = p.age ?? "";
  const us = view.body === "us";
  $("ht").value = p.height_cm == null ? "" : round(us ? p.height_cm / IN_TO_CM : p.height_cm);
  $("wt").value = p.weight_kg == null ? "" : round(us ? p.weight_kg / LB_TO_KG : p.weight_kg);
  for (const r of form.querySelectorAll('[name=body]')) r.checked = r.value === view.body;
  for (const r of form.querySelectorAll('[name=units]')) r.checked = r.value === view.units;
  for (const site of SITES) {
    $(`y_${site}`).value = y[site] == null ? "" : round(fromMm(y[site], view.units), view.units === "cm" ? 2 : 1);
    $(`c_${site}`).value = conv[site];
  }
  document.querySelector('[data-u=ht]').textContent = us ? "in" : "cm";
  document.querySelector('[data-u=wt]').textContent = us ? "lb" : "kg";
  render();
}

// ── Controls → state ─────────────────────────────────────────────────────────
function read() {
  const us = state.view.body === "us";
  const sex = form.querySelector('[name=sex]:checked');
  state.patient.sex = sex ? sex.value : null;
  state.patient.age = num($("age"));
  const ht = num($("ht")), wt = num($("wt"));
  state.patient.height_cm = ht == null ? null : us ? ht * IN_TO_CM : ht;
  state.patient.weight_kg = wt == null ? null : us ? wt * LB_TO_KG : wt;
  for (const site of SITES) {
    const v = num($(`y_${site}`));
    state.y[site] = v == null ? null : toMm(v, state.view.units);
    state.conv[site] = $(`c_${site}`).value;
  }
}

function render() {
  renderBody();
  for (const site of SITES) {
    const v = num($(`y_${site}`));
    const box = document.getElementById(`msg_${site}`);
    const chk = checkMeasurement(site, v, state.view.units);
    box.className = "msg" + (chk.level === "ok" ? "" : " warn");
    box.textContent = chk.message ?? "";
    if (chk.level === "cm?") {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = `Use ${chk.suggestion} mm`;
      b.onclick = () => { $(`y_${site}`).value = chk.suggestion; read(); render(); };
      box.append(b);
    }
  }
  go.disabled = !isComplete(state);
}

// BSA and BMI as the user types: confirms the entry (an lb value with kg selected shows
// up as an impossible BMI) and shows body build before the results.
function renderBody() {
  const p = state.patient, box = document.getElementById("body");
  box.className = "small muted";
  if (!(p.height_cm > 0)) { box.textContent = "Without weight, references based on BSA or weight are skipped."; return; }
  if (!(p.weight_kg > 0)) { box.textContent = "No weight: references based on BSA or weight are skipped."; return; }
  const c = covariates(p);
  const note = bmiNote(c.bmi);
  box.textContent = `BSA ${c.bsa_dubois.toFixed(2)} m² (DuBois) · BMI ${c.bmi.toFixed(1)}${note.label ? ` (${note.label})` : ""}`;
  if (note.implausible) { box.className = "small warn"; box.textContent += ". Unusual: check the height and weight units."; }
}

form.addEventListener("input", (e) => {
  const name = e.target.name;
  if (name === "body" || name === "units") {
    read();                                   // keep values in the old units…
    state.view[name] = e.target.value;        // …then switch and redisplay
    fill();
    return;
  }
  read();
  render();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  read();
  if (!isComplete(state)) return;
  location.href = "results.html" + encodeHash(state);
});

document.getElementById("reset").onclick = () => {
  state = defaultState();
  history.replaceState(null, "", location.pathname);
  fill();
};

fill();
