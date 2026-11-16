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

## [Unreleased]

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
