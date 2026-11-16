# aoroot: design notes

How the aoroot.parameterz.com site is built and why. This is the record of the
decisions behind the code: read it before adding a reference or changing the
math. Per-reference change history lives in each registry entry's `changelog`.

## Purpose and scope

- **Adult aortic root reference values, side by side.** Every reference scores
  the same measurement, so the differences between them are visible. Older
  guideline values (ASE/EACVI 2015) sit next to height-based and multivariable
  references so the comparison makes the case for moving past them.
- **Adults only.** Pediatric tools are well served elsewhere.
- **Static site on GitHub Pages:** plain HTML and vanilla JS, no framework, no
  build step, no dependencies. The goal is no tech stack to migrate ever again.
- **Domain:** `aoroot.parameterz.com`, pointed at GitHub Pages. The old App
  Engine site had no meaningful inbound links, so there are no redirects.
  `404.html` (root-absolute paths, so it only styles correctly on the custom
  domain) catches everything else and sends any `/devereux...` URL to the
  `devereux/` stub, which points to the calculator and the Devereux entry.
- **Credit:** author name linked to LinkedIn on the page, plus a citation for
  every reference.

## Architecture: registry + evaluator

Goal: a pattern that can be understood quickly after six months away and
extended by adding a reference without touching the math.

### File layout

```
registry/index.js        list of entries (browsers can't list a folder)
registry/_template.js    blank, commented template for new references
registry/<author><year>.js  one file per reference
lib/covariates.js        the only variables references may use; BSA formulas; units
lib/evaluator.js         all the math: score(), impliedExponent(), notesFor()
lib/conventions.js       measurement conventions; ASE_DEFAULT; modelsForSite()
lib/thresholds.js        Desai / guideline risk thresholds; Tavolinejad CMR context
lib/validate.js          schema check, no dependencies
lib/state.js             URL hash state
lib/describe.js          equation and model wording for display
js/                      page code (cards.js, curve.js, references.js, ...)
css/site.css             hand-written CSS, @font-face
fonts/                   self-hosted woff2 + SIL OFL licenses
index.html               input form
results.html             comparison tables and cards
references.html          references page for visitors (equations, sources, notes, tests)
review.html              curator review page: same content plus ticks, comments,
                         copy-summary; unlinked, noindex (js/references.js, data-mode)
about.html               about, reference policy, how to cite (version from lib/version.js)
og.png                   1200×630 link-preview image; source docs/og-card.html
tests/cases.js           shared test logic
tests/run.js             node tests/run.js (exit code 1 on failure)
tests.html               same tests in the browser
package.json             { "type": "module" } only
```

Possible later: `lib/schema.js` JSDoc typedefs for editor autocomplete; a
GitHub Action running `node tests/run.js` on push.

### Registry rules (also at the top of `_template.js`)

1. **Data only**, written as `export default { ... }`. No functions.
2. **Transcribe as published.** Never silently fix a number; suspected
   corrections go in `sd.variants` with a note.
3. **Every number gets a `source`** (table, page or figure).
4. **Only `[EVAL]` fields drive the math.** Everything else is documentation
   (references page, "Why?" notes, report text).
5. **Half-open intervals** `[min, max)` for strata guards and severity bands.
   Validity ranges are observed min/max and are inclusive.
6. **IDs are permanent** (they appear in shared links and report text). Retire
   a model with `status: "suppressed"`; never rename it. Models in an
   unreviewed draft may still be removed.
7. **No range, no model.** A model is used only if the paper gives a spread: an
   SD/SEE, a CV, or a published limit (ULN or percentile) from which the SD can
   be backed out with `fromLimits`. The last only when a normal distribution
   looks reasonable (e.g. mean ≈ median, derived and printed SDs agree within
   rounding), with the check written in a note. Mean-only equations are left
   out of new entries and suppressed in reviewed ones. **Enforced by the
   validator** (a shown model without `sd` fails, except `dist: "ratio"`).
   Reason: a z-score or ULN is the clinical product; % predicted without a
   range invites misreading, and there are enough references with ranges.
8. `schema: 1`, plus `entryVersion` and `changelog` on every entry.

### A model is three pieces

| Piece | Types |
|---|---|
| `mean` (predicted **median**, published units) | `constant`, `linear` (term transforms `ln`/`log10`/`sqrt`/`inv`/`{pow}`/`{per}`, optional `outcome: "ln"`), `power` (a × x^exp × base^sex), `table` (interpolated) |
| `sd` (required by rule 7) | `constant`, `cv`, `linear`, `table`, `fromLimits` (z 1.96 for a 97.5th percentile, 1.645 for a 95th, 2 for mean + 2 SD), plus `variants` |
| `dist` | `normal`, `lognormal`, `lognormal10` (SEE on the log10 scale), `boxcox` (LMS, needs `L`), `ratio` (OMAM corrected value: `sd: null`, `ratio: { mean, sd }` of observed/predicted) |

