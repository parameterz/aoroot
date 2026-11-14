// Sketched result cards (rough.js). Numbers are never carried by the sketch alone:
// every value drawn here is also in the table above it.
// Fixed seeds per row, so redraws (unit switch, what-if) don't make the lines wobble.

import rough from "../vendor/rough.esm.js";

const SVGNS = "http://www.w3.org/2000/svg";

function el(tag, attrs = {}, text) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
}

/** Wrap a rough.js node in a <g class=…> so it takes its colour from the theme (currentColor). */
function put(svg, cls, node) {
  const g = el("g", { class: cls });
  g.appendChild(node);
  svg.appendChild(g);
  return g;
}

/** Round the axis out to tidy steps. */
function niceDomain(values, minSpan) {
  let lo = Math.min(100 - minSpan / 2, ...values);
  let hi = Math.max(100 + minSpan / 2, ...values);
  const step = hi - lo > 80 ? 20 : 10;
  lo = Math.floor((lo - 2) / step) * step;
  hi = Math.ceil((hi + 2) / step) * step;
  return { lo, hi, step };
}

/**
 * Percent-of-predicted card: one row per model, shared axis.
 * rows: [{ label, sub, pct, lo, hi, outside }]   (lo/hi = normal range as % of predicted; null = mean-only)
 */
export function drawPctCard(svg, rows) {
  // Draw at the element's real width so text stays a fixed size; narrow screens put
  // each label above its line instead of to the left.
  const W = Math.max(320, Math.round(svg.getBoundingClientRect().width) || 760);
  const narrow = W < 600;
  const rowH = narrow ? 44 : 34, top = narrow ? 6 : 10, labelW = narrow ? 12 : 300, padR = narrow ? 16 : 28;
  const axisGap = 10, axisH = 36;
  const plotBottom = top + rows.length * rowH;
  const H = plotBottom + axisGap + axisH;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.replaceChildren();

  const vals = rows.flatMap((r) => [r.lo, r.hi, r.pct]).filter((v) => v != null);
  const { lo, hi, step } = niceDomain(vals, 30);
  const X = (v) => labelW + ((v - lo) / (hi - lo)) * (W - labelW - padR);
  const R = rough.svg(svg);

  // 100% of predicted: a dashed guide through every row (per row on narrow screens,
  // where the labels sit above the lines).
  if (!narrow)
    put(svg, "g-rule", R.line(X(100), top - 4, X(100), plotBottom + 2,
      { stroke: "currentColor", strokeWidth: 0.9, roughness: 0.5, strokeLineDash: [5, 5], seed: 3 }));

  rows.forEach((r, i) => {
    const cy = top + i * rowH + (narrow ? 30 : rowH / 2);
    const seed = 17 + i * 13;
    if (narrow) {
      const t = el("text", { x: labelW, y: cy - 14, class: "lbl" }, r.label);
      if (r.sub) t.appendChild(el("tspan", { class: "sub", dx: 6 }, r.sub));
      svg.appendChild(t);
    } else {
      svg.appendChild(el("text", { x: labelW - 14, y: cy - 1, "text-anchor": "end", class: "lbl" }, r.label));
      if (r.sub) svg.appendChild(el("text", { x: labelW - 14, y: cy + 12, "text-anchor": "end", class: "lbl sub" }, r.sub));
    }

    // Normal range: hatched band.
    if (r.lo != null && r.hi != null) {
      put(svg, "g-band", R.rectangle(X(r.lo), cy - 8, X(r.hi) - X(r.lo), 16,
        { stroke: "none", fill: "currentColor", fillStyle: "hachure", hachureGap: 3.5, fillWeight: 1.1, hachureAngle: -41, roughness: 1.3, seed }));
      for (const v of [r.lo, r.hi])
        put(svg, "g-rule", R.line(X(v), cy - 9, X(v), cy + 9, { stroke: "currentColor", strokeWidth: 1.1, roughness: 0.6, seed: seed + 2 }));
    } else {
      svg.appendChild(el("text", { x: X(hi) - 2, y: cy + 4, "text-anchor": "end", class: "note" }, "no published range"));
    }
    if (narrow)
      put(svg, "g-rule", R.line(X(100), cy - 11, X(100), cy + 11,
        { stroke: "currentColor", strokeWidth: 0.9, roughness: 0.4, strokeLineDash: [4, 4], seed: seed + 9 }));
    // Baseline.
    put(svg, "g-rule", R.line(X(lo), cy, X(hi), cy, { stroke: "currentColor", strokeWidth: 0.7, roughness: 0.8, bowing: 1, seed: seed + 1 }));
    // Patient.
    if (r.pct != null) {
      const g = put(svg, "g-dot" + (r.outside ? " out" : ""), R.circle(X(Math.min(Math.max(r.pct, lo), hi)), cy, 12,
        { stroke: "currentColor", strokeWidth: 1.4, fill: "currentColor", fillStyle: "solid", roughness: 1.1, seed: seed + 5 }));
      g.appendChild(el("title", {}, `${r.label}: ${Math.round(r.pct)}% of predicted`));
    }
  });

  // Axis.
  const ay = plotBottom + axisGap;
  put(svg, "g-rule", R.line(X(lo), ay, X(hi), ay, { stroke: "currentColor", strokeWidth: 1, roughness: 0.7, bowing: 1.2, seed: 5 }));
  const tickStep = narrow && (hi - lo) / step > 6 ? step * 2 : step;
  for (let v = lo; v <= hi + 1e-9; v += tickStep) {
    put(svg, "g-rule", R.line(X(v), ay - (v === 100 ? 6 : 4), X(v), ay + (v === 100 ? 6 : 4),
      { stroke: "currentColor", strokeWidth: v === 100 ? 1.3 : 0.9, roughness: 0.6, seed: 40 + v }));
    svg.appendChild(el("text", { x: X(v), y: ay + 22, "text-anchor": "middle", class: "tick" + (v === 100 ? " hundred" : "") }, `${v}%`));
  }
}

