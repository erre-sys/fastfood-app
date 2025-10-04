import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { authService } from './app/core/auth/auth.service';
import { LoadingService } from './app/core/layout/loading/loading.service';

(async () => {
  const loader = new LoadingService();
  await loader.wrap(authService.init());
  await bootstrapApplication(AppComponent, appConfig);
})();
