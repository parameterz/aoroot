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