/** Small legend swatches (hatched band, dot) drawn with the same strokes. */
export function drawLegend(container) {
  const mk = (cls, fn) => {
    const s = el("svg", { viewBox: "0 0 26 16", width: 26, height: 16, "aria-hidden": "true" });
    put(s, cls, fn(rough.svg(s)));
    return s;
  };
  container.querySelector("[data-lg=band]")?.replaceChildren(mk("g-band", (rc) =>
    rc.rectangle(2, 2, 22, 12, { stroke: "none", fill: "currentColor", fillStyle: "hachure", hachureGap: 3, hachureAngle: -41, seed: 9 })));
  container.querySelector("[data-lg=dot]")?.replaceChildren(mk("g-dot", (rc) =>
    rc.circle(13, 8, 11, { stroke: "currentColor", fill: "currentColor", fillStyle: "solid", roughness: 1.1, seed: 7 })));
  container.querySelector("[data-lg=out]")?.replaceChildren(mk("g-dot out", (rc) =>
    rc.circle(13, 8, 11, { stroke: "currentColor", fill: "currentColor", fillStyle: "solid", roughness: 1.1, seed: 8 })));
}

/** Split a series into runs of consecutive points with the same `extrap` flag (null = gap). */
function runs(pts, key) {
  const out = [];
  let cur = null;
  for (const p of pts) {
    if (!p || p[key] == null) { cur = null; continue; }
    if (!cur || cur.extrap !== p.extrap) {
      const prev = cur?.pts.at(-1);
      cur = { extrap: p.extrap, pts: prev ? [prev] : [] };   // join runs without a gap
      out.push(cur);
    }
    cur.pts.push(p);
  }
  return out;
}

/**
 * Patient-on-the-curve card.
 * series: [{ label, colorIndex, hidden, pts: [{ x, pred, uln, extrap } | null] }]
 * patient: { x, y }   (y in mm)   xLabel: axis title
 */
