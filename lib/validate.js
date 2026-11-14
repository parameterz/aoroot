// @ts-check
// Schema check for registry entries. No dependencies. Returns a list of
// problems; an empty list means the entry is usable.

import { VARIABLES } from "./covariates.js";
import { MEAN_TYPES, SD_TYPES, DISTS } from "./evaluator.js";
import { SITES, EDGES, PHASES, VIEWS } from "./conventions.js";

const UNITS = ["mm", "cm"];
const STATUS = ["ok", "caution", "suppressed"];
const VERIFY = ["draft", "reviewed", "verified"];
const TEST_KINDS = ["paper", "independent", "arithmetic"];
const WHEN_KEYS = ["sex", "age", "height_cm", "weight_kg", "bmi"]; // never race

export function validate(ref) {
  const err = [];
  const e = (msg) => err.push(`${ref.id ?? "?"}: ${msg}`);

  if (ref.schema !== 1) e(`schema must be 1 (got ${ref.schema})`);
  if (!/^[a-z]+\d{4}[a-z]?$/.test(ref.id ?? "")) e(`id "${ref.id}" should look like author2026`);
  if (!ref.citation?.doi) e("citation.doi missing");
  if (!VERIFY.includes(ref.verification?.status)) e(`verification.status must be one of ${VERIFY}`);
  if (!Array.isArray(ref.models) || !ref.models.length) e("no models");

  const ids = new Set();
  const noteIds = new Set((ref.notes ?? []).map((n) => n.id));

  for (const m of ref.models ?? []) {
    const p = (msg) => e(`model ${m.id}: ${msg}`);
    if (ids.has(m.id)) p("duplicate id");
    ids.add(m.id);
    if (!STATUS.includes(m.status)) p(`status must be one of ${STATUS}`);
    if (!SITES.includes(m.measurement?.site)) p(`measurement.site must be one of ${SITES}`);
    if (!UNITS.includes(m.measurement?.units)) p(`measurement.units must be one of ${UNITS}`);
    if (!EDGES.includes(m.measurement?.edge)) p(`measurement.edge must be one of ${EDGES}`);
    if (!PHASES.includes(m.measurement?.phase)) p(`measurement.phase must be one of ${PHASES}`);
    if (!VIEWS.includes(m.measurement?.view)) p(`measurement.view must be one of ${VIEWS}`);
    if (!MEAN_TYPES.includes(m.mean?.type)) p(`mean.type must be one of ${MEAN_TYPES}`);
    if (m.sd && !SD_TYPES.includes(m.sd.type)) p(`sd.type must be one of ${SD_TYPES}`);
    if (!DISTS.includes(m.dist ?? "normal")) p(`dist must be one of ${DISTS}`);
    if (m.dist === "boxcox" && !m.L) p("boxcox needs L");
    if (m.dist === "ratio" && (m.ratio?.mean == null || m.ratio?.sd == null)) p("ratio dist needs ratio: { mean, sd }");
    if (m.dist === "ratio" && m.sd) p("ratio dist takes its spread from `ratio`, so sd must be null");

    for (const t of [...(m.mean?.terms ?? []), ...(m.mean?.factors ?? [])])
      if (!VARIABLES.includes(t.var)) p(`unknown variable "${t.var}"`);
    if (m.mean?.var && !VARIABLES.includes(m.mean.var)) p(`unknown variable "${m.mean.var}"`);
    for (const k of Object.keys(m.when ?? {})) if (!WHEN_KEYS.includes(k)) p(`when.${k} not allowed`);
    for (const k of Object.keys(m.validity ?? {})) if (!VARIABLES.includes(k)) p(`validity.${k} unknown`);
    for (const v of m.sd?.variants ?? []) {
      if (!v.id || v.value == null) p("sd variant needs id and value");
      if (v.note && !noteIds.has(v.note)) p(`sd variant note "${v.note}" not found`);
    }
  }

  const groups = {};
  for (const m of ref.models ?? []) if (m.choice) (groups[m.choice.group] ??= []).push(m);
  for (const [g, ms] of Object.entries(groups)) {
    const defaults = ms.filter((m) => m.choice.default).length;
    if (defaults !== 1) e(`choice group "${g}" needs exactly one default (has ${defaults})`);
    if (ms.some((m) => !m.choice.label)) e(`choice group "${g}": every option needs a label`);
  }

  for (const n of ref.notes ?? []) {
    const a = n.appliesTo;
    if (a === "all") continue;
    if (a && typeof a === "object" && !Array.isArray(a)) {
      if (!ref.models.some((m) => new RegExp(a.match).test(m.id))) e(`note ${n.id}: pattern "${a.match}" matches no model`);
      continue;
    }
    for (const t of a ?? []) if (!ids.has(t)) e(`note ${n.id}: appliesTo unknown model "${t}"`);
  }

  for (const [i, t] of (ref.tests ?? []).entries()) {
    if (!TEST_KINDS.includes(t.kind)) e(`test ${i + 1}: kind must be one of ${TEST_KINDS}`);
    for (const k of Object.keys(t.expect ?? {}))
      if (k !== "covariates" && !ids.has(k)) e(`test ${i + 1}: expects unknown model "${k}"`);
  }
  return err;
}
