import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { authService } from './app/core/auth/auth.service';
import { LoadingService } from './app/core/layout/loading/loading.service';
import { registerLocaleData } from '@angular/common';
import localeEsEc from '@angular/common/locales/es-EC';
import { RuntimeConfigService } from './app/core/runtime-config.service'; 

registerLocaleData(localeEsEc);

(async () => {
  const loader = new LoadingService();
  await new RuntimeConfigService().load();
  await loader.wrap(authService.init());
  await bootstrapApplication(AppComponent, appConfig).catch(console.error);
})();