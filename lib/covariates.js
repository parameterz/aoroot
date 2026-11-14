// @ts-check
// Shared input variables. Registry entries may reference ONLY the names in
// VARIABLES. Each BSA formula is its own variable so a term can never pick up
// the wrong formula by accident.

/** BSA formulas: height in cm, weight in kg, result in m². */
export const BSA = {
  dubois:    (h, w) => 0.007184 * h ** 0.725 * w ** 0.425,     // Du Bois & Du Bois 1916
  mosteller: (h, w) => Math.sqrt((h * w) / 3600),             // Mosteller 1987
  haycock:   (h, w) => 0.024265 * h ** 0.3964 * w ** 0.5378,  // Haycock 1978
  gehan:     (h, w) => 0.0235 * h ** 0.42246 * w ** 0.51456,  // Gehan & George 1970
};

export const VARIABLES = [
  "age", "sex", "height_cm", "height_m", "weight_kg", "bmi",
  ...Object.keys(BSA).map((k) => `bsa_${k}`),
];

/**
 * Patient inputs → every derived variable.
 * Weight is optional; without it, BMI and BSA are undefined and any model
 * that needs them reports "missing input" instead of a number.
 * @param {{ age: number, sex: "male"|"female", height_cm: number, weight_kg?: number }} p
 */
export function covariates(p) {
  /** @type {Record<string, any>} */
  const c = { age: p.age, sex: p.sex, height_cm: p.height_cm, height_m: p.height_cm / 100 };
  if (p.weight_kg != null) {
    c.weight_kg = p.weight_kg;
    c.bmi = p.weight_kg / c.height_m ** 2;
    for (const [k, f] of Object.entries(BSA)) c[`bsa_${k}`] = f(p.height_cm, p.weight_kg);
  }
  return c;
}

/** Length unit conversion. */
const MM_PER = { mm: 1, cm: 10 };
export const convert = (x, from, to) => (x * MM_PER[from]) / MM_PER[to];
