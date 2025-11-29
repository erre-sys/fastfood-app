import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { authService } from '../auth/auth.service';  

export const authTokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const isApi =
    req.url.startsWith('/api') ||                    
    req.url.includes('localhost:8081') ||            
    req.url.includes('api.erre.cloud');                

  if (!isApi) return next(req);

  return from(authService.token()).pipe(
    switchMap((token) => {
      if (!token) return next(req);
      const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next(authReq);
    })
  );
};