- **Stratified references** are several models with `when` guards, e.g.
  `when: { sex: "female", age: [18, 41] }`. Guards may use only sex, age and
  body size.
- **Shared variables** (`lib/covariates.js`): `age, sex, height_cm, height_m,
  weight_kg, bmi, bsa_dubois, bsa_mosteller, bsa_haycock, bsa_gehan`. Each BSA
  formula is its own variable, so there is no reference-level BSA field.
  **DuBois is the adult default** (Haycock is the pediatric convention).
- **Sex-keyed numbers:** any number in a model may be `{ male, female }`.
  Ratio references are `linear` with no intercept, e.g.
  `coef: { male: 19.0, female: 18.1 }` on `height_m`, SD scaled the same way.
- **`fromLimits` with a ratio model:** the ULN, like the mean, has no intercept
  (a missing intercept is 0), so SD scales with body size. E.g. Muraru men
  SoV/height: mean 19·h, ULN 24·h, SD = 5/1.645·h = 3.04·h mm.
- **Alternatives** use a shared `choice: { group, label, default }` field
  (e.g. Yao population; Campens DuBois vs Haycock).
- **Notes for groups of models:** `appliesTo: { match: "<regex on model id>" }`,
  resolved by `notesFor(ref, model)`.
- **Model `status`:** `ok` | `caution` (shown with a warning) | `suppressed`
  (hidden).
- **Verification status:** `draft` | `reviewed` | `verified`. Drafts are
  labelled in the UI.
- Measurement `edge`, `phase` and `view` are enums enforced by the validator;
  the paper's own wording goes in `edgeNote` / `phaseNote` / `viewNote`.

### Evaluator output

`score(ref, model, input, y_mm, { ulnZ, sdVariant })` returns `pred`, `uln`,
`lln` (mm), `z`, `pctPred`, `ulnPct`, `llnPct`,
`published: { pred, sd, units }`, `extrapolated: [...]`, and `flags`
(`caution`, `draft`, `extrapolated`). A missing input (e.g. no weight for a BSA
model) returns `{ missing: "bsa_dubois" }` instead of a number.

- **Percent predicted is universal:** observed ÷ predicted median, for every
  model. Precedent: the ASE/EACVI 2015 "aortic root index" and Yao's corrected
  value Yc.
- **ULN and LLN as percent of predicted** let every reference share one axis.
- `impliedExponent(ref, model, input, "height_cm")`: d ln(pred) / d ln(height)
  by central difference; works for every model type. Changing height also
  changes BSA, so it is the total effect. Devereux at 40 M, 175 cm, 70 kg:
  height model 0.51, BSA model 0.18.

### Tests

Three kinds, in order of value:

- `paper`: values printed in the paper (the only kind that checks the
  transcription itself).
- `independent`: output of another implementation (old aoroot site, Marfan
  Foundation calculator, authors' code).
- `arithmetic`: hand calculations from the paper's equations; they also guard
  against later edits to the file.

Tests may set `sdVariant`, `ulnZ` and `tol`, and may expect `uln`. The runner
was checked to fail on a deliberate coefficient typo.

### Race and ethnicity

- **Never a patient input.** Not on the form, not a shared variable, not
  allowed in `when` guards, not in shared links.
- When a paper publishes separate equations per population (Yao 2026: Chinese,
  Italian, combined), each is its own model with a population descriptor, and
  the user picks among them as a **view option**. Combined is the default.
- Each reference's `population.composition` uses the paper's own labels
  verbatim; don't harmonize ("Asian" in WASE is not "Chinese Han" in Yao).

## Adding a reference

1. Copy `registry/_template.js`, transcribe from the paper, cite a `source` for
   every number. Start at `verification.status: "draft"`.
2. Check rule 7 before transcribing a model. Write any normality check for
   `fromLimits` in a note.
3. Add tests: `paper` values wherever the paper prints any, then `independent`
   and `arithmetic`.
4. Add the file to `registry/index.js`; run `node tests/run.js`.
5. Review on `review.html` (not linked from the site): tick each model checked against the paper, add
   comments, "Copy review summary". Then set `verification.status: "reviewed"`,
   `reviewedBy`, date, a changelog line and a minor version bump.

**Inclusion criteria.** There is no accepted minimum N for reference studies
(CLSI EP28 suggests ≥ 120 per partition for nonparametric percentiles). What
matters more: a truly normal population, a stated measurement convention, a
reproducible model with a spread (rule 7), and the covariate range. Small but
clean papers (Muraru, n = 218) are worth including; between-reference
differences outweigh sampling error.

**No absolute values.** Sex-only absolute models (no body size, no age) are not
shown. Where a paper's only printed z-scores are on absolute models (MATEAR),
they are transcribed, suppressed, and used as `paper` tests.

## Pages

### Input (`index.html`)

- Age (exact years), sex, height, weight (optional), and measurements at the
  annulus, sinuses (SoV), STJ and ascending aorta (AAo).
- **Measurement convention, one per site, up front:** edge (leading / inner)
  and phase (end-diastole / mid-systole). **Defaults = ASE/EACVI 2015: annulus
  inner edge (hinge points) mid-systole; SoV, STJ and AAo leading edge
  end-diastole.** Each reference is scored only with models matching the
  site's convention; a reference with no match is greyed out ("not available
  for inner edge"). A convention chip beside each field (e.g.
  `I–I · mid-systole`); codes appear in the link only when they differ from
  the default (e.g. `ann_c=ii-ms`).
