import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authTokenInterceptor } from './core/interceptors/token.interceptor';
import { httpNotifyInterceptor } from './core/interceptors/http-notify.interceptor';
// Si tienes otro errorInterceptor propio y lo quieres mantener, ponlo DESPUÉS y que relance el error.

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      authTokenInterceptor,
      httpNotifyInterceptor,
      // errorInterceptor, // (opcional) si lo dejas, asegúrate que haga rethrow
    ])),
  ],
};