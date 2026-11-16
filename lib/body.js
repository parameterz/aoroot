// @ts-check
// Body build: BMI categories (CDC adult cutoffs) and the obesity cutoff the results
// banner uses. Display only: nothing here changes a model's result.

/** BMI at or above which the results page shows the body-build banner. */
export const OBESE_BMI = 30;

/** Outside this range the form asks for a units check (lb entered as kg, in as cm).
 *  A nudge only: a real BMI of 65 is still scored and still gets the banner. */
const PLAUSIBLE = [13, 60];

/**
 * @param {number | undefined} bmi
 * @returns {{ label: string | null, obese: boolean, implausible: boolean }}
 */
export function bmiNote(bmi) {
  if (bmi == null || !Number.isFinite(bmi)) return { label: null, obese: false, implausible: false };
  const implausible = bmi < PLAUSIBLE[0] || bmi > PLAUSIBLE[1];
  const label = bmi < 18.5 ? "underweight" : bmi < 25 ? "normal" : bmi < OBESE_BMI ? "overweight" : "obese";
  return { label, obese: bmi >= OBESE_BMI, implausible };
}
