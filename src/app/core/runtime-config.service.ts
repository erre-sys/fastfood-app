import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';

interface RuntimeConfig {
  apiBaseUrl: string;
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
  };
}

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  async load(): Promise<void> {
    const response = await fetch('/assets/config.json');
    if (!response.ok) {
      throw new Error('No se pudo cargar /assets/config.json');
    }
    const config: RuntimeConfig = await response.json();

    environment.apiBaseUrl = config.apiBaseUrl;
    environment.keycloak.url = config.keycloak.url;
    environment.keycloak.realm = config.keycloak.realm;
    environment.keycloak.clientId = config.keycloak.clientId;
  }
}