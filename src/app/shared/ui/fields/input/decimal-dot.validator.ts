import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function decimalDot(maxDecimals = 2): ValidatorFn {
  const re = new RegExp(`^-?\\d+(?:\\.\\d{0,${maxDecimals}})?$`);
  return (c: AbstractControl): ValidationErrors | null => {
    const raw = (c.value ?? '').toString().trim();
    if (raw === '') return null;
    if (raw.includes(',')) return { decimalDot: true };
    return re.test(raw) ? null : { decimalDot: true };
  };
}
