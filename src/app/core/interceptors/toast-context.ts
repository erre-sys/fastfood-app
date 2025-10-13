import { HttpContext, HttpContextToken } from '@angular/common/http';
export const TOAST_SUCCESS = new HttpContextToken<string | undefined>(
  () => undefined
);
export function withSuccess(msg: string): HttpContext {
  return new HttpContext().set(TOAST_SUCCESS, msg);
}