- **Units:** measurements in mm by default, with a mm/cm switch. Height in cm
  and weight in kg, with an in/lb switch that converts on entry. Internally and
  in the URL everything is mm, cm (height) and kg; each entry's published units
  are converted inside the evaluator. In mm mode a value under 10 prompts "this
  looks like cm, switch units?"; implausible values get a soft warning.

### Results (`results.html`)

- Reads inputs from the URL **hash** (`#age=...&ht=...`), so values never reach
  a server. Links are bookmarkable and shareable, with an "Edit" link back to
  the pre-filled form. View options (references, population and SD variants)
  also live in the hash, so a shared link reproduces what was on screen.
- No identifiers in the form. One-line note: "links contain the values you
  entered."
- **The per-site comparison table is the full record** (the charts lead; see
  "Results layout (planned)" below). No headline card and no default
  reference: every reference is shown as an equal, with alternatives and SD
  variants as menus, "Why?" notes, and Copy for report by ticking rows.
- **Not wanted:** a per-site summary line ("6 references: z from … to …") —
  the cards already tell that story; and no pooled or meta-analytic estimate,
  because between-reference differences (population, measurement, model form)
  dwarf sampling error, and pooling would blur known biases.

### References and verification (`references.html`)

Generated from the registry, so it can't drift: summary (tests by kind, status,
review progress); per reference the citation, population, every model's
equation written out (per sex where sex-keyed), SD method, convention,
validity, sources and notes; the raw registry file; tests run live with
expected vs calculated. A "Thresholds and context" section covers
`lib/thresholds.js` with its own tests and review ticks.

### State pattern

One state object (entered patient, what-if values, display options) and one
`render()` function. Every control updates the state, then calls `render()`.
With about a dozen values, redrawing everything is instant.

### Look

Hand-written CSS, no framework, in the parameterz/OMAM-Aortic-Root style:
drawing-paper palette, cobalt accent, Newsreader / IBM Plex / Caveat. Charts
sketched with **rough.js** (vendored, MIT) using fixed seeds; numbers are never
carried by the sketch alone. **Fonts self-hosted:** 9 latin woff2 files
(Fontsource v5.3.0, SIL OFL licenses alongside); nothing fetched from outside.

## Result cards

**Built:**

1. **% predicted** (`drawPctCard`): one sketched row per model on a shared axis,
   band from LLN% to ULN% with the patient's dot. Constant-SD references give
   bands that narrow as predicted size grows; constant-CV references give a
   fixed band. Rows chronological and grouped by reference; labels show
   author/year plus normalization components (age / height / weight / BSA,
   ratio vs equation).
2. **Patient on the curve** (`js/curve.js`, `drawCurveCard`): predicted vs
   height (140–205 cm) or age (18–85 y), everything else held fixed; one model
   per reference, height-based where available; dashed ULN; faded outside
   validity; legend chips hide/show.
3. **Risk thresholds** (`lib/thresholds.js`, `drawThresholdCard`; SoV and AAo).
   Each threshold shown as a diameter at this patient's height (reached / mm
   below), plus a chart vs height with the references' ULN band. Includes the
   Tavolinejad CMR context on the AAo card (see below).

**Wish list:**

- Collapse cards per site (table always visible). The curve card collapses
  by default under the planned results layout.
- Implied exponent as a line under each model, next to the exponents AHI (1.0)
  and CSAH (0.5) assume.