export function drawCurveCard(svg, series, patient, xLabel, fmtY = (v) => `${v}`) {
  const W = Math.max(320, Math.round(svg.getBoundingClientRect().width) || 760);
  const narrow = W < 600;
  const H = narrow ? 300 : 380;
  const m = { l: narrow ? 40 : 56, r: 16, t: 14, b: 46 };
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.replaceChildren();
  const R = rough.svg(svg);

  const shown = series.filter((s) => !s.hidden);
  const xs = series.flatMap((s) => s.pts.filter(Boolean).map((p) => p.x));
  if (!shown.length) { svg.appendChild(el("text", { x: W / 2, y: H / 2, "text-anchor": "middle", class: "note" }, "all references hidden: tap one below")); return; }
  const ys = shown.flatMap((s) => s.pts.filter(Boolean).flatMap((p) => [p.pred, p.uln].filter((v) => v != null)));
  ys.push(patient.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const yStep = 5;
  const y0 = Math.floor((Math.min(...ys) - 1) / yStep) * yStep, y1 = Math.ceil((Math.max(...ys) + 1) / yStep) * yStep;
  const X = (v) => m.l + ((v - x0) / (x1 - x0)) * (W - m.l - m.r);
  const Y = (v) => H - m.b - ((v - y0) / (y1 - y0)) * (H - m.t - m.b);

  // Axes and light grid.
  const xStep = x1 - x0 > 50 ? 10 : 5;
  for (let v = Math.ceil(y0 / yStep) * yStep; v <= y1; v += yStep) {
    svg.appendChild(el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), class: "grid" }));
    svg.appendChild(el("text", { x: m.l - 8, y: Y(v) + 5, "text-anchor": "end", class: "tick" }, fmtY(v)));
  }
  for (let v = Math.ceil(x0 / xStep) * xStep; v <= x1; v += xStep * (narrow ? 2 : 1))
    svg.appendChild(el("text", { x: X(v), y: H - m.b + 20, "text-anchor": "middle", class: "tick" }, `${v}`));
  put(svg, "g-rule", R.line(m.l, H - m.b, W - m.r, H - m.b, { stroke: "currentColor", strokeWidth: 1, roughness: 0.6, seed: 2 }));
  put(svg, "g-rule", R.line(m.l, m.t, m.l, H - m.b, { stroke: "currentColor", strokeWidth: 1, roughness: 0.6, seed: 4 }));
  svg.appendChild(el("text", { x: (m.l + W - m.r) / 2, y: H - 6, "text-anchor": "middle", class: "axis" }, xLabel));

  // Patient's x: faint vertical guide.
  svg.appendChild(el("line", { x1: X(patient.x), x2: X(patient.x), y1: m.t, y2: H - m.b, class: "guide" }));

  // Series: predicted (solid) and upper limit (dashed); faded outside the study range.
  shown.forEach((s, i) => {
    const seed = 101 + s.colorIndex * 31;
    for (const key of ["pred", "uln"]) {
      for (const run of runs(s.pts, key)) {
        if (run.pts.length < 2) continue;
        const cls = `g-c${s.colorIndex}` + (run.extrap ? " extrap" : "");
        const pts = run.pts.map((p) => [X(p.x), Y(p[key])]);
        let g;
        if (key === "pred") {
          g = put(svg, cls, R.linearPath(pts, { stroke: "currentColor", strokeWidth: 2, roughness: 0.55, bowing: 0.6, seed }));
        } else {
          // Upper limit: one continuous dashed path (rough.js restarts dashes on every segment).
          g = el("g", { class: cls });
          g.appendChild(el("path", { d: "M" + pts.map((q) => q.map((v) => v.toFixed(1)).join(",")).join("L"), class: "uln" }));
          svg.appendChild(g);
        }
        g.appendChild(el("title", {}, `${s.label}: ${key === "pred" ? "predicted" : "upper limit of normal"}`));
      }
    }
  });

  // Patient dot + label.
  put(svg, "g-dot", R.circle(X(patient.x), Y(patient.y), 13, { stroke: "currentColor", strokeWidth: 1.4, fill: "currentColor", fillStyle: "solid", roughness: 1.1, seed: 9 }));
  const right = X(patient.x) < W - 120;
  svg.appendChild(el("text", { x: X(patient.x) + (right ? 12 : -12), y: Y(patient.y) - 10, "text-anchor": right ? "start" : "end", class: "pt" }, patient.label));
}
