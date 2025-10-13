import { ApplicationConfig, LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authTokenInterceptor } from './core/interceptors/token.interceptor';
import { httpNotifyInterceptor } from './core/interceptors/http-notify.interceptor';
import { toastInterceptor } from './core/interceptors/toast.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authTokenInterceptor, httpNotifyInterceptor, toastInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-EC' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'USD' },
  ],
};