- What-if exploration (below), lighter version as buttons on the curve card.
- Teaching pearls (below).
- **Source counts in the convention menus**, e.g. "L–L · end-diastole
  (6 sources)": computed from the registry at page load, counting references
  not models (Yao's three populations count once), excluding suppressed
  models. Options with 0 sources shown disabled.
- Serial studies (parked, below).

### Results layout (built Nov 2026, branch `results-layout`)

In use, the charts get read far more than the numbers, and on a phone the %
predicted chart sits a long scroll down. Principle: **overview first, then
details on demand.**

**Order within each site:**

1. **% predicted** first: the across-reference overview, and the place to
   choose a reference.
2. **Patient on the curve**, **collapsed by default** ("Compare curves").
   Keeps its legend chips and the height / age axis switch; opening it is an
   opt-in to the overlay.
3. **Risk thresholds**, with the chart moved to the top of the card.
4. **Comparison table** last: still the full record, with the equations and
   the "Why?" notes.

**Compact sticky input summary.** One line (e.g. `39 mm · 52 F · 165 cm ·
70 kg`) stays at the top while scrolling; tapping it goes to Edit.

**Bottom sheet for one reference** (`js/sheet.js`; same sheet on wide screens, centred, max 760 px wide and a little shorter):

- Tapping a % predicted row (the whole row band, label and bar, ≥ 44 px
  tall) opens a half-height sheet: reference name, normalization, cohort
  (n, ages), predicted value, % predicted, z, limits, **that reference's curve
  with the patient's dot**, a "has notes" marker when a "Why?" note exists,
  and a **Full details** link.
- Putting the curve in the sheet solves discoverability: a tap never drives a
  chart that is off screen, and only one curve shows at a time (no
  spaghetti).
- **Non-modal:** the chart stays visible and tappable above the sheet;
  tapping another row swaps the contents, so references can be flipped
  through quickly. The selected row stays highlighted.
- **Dismiss:** swipe down on the handle, ✕, tap the selected row again, Esc,
  or the phone's Back button. The page underneath never scrolls, so closing
  leaves the user exactly where they were.
- **Full details** closes the sheet, scrolls to that reference in the table
  and flashes a highlight: the one jump that is welcome, because the user
  asked for it.
- Selection lives in the hash (`sel=<site>.<refId>`, e.g. `sel=sov.yao2026`),
  alongside the existing state: opening pushes one history entry (swapping
  replaces it), so Back closes the sheet, and links can open with a reference
  selected (the page scrolls to its row). Leaving that entry carries over
  anything changed while the sheet was open (units, filters), since the older
  entry's hash predates it (`beforeNav()` in `js/sheet.js`).

**Implementation notes (still vanilla; no framework needed):**

- New state: selected reference (or none), sheet open, curve card collapsed.
  Same state object + `render()` pattern.
- rough.js: keep fixed seeds so redraws don't jitter; do the row highlight
  with a plain background / CSS class, not a rough redraw.
- When the sheet opens, keep the selected row visible above it (lower rows
  could otherwise end up under the sheet).
- Phones: size with `dvh`; pad the sheet with `env(safe-area-inset-bottom)`.
  Keep the sticky summary to one line.
- Accessibility: rows act as buttons (keyboard focusable, `aria-expanded` /
  `aria-controls`); focus moves into the sheet on open and back to the row on
  close.
- If a filter chip hides the selected reference, close the sheet.
- Print stylesheet: expand the curve card, hide the sheet.
- `prefers-reduced-motion`: no slide animation.
- Test swipe-to-close on a real phone early; if it feels fiddly, ✕, Back and
  tapping the row again are enough.

### What-if exploration (planned)

- Quick-tap buttons and sliders: **+10 years**, **−20 lb**, **swap sex**,
  height and weight.
- The entered patient stays as a faint ghost dot or row; the what-if dot
  moves, with change badges (e.g. +2.4 → +1.9). One Reset button.
- Wording: "Same 38 mm root, different person." The what-if changes the
  expected size, not the aorta.
- Fade or dash a reference when the what-if leaves its validity range.
  References without a sex term don't change when sex is swapped; say so.
- Shared links carry the entered patient; optional "share this what-if" link.

### Serial studies (parked)

- Two or more studies with **intervals** between them (e.g. "18 months"), not
  dates: under HIPAA Safe Harbor, dates other than the year are identifiers.
- Plot z or % predicted over time against a flat expected line. Flat z =
  normal aging; rising z = progression beyond expected.
- Report sentence, e.g. *Sinus z-score +2.4 → +2.8 over 18 months (diameter
  +2 mm; expected change for age ≈ +0.2 mm).*

## Copy for report

- **Plain text** on the clipboard (no tables or special symbols; "mm", "m",
  "z = +2.8"). One line per site, the reference named every time. Units follow
  the mm/cm switch.
- Example: *Sinus of Valsalva 41 mm (z = +2.8; 118% of predicted for age, sex
  and height; Devereux 2012 height model).*
- **Indexed line** (tick in a risk-thresholds card): *Ascending aorta 44 mm:
  AHI 2.78 cm/m, CSAH 9.6 cm2/m; above Desai 2026 risk thresholds (AHI 2.5,
  CSAH 9).* Guideline thresholds appended only when met.
- Numbers only by default; an optional toggle adds threshold wording
  ("dilated"), naming the threshold.
- Version tag at the end (e.g. "aoroot.parameterz.com v1.0.0"), from
  `lib/version.js`; see CHANGELOG.md for what each version contains.

## Teaching notes

- A small "Why?" link next to results (why this reference uses height, why two
  references disagree).
- Conditional pearls only when relevant, e.g. BMI outside the normal range
  **and** BSA vs height z-scores differ by about 1 SD or more.
- Body build (built Nov 2026): the form shows BSA (DuBois) and BMI live; the
  results summary shows both. At BMI ≥ 30 one banner sits above the sites
  (BSA-based references run low; rows marked BMI? come from cohorts that
  excluded obesity; button = the `ht` filter). Triggered by BMI alone, not by
  BSA-vs-height divergence, so it is predictable. The per-reference part is
  data: `validity.bmi` in the registry (Yao, Mirea, Muraru). Devereux's
  cohort was "nonobese" with no cutoff, so it gets a note, not a range.
  Underweight (BMI < 18.5, where BSA-based z-scores run high) has no banner
  yet. Ideal-weight BSA is still open (see the discussion of statements
  alongside the published results, not a toggle that replaces them).
- Candidate pearls:
  - Muraru 2014: leading vs inner edge differ by about 2 mm in the same people
    (the aortic wall); end-systole about 1 mm larger than end-diastole.
  - Oxborough 2014: systole 0.6–2.3 mm larger than end-diastole (least at the
    annulus); leading edge 1.6–2.1 mm larger than inner edge; inner edge at
    end-diastole is the most reproducible.
  - MATEAR 2025: women had smaller height-indexed but larger BSA-indexed sinus
    and STJ diameters than men, BSA overcorrection seen from the other side.

## Scaling position

- **Preferred scaling:** diameter / √height (equivalently area / height), with
  age and sex in the prediction. Show z-score and percent of predicted.
- Evidence:
  - Devereux 2012 height model implies a local exponent of about 0.45–0.55 for
    SoV diameter vs height (evaluator: 0.51 at 40 M, 175 cm).
  - Tavolinejad 2025 (UKB/PMBB CMR): area/height exponent ≈ 1.04 / 1.13
    (ascending aorta), i.e. diameter ∝ height^≈0.5.
  - Mirea 2013 Table 5: dividing by BSA overcorrects (residual r with BSA,
    height and weight −0.30 to −0.48); age + sex + height + weight regressions
    leave |r| ≤ 0.03.
  - Oxborough 2014: BSA exponents 0.52–0.68 (≈ BSA^0.6) needed for size
    independence at every level; ratio to height size-independent (except STJ)
    but only under age 40.
- AHI (D/H) assumes exponent 1, so it over-flags short patients (often women)
  and under-flags tall ones. CSAH works because it is D/√H in disguise.
- NORRE's height-indexed values (ratio, no age term) diverge from Devereux at
  the extremes: NORRE's ULN is higher for young tall men and lower for older
  short women.

**Reading the implied exponent from an additive model.** For
D = intercept + b·H + (other terms): local exponent ≈ (b·H) / D_predicted,
i.e. height's share of the predicted diameter. An intercept is direct evidence
that D is not proportional to H.

## Risk thresholds and CMR context

**Desai et al., JACC Adv 2026;5:102859.** AHI = D(cm)/H(m); CSAH = π(D/2)²/H,
area up-calculated from the echo diameter assuming a circular lumen.

- Desai risk: AHI ≥ 2.5 cm/m, CSAH ≥ 9 cm²/m (mortality in unoperated 4–5 cm
  ascending aortopathy), ≥ 45 mm (women).
- Guideline surgery thresholds as cited by Desai: CSAH ≥ 10 (IIa), AHI ≥ 3.21
  (IIb), 50 mm (IIa), 55 mm (I), EACTS/STS 50 mm if height < 1.69 m.
- AHI 2.5 and CSAH 9 coincide only at height ≈ 1.83 m (H = 4c / (π·a²)).
  Below that AHI flags first; above it, CSAH. Guideline pairs: AHI 2.43 vs
  CSAH 10 cross at ~2.16 m; AHI 3.21 vs CSAH 10 at ~1.24 m.
- Example, same 44 mm AAo: woman 158 cm reaches both Desai thresholds (AHI
  2.78, CSAH 9.6); man 190 cm reaches neither (AHI 2.32, CSAH 8.0).
- Concerns with the paper: no testing of age, sex or height exponent; height
  and age confound all-cause mortality; AUCs 0.56 / 0.54; diameter range
  truncated by design; count and percent errors in Table 2; age inconsistent
  between Table 1 and text. The thresholds in `lib/thresholds.js` have
  arithmetic tests but have not been formally reviewed.

**Tavolinejad 2025 CMR context** (AAo risk-thresholds card only).
Tavolinejad's area/height is the same index as CSAH. `CMR_NORMAL` holds the
97.5th-percentile upper bound (women 0.0327·age + 3.68, men 0.04·age + 3.74
cm²/m; UK Biobank healthy subgroup n = 11,310; ages 40–70, faded outside).
Shown as a threshold row and a dotted line vs height, **never** a z-score or a
comparison-table row (no mean or SD). Caveats in notes: lumen, maximum
anywhere from root to arch apex, π·r² from centerline distance, phase not
stated. Links to parameterz.github.io/aao-cmr. Example: M 55 y 178 cm →
5.94 cm²/m = 36.7 mm, between NORRE I–I (35.3) and the L–L echo ULNs
(37.8–38.3).

## References in the registry

Display order is by year. All entries reviewed.

| File | Reference | Sites and conventions |
|---|---|---|
| `devereux2012.js` | Devereux 2012, Am J Cardiol | SoV L–L ED; annulus I–I systole (caution) |
| `mirea2013.js` | Mirea 2013, JASE | all sites I–I ED |
| `campens2014.js` | Campens 2014, Am J Cardiol | SoV, AAo L–L ED |
| `muraru2014.js` | Muraru 2014, EHJ-CVI | SoV, STJ, AAo; L–L and I–I ED |
| `lang2015.js` | ASE/EACVI 2015 Table 14 | defaults only |
| `saura2017.js` | NORRE (Saura 2017), EHJ-CVI | every combination |
| `patel2022.js` | WASE (Patel 2022), JASE | annulus I–I MS; SoV, STJ L–L ED |
| `carrero2025.js` | MATEAR (Carrero 2025), Arch Cardiol Mex | defaults only |
| `yao2026.js` | Yao 2026 OMAM, MedComm | all levels L–L ED, incl. annulus |

### Devereux 2012

Devereux RB et al. Am J Cardiol 2012;110:1189–1194. SoV leading edge,
end-diastole, parasternal long axis; ages ≥ 15; normal-weight, normotensive,
non-diabetic.

- **BSA model:** D(cm) = 2.423 + 0.009·age + 0.461·BSA − 0.267·sex,
  SEE 0.261 cm.
- **Height model:** D(cm) = 1.519 + 0.010·age + 0.010·height(cm) − 0.247·sex,
  SEE 0.215 cm (as published).
- Sex coded **1 = man, 2 = woman** (do not code 0/1). BSA by DuBois.
- Age coefficient: Tables 1–2 print per decade (0.090, 0.10), the abstract per
  year. The registry uses per decade as printed (`{ per: 10 }`).
- z = (observed − predicted) / SEE, implied by the > 1.96 SEE definition of
  dilation and the severity bands (mild 1.97–3.0, moderate 3.01–4.0,
  severe > 4.0).

**SEE ambiguity, handled as a toggle with a note.**

- Both models report the same R (0.674) for the same outcome and sample, so
  their SEEs must be essentially equal; 0.261 vs 0.215 is inconsistent.
- The overall SoV SD (~0.37 cm) and the age-coefficient back-calculation both
  give an SEE of about 0.26, matching the BSA model.
- In Table 1, 0.261 and 0.215 sit in the intercept row's SE column; 0.215 is
  consistent with a height-model intercept SE.
- Effect: with 0.215, height-model z-scores are about 21% larger and the ULN
  about 1 mm lower, which matters near the Ghent z ≥ 2 threshold.
- **Site behaviour:** published 0.215 by default, with an SD variant
  **"consistency-corrected" (0.26 cm)** and a short note. The BSA model is
  unaffected.
- Other inconsistencies: Results text gives height r = 0.14 (abstract and
  coefficients imply ~0.48); "coefficient of variation" used for R²; cohort
  counts sum to 1,234 vs the stated n = 1,207.

**Annulus (`status: "caution"`).** Table 2: BSA 1.439 + 0.002·age +
0.457·BSA − 0.121·sex; height 1.535 + 0.001·age + 0.004·height − 0.152·sex.
SEEs from Table 2 (BSA 0.070, height 0.113); the text swaps them, and the old
2013 site (`devereux.py`) followed the table. Both are most likely intercept
SEs. The paper's age B and beta imply an annulus SD ≈ 2.3 mm → SEE ≈ 0.18 cm,
consistent with WASE/NORRE/Campens annulus SDs of 1.9–2.4 mm. **Default =
published Table 2, with a "consistency-corrected" 0.18 cm option**, so users
discover the problem the same way we did. Example: man 45 y, 178 cm, annulus
25 mm, height model z 3.19 published vs 2.00 corrected. Percent predicted is
unaffected. Annulus convention: "between the hinging points ... in systole" →
inner edge, mid-systole.

**Variance assumptions.** One constant SEE for all ages, sizes and both sexes
(absolute-residual relation r² = 0.010–0.016: detectable at n = 1,207 but
small). Normal residuals, no widening at the extremes: treat z ≥ +4 at the age
or size extremes cautiously.

**Independent tests:** the old site's code (`devereux.py`, 2013) supplies 8
tests (mean and mean + 2 SE).

### Mirea 2013

Mirea O et al. J Am Soc Echocardiogr 2013;26:419–427 (Milan). n = 500
consecutive referrals with normal echos, retrospective, one reader; 14% mild
hypertension; BMI < 30. **Every level I–I end-diastole, including the
annulus.** Age range not stated, so no age extrapolation flags.

- **Models (24), Table 2:** diameter/BSA (DuBois) mean ± SD by sex and decade
  ([−,30) … [70,∞)) for annulus, SoV, STJ, AAo. Steps at each decade, not
  always rising.
- **Removed under rule 7:** the 8 Table 4 regressions (no residual SD).
- **BSA overcorrects** (the paper's own Table 5: residual r −0.30 to −0.48),
  so z runs low in large and high in small patients; noted on every model.
  The paper's height + weight models remove the body-size correlation, and its
  Discussion recommends them, but it gives no residual SD for them. Estimating
  one (SoV ≈ 2.2 mm) would stack three approximations, so it is not done.
- **Errata (values not used):** Table 4 SoV female constant 9.0 printed with
  CI 12.1–23.7 (9.0 reproduces Table 2, so the CI is the typo); the allometric
  model footnote prints a sum where the coefficients only work as a product;
  regressions exclude the 70 hypertensive patients, Table 2 includes them.

### Campens 2014

Campens L et al. Am J Cardiol 2014;114:914–920 (Ghent). 849 Caucasian patients
aged 1–85 (716 aged ≥ 15), single center.

- **Models (4):** SoV and AAo (at the right pulmonary artery), L–L ED;
  log10(D) = a + b·log10(age) + c·BSA, sex-keyed, log10-scale SEE (Table 2),
  each with DuBois (default) and Haycock BSA.
- **Caveats:** clinic patients, not healthy volunteers (12.8% treated
  hypertension, ~10% obese adults); Methods say natural log but every equation
  is log10; asymmetric limits; no height term.
- **Independent check:** matches the legacy parameterz Campens calculator
  (61 M, 178 cm, 75 kg: SoV 40 mm z 1.57; AA 40 mm z 2.29).

### Muraru 2014

Muraru D et al. Eur Heart J Cardiovasc Imaging 2014;15:415–422 (Padua).
n = 218 healthy Caucasian volunteers, ages 18–80, no risk factors,
BMI ≤ 30. SoV, STJ, tubular aorta 1 cm above STJ; **L–L and I–I, end-diastole.**

- **Models (12), Table 2:** height- and BSA-indexed by sex, both conventions,
  published as median (IQR) and 95th percentile, integers. SD =
  (P95 − median)/1.645 via `fromLimits`. All `caution` (integer rounding).
- The paper's ULN is the 95th percentile (z = 1.645); the site keeps its
  default limit (1.96) and explains the difference in a note.
- **Normality check:** mean ≈ median within 1 mm everywhere; P95-derived SDs
  3.6–4.9 mm vs printed 3–4 mm. Accepted as close enough to normal.
- I–I STJ/BSA suppressed (ULN printed as 28 mm/m² for both sexes, implausible).
- Removed under rule 7: the 6 Table 4 regressions.
- **Worth including despite n = 218:** cleanest normal population in the set,
  both edge conventions in the same subjects, and a third I–I ED reference.

### ASE/EACVI 2015 (Lang) Table 14

Lang RM et al. J Am Soc Echocardiogr 2015;28:1–39.e14. The guideline table
many labs still report against, included so it sits beside references that
model age and body size.

- **Models (4), all `caution`:** BSA-indexed mean ± SD by sex (DuBois
  assumed). Absolute columns not used.
- Conventions not stated in the table; mapped to the guideline's own
  recommendations, so it appears at the default conventions only.
- **Notes:** a guideline table that recommends against its own use (section IV
  says SoV should be compared with age- and BSA-related nomograms or
  allometric equations); secondary source (adapted from Roman 1989; no n, ages,
  BSA formula or convention); no age term; BSA ratio overcorrects; 0.1 cm
  rounding; WASE found the guideline means several mm too large; AAo level
  undefined.

### NORRE (Saura 2017)

Saura D et al. Eur Heart J Cardiovasc Imaging 2017;18:167–179. n = 704 healthy
European volunteers (44% men), ages 19–78, core-lab reading.

- **Ratio models (38), Table 3:** height- and BSA-indexed mean ± SD by sex for
  annulus, SoV, STJ, AAo × leading/inner × end-diastole/mid-systole, plus
  short-axis sinus diameters. **No age term**, so z runs high in older and low
  in younger patients relative to references with age.
- **Table 5 regressions (4) suppressed under rule 7.** Kept as transcribed.
  Minus signs appear as "2" in the PDF text. The SoV outcome there is the mean
  of the three short-axis sinus diameters.
- BSA formula not stated; DuBois assumed.
- **Cross-check:** height ratios match `parameterz/dilated-af` (30 pairs,
  0 mismatches; that site uses mean ± 2 SD).
- **Table errata (values not used):** Table 2 TAA I–I ED mean outside its 95%
  CI; Table 2 STJ L–L MS IQR reversed; Table 3 VAJ/Ht L–L MS IQR and CI columns
  swapped; Table 4 I–I ED STJ/TAA by-sex columns repeat the L–L values.

### WASE (Patel 2022)

Patel HN et al. J Am Soc Echocardiogr 2022;35:267–274. n = 1,585 healthy
adults, 15 countries, core-lab reading; annulus I–I mid-systole, SoV and STJ
L–L end-diastole; DuBois BSA.

- **Table 3 models:** BSA- and height-indexed mean ± SD by sex and age group
  (`[18, 41)`, `[41, 66)`, `[66, ∞)`). The 9 absolute models are suppressed.
- **Figure 2/3 nomograms (6):** SoV vs BSA and height per age group, sexes
  pooled. SD = (printed ULN − fit) / 1.96 via `fromLimits`. Height nomograms
  are `caution` (coefficients printed to 2–3 decimals).
- The paper's ULN is a 97.5th percentile but only mean ± SD is tabulated; the
  site uses mean ± 1.96 SD.
- **Age steps** at 41 and 66 (e.g. woman 165 cm 60 kg, SoV 36 mm:
  height-indexed z 1.92 at 40.9 y → 1.61 at 41 y), noted on every model.
- **Not used:** race tables (Tables 4–5; counts don't match Table 1); Table 2
  height^2.13-indexed values (no age stratum; implausible exponent).
- **Cross-check:** height-indexed SoV and STJ match `parameterz/dilated-af`
  (12 pairs, 0 mismatches).

### MATEAR (Carrero 2025)

Carrero MC et al.; MATEAR study group. Arch Cardiol Mex 2025;95(2):171–177.
doi:10.24875/ACM.24000185. n = 1,000 apparently healthy Argentine adults,
53 laboratories, re-measured offline; mean age 38 ± 13 (few > 65); obesity not
excluded (mean BMI 26.4). DuBois BSA.

- Annulus I–I mid-systole; SoV, STJ, proximal AAo L–L ED (the defaults).
- **Models (8 shown), Table 2:** height- and BSA-indexed mean ± SD by sex;
  height-indexed is the default row.
- **Absolute models (4)** transcribed but suppressed; they carry the paper's
  only printed z-scores, used as `paper` tests.
- **Normality check:** mean + 1.96 SD within 0.07 cm of the printed P97.5 in
  every row (slightly long upper tail).
- **Notes:** no age term (young cohort, so z runs high in older adults); BSA
  overcorrects; ULN at z = 2.5 in the abstract vs P97.5 in Methods; parent
  registry paper (Argent J Cardiol 2020;88:14–25) may have more.

### Yao 2026 (OMAM)

Yao G et al. MedComm 2026;7:e70788. 910 Chinese (EMINCA) + 910 Italian healthy
adults, propensity-matched for sex and age; ages 18–79; BMI < 30.

- Chosen over Yao 2019 (JASE), which uses the same Chinese cohort with no sex
  term and no stated convention.
- **Equations:** Yp = a × b^(woman) × age^x × height^y × weight^z for annulus,
  SoV and AAo, in Chinese, Italian and combined populations (9 `power` models).
  Population is a view option; combined is the default.
- **All levels L–L end-diastole, including the annulus**, so Yao's annulus
  appears only when that convention is chosen.
- **`ratio` distribution:** Yc = observed / Yp; z = (Yc − mean)/SD;
  % predicted = 100 × Yc. Normal range = the published Yc limits (as on
  parameterz/OMAM-Aortic-Root), asymmetric, so rows are highlighted by
  outside-range, not |z|. Combined set uses mean ± 1.96 SD (provisional).
- **Independent check:** matches the authors' calculator code
  (github.com/xueyingzeng/OMAMaorta) and the OMAM-Aortic-Root site.
- Behaviour worth knowing: tight SoV range (ULN ~119–121% of predicted) and an
  age term that predicts small roots in young adults; the Chinese equations
  have no height term. 25 M, 190 cm, 85 kg, SoV 36 mm: Yao z ≈ 2.0 vs NORRE
  −0.03, WASE 0.6–0.8, Devereux 0.8–0.9.

## Papers considered and not used

- **Hamburg City Health Study (Wenzel 2021, Int J Cardiovasc Imaging 37:3513):**
  out under rule 7 (no SD/SEE). Its Table 4 "Lower/Higher" formulas are the
  95% CI bounds of the coefficients, not normal limits.
- **Oxborough 2014 (Echo Res Pract):** gives no cut-offs by design. Used for
  scaling evidence and pearls.
- **Copenhagen City Heart Study (Pedersen 2024, Am J Cardiol 218:86):**
  unselected population, no prediction equation or SD. Of note: 22.6% of men
  had SoV ≥ 40 mm.
- **Vriz 2014 (Am J Cardiol 114:921):** passes rule 7 but adds nothing new
  (Mirea's BSA-by-decade design at leading edge). Kept in reserve if an annulus
  L–L ED reference beside Yao is ever wanted.
- **Ayoub 2018 (Am J Cardiol 122:1068; Mayo):** out under rule 7 (95th
  percentile quantile regression only, no central value), and a mid-ascending
  level the site doesn't have.
