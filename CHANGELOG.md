# Changelog

All notable changes to aoroot.parameterz.com. The site version lives in
`lib/version.js` and appears in the results footer, the Copy for report line
and the About page citation. Each release is tagged `v<version>` in git.

Versioning follows [semantic versioning](https://semver.org/), read for a
clinical calculator:

- **Major:** a change that can move a patient's result for the same inputs
  (a changed default such as the BSA formula or an SD choice, a corrected
  coefficient, a model removed).
- **Minor:** something added that leaves existing results alone (a new
  reference, a new card or page, a new option that is off by default).
- **Patch:** fixes and wording that don't change any number.

Each reference also keeps its own history in its registry file
(`registry/*.js`); entries here name the reference version a release includes.

## [1.4.0] - unreleased

### Added

- Absolute (sex-only) values, shown as the unadjusted comparison beside the
  references that account for body size: ASE/EACVI 2015 Table 14 (4 models,
  entry 0.4.1, reviewed), WASE (9, entry 0.4.0) and MATEAR (4, entry 0.3.0). All marked
  caution with a "no body size" note. Results for every existing model are
  unchanged.
- Percent of predicted: a dotted `no body size` chip and an open outline for
  these rows, and a `no body size` filter chip.
- A call-out above the chart when the sex-only limits and the size-adjusted
  references disagree ("Within the unadjusted (sex-only) limits, but above the
  upper limit in 12 of 15 size-adjusted models").
- Patient on the curve: a flat, dotted line per unadjusted reference, with its
  own legend key (also in that reference's sheet).
- ASE/EACVI 2015 note: the guideline never says what its ± values are; read as
  mean ± SD, and the upper limit is mean + 1.96 SD, not mean + 1 SD.
- No z-score for the sex-only rows (table, sheet and report text): one SD for
  everyone, whatever their size, implies a precision the method can't deliver.

### Changed

- The `fitted equations` filter no longer matches sex-only constants.
- Rows within a reference follow a fixed order, least to most adjustment:
  unadjusted, then simple ratios, then fitted equations; within each, fewer
  patient inputs first (so height-based before BSA-based). Some references'
  rows swap places (e.g. Devereux, WASE, Muraru and NORRE lead with height).
- The risk thresholds' band of upper limits spans the size-adjusted
  references only.

## [1.3.1] - 2026-11-16

### Added

- Licensing. Code under the GNU AGPL v3.0 or later (`LICENSE`); the reference
  registry, notes and page text under CC BY-NC-SA 4.0 (`LICENSE-DATA`);
  `LICENSING.md` explains what each covers. Commercial use, including
  reporting, PACS or EHR integration, needs a separate license: contact the
  author.
- About page: a License and reuse section. Every page footer carries a
  one-line license notice; every registry file carries a license header.

No numbers change.

## [1.3.0] - 2026-11-16

### Added

- Copy for report: chips choose which pieces each sentence carries (verdict,
  z-score, % predicted, normal limit, reference, risk thresholds). Choices
  are remembered in the browser as display settings; nothing you enter is
  stored.
- Copy for report: the text can be edited by hand before copying, with an
  "edited" marker and a Reset.

### Changed

- Copy for report names each site and its measurement once instead of on
  every line; ticked references and the AHI/CSAH line follow as clauses (#5).
  A site with more than one reference always names them. References are named
  by first author and year ("Saura 2017"). No numbers change.

## [1.2.1] - 2026-11-16

### Fixed

- Results page site headings keep the measurement and its unit on one line
  on narrow phones (was "Sinus of Valsalva 41" with "mm" wrapped below).
- Results page no longer jumps toward the top when you tick an SD option,
  use a filter, open "Patient on the curve" or toggle a curve series while
  scrolled down the page (#3).

## [1.2.0] - 2026-11-16

### Added

- BSA (DuBois) and BMI shown on the input form as you type, with the BMI
  category; a BMI below 13 or above 60 asks for a units check. BMI joins BSA
  in the results summary.
- Body-build banner on the results page when BMI is 30 or more (BSA-based
  references run low; rows marked BMI? come from cohorts that excluded
  obesity) or below 18.5 (BSA-based references run high and can overcall
  dilation), with a button to show only references using height. Display
  only; no numbers change.

### References

- Mirea 2013 0.3.2 and Muraru 2014 0.3.1: BMI ≤ 30 validity range on every
  model (both excluded obesity), so obese patients get the "outside study"
  flag and a BMI? chip. No values changed.
- Devereux 2012 0.4.1: note that the cohort was "nonobese" with no BMI
  cutoff stated, so no BMI range is checked. No values changed.

## [1.1.0] - 2026-11-15

### Changed

- Results page leads with the charts: percent of predicted, then patient on the
  curve (now collapsed by default), then risk thresholds (chart at the top of
  the card), then the comparison table. No numbers change.
- One-line input summary (measurements, sex, age, height, weight) stays at the
  top while scrolling; tapping it goes to Edit.

### Added

- Tap a percent-of-predicted row to open that reference in a bottom sheet:
  its predicted value, normal range, z and percent of predicted, its curve
  with the patient, and a link to its full table entry and "Why?" notes. Close
  with ✕, Esc, Back, a swipe down, or by tapping the row again. The selection
  is kept in the link (`sel=`).
- Print: collapsed curve cards print open; the sheet doesn't print.

## [1.0.0] - 2026-11-15

First release of the rebuilt site: adults only, static, on GitHub Pages at
aoroot.parameterz.com (replacing the old Google App Engine site).

### References

Nine references, every one reviewed against its paper by Dan Dyar, with
tests passing on the References page:

| Reference | Entry version |
| --- | --- |
| Devereux 2012 | 0.4.0 |
| Mirea 2013 | 0.3.1 |
| Campens 2014 | 0.2.0 |
| Muraru 2014 | 0.3.0 |
| ASE/EACVI 2015 (Lang), Table 14 | 0.3.0 |
| NORRE (Saura 2017) | 0.3.0 |
| WASE (Patel 2022) | 0.3.0 |
| MATEAR (Carrero 2025) | 0.2.0 |
| Yao 2026 (OMAM) | 0.3.0 |

- Absolute (sex-only) models are not shown (ASE/EACVI 2015 removed, WASE
  suppressed); the site scores against indexed and multivariable models.
- A reference is included only if it gives a normal range ("no range, no
  model").
- Devereux 2012 annulus models carry a caution; the height model offers a
  "consistency-corrected" SEE option alongside the published value.
- Muraru 2014 uses the site's z = 1.96 limit (the paper's own limit is
  explained in a note).

### Site

- Input form: age, sex, height, optional weight, and annulus, sinus, STJ and
  ascending aorta measurements, with a per-site measurement convention (ASE/EACVI
  2015 defaults) and mm/cm and in/lb switches.
- Results page, with inputs in the URL hash (values never reach a server;
  links are shareable): per-site comparison table with "Why?" notes; percent
  of predicted card with normalization chips and filters; patient on the curve
  card (height or age axis); risk thresholds card (AHI, CSAH, diameter, Desai
  2026 and guideline thresholds, Tavolinejad 2025 CMR upper normal on the
  ascending aorta).
- Copy for report: plain-text lines naming the reference, plus an AHI / CSAH
  line, ending with the site version.
- References page generated from the registry (equations, populations, sources,
  notes, live tests); About page with how to cite; custom 404 page and a stub
  for the legacy Devereux worksheet.
- Hand-drawn look after parameterz/OMAM-Aortic-Root: rough.js sketches with
  fixed seeds, self-hosted fonts, phone layouts, link-preview image and favicon.
