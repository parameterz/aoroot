# aoroot

Adult aortic root reference calculator. Static site, plain HTML + ES modules, no build step.

- `registry/` one data file per published reference (copy `_template.js`, add a line to `index.js`)
- `lib/covariates.js` the only variables references may use (age, sex, height, weight, BMI, BSA by formula)
- `lib/evaluator.js` all the math: mean / sd / dist types, `score()`, `impliedExponent()`
- `lib/validate.js` schema check
- Tests: `node tests/run.js`, or open `tests.html` from a local server (`python3 -m http.server`)
