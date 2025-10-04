import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../layout/toast/toast.service';
import { authService } from '../auth/auth.service';

const toast = new ToastService();

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        toast.push('Sesión expirada o no autorizada', 'error');
        // refrescamos login si quieres
        // authService.login();
      } else if (err.status >= 500) {
        toast.push('Error del servidor', 'error');
      }
      return throwError(() => err);
    })
  );
};
