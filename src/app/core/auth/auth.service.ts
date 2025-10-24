import Keycloak, { KeycloakInstance } from 'keycloak-js';
import { environment } from '../../../environments/environments';

class AuthService {
  private kc: KeycloakInstance | null = null;

  async init(): Promise<void> {
    this.kc = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    });

    const authenticated = await this.kc.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256',
    });

    if (!authenticated) await this.kc.login();

    // refresco automático
    setInterval(async () => {
      if (!this.kc) return;
      try {
        await this.kc.updateToken(30);
      } catch {
        await this.kc.login();
      }
    }, 10000);
  }

  async token(): Promise<string | undefined> {
    if (!this.kc) return undefined;
    if (this.kc.isTokenExpired(30)) {
      try {
        await this.kc.updateToken(30);
      } catch {
        await this.kc.login();
      }
    }
    return this.kc.token;
  }

  async logout(): Promise<void> {
    if (!this.kc) return;
    await this.kc.logout();
  }

  isReady(): boolean {
    return !!this.kc;
  }

  async login(): Promise<void> {
    if (!this.kc) return;
    await this.kc.login();
  }

  async account(): Promise<void> {
    if (!this.kc) return;
    await this.kc.accountManagement();
  }

  async profile(): Promise<{
    username?: string;
    name?: string;
    email?: string;
  }> {
    if (!this.kc) return {};
    try {
      const p = await this.kc.loadUserProfile();
      return {
        username: this.kc.tokenParsed?.['preferred_username'] as string,
        name: p.firstName,
        email: p.email ?? undefined,
      };
    } catch {
      return {};
    }
  }

  /**
   * Obtiene el 'sub' (subject/identificador único) del usuario autenticado
   */
  getSub(): string | undefined {
    if (!this.kc || !this.kc.tokenParsed) return undefined;
    return this.kc.tokenParsed['sub'] as string | undefined;
  }
}

export const authService = new AuthService();
