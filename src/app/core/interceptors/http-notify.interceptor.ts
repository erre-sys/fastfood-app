import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NotifyService } from '../notify/notify.service';
import { TOAST_SUCCESS } from './toast-context';

export const httpNotifyInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const notify = inject(NotifyService);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse && event.ok) {
          const msg = req.context.get(TOAST_SUCCESS);
          if (msg) notify.success(msg); // ← SOLO si el request lo pidió
        }
      },
      error: (err) => notify.error(toUserMessage(err)),
    })
  );
};

function toUserMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const s = err.status;
    const body: any = err.error;
    const serverMsg =
      body?.message ||
      body?.error ||
      (Array.isArray(body?.errors) ? (body.errors[0]?.defaultMessage || body.errors[0]) : null) ||
      err.statusText || null;

    if (s === 0)   return 'No hay conexión con el servidor.';
    if (s >= 500)  return `Error del servidor (${s}). ${serverMsg ?? 'Intenta más tarde.'}`;
    if (s === 400) return `Solicitud inválida. ${serverMsg ?? ''}`.trim();
    if (s === 401) return 'Sesión expirada o no autenticado.';
    if (s === 403) return 'No tienes permisos para esta acción.';
    if (s === 404) return 'Recurso no encontrado.';
    return serverMsg ?? `Error HTTP ${s}`;
  }
  return 'Error inesperado.';
}
