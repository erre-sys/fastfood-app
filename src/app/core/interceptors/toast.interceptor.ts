import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';

import { TOAST_SUCCESS } from './toast-context';
import { tap } from 'rxjs/operators';
import { NotifyService } from '../notify/notify.service';

export const toastInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotifyService);
  const successMsg = req.context.get(TOAST_SUCCESS);

  return next(req).pipe(
    tap({
      next: () => {
        if (successMsg) notify.success(successMsg);
      },
      error: (err) => {
        let msg = 'Error al procesar la solicitud';
        if (err instanceof HttpErrorResponse) {
          msg = err.error?.message || err.statusText || msg;
        }
        notify.error(msg);
      },
    })
  );
};
