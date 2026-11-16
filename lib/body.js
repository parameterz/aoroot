// @ts-check
// Body build: BMI categories (CDC adult cutoffs) and the obesity cutoff the results
// banner uses. Display only: nothing here changes a model's result.

/** The results page shows the body-build banner at BMI >= OBESE_BMI or < UNDERWEIGHT_BMI. */
export const OBESE_BMI = 30;
export const UNDERWEIGHT_BMI = 18.5;

/** Outside this range the form asks for a units check (lb entered as kg, in as cm).
 *  A nudge only: a real BMI of 65 is still scored and still gets the banner. */
const PLAUSIBLE = [13, 60];

/**
 * @param {number | undefined} bmi
 * @returns {{ label: string | null, obese: boolean, underweight: boolean, implausible: boolean }}
 */
export function bmiNote(bmi) {
  if (bmi == null || !Number.isFinite(bmi)) return { label: null, obese: false, underweight: false, implausible: false };
  const implausible = bmi < PLAUSIBLE[0] || bmi > PLAUSIBLE[1];
  const label = bmi < UNDERWEIGHT_BMI ? "underweight" : bmi < 25 ? "normal" : bmi < OBESE_BMI ? "overweight" : "obese";
  return { label, obese: bmi >= OBESE_BMI, underweight: bmi < UNDERWEIGHT_BMI, implausible };
}
