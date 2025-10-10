import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Si está presente y truthy, el interceptor mostrará un toast de éxito con este mensaje */
export const TOAST_SUCCESS = new HttpContextToken<string | undefined>(() => undefined);

/** Helper para adjuntar el mensaje de éxito al request */
export function withSuccess(msg: string): HttpContext {
  return new HttpContext().set(TOAST_SUCCESS, msg);
}
