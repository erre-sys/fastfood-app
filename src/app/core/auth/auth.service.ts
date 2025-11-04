import Keycloak, { KeycloakInstance } from 'keycloak-js';
import { environment } from '../../../environments/environments.development';

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

  /**
   * Obtiene los roles del realm asignados al usuario
   * @returns Array de roles del realm
   */
  getRealmRoles(): string[] {
    if (!this.kc || !this.kc.tokenParsed) return [];
    const realmAccess = this.kc.tokenParsed['realm_access'] as { roles?: string[] } | undefined;
    return realmAccess?.roles ?? [];
  }

  /**
   * Obtiene los roles del cliente asignados al usuario
   * @param clientId - ID del cliente (por defecto usa el configurado)
   * @returns Array de roles del cliente
   */
  getClientRoles(clientId?: string): string[] {
    if (!this.kc || !this.kc.tokenParsed) return [];
    const client = clientId ?? environment.keycloak.clientId;
    const resourceAccess = this.kc.tokenParsed['resource_access'] as Record<string, { roles?: string[] }> | undefined;
    return resourceAccess?.[client]?.roles ?? [];
  }

  /**
   * Obtiene todos los roles del usuario (realm + cliente)
   * @returns Array con todos los roles
   */
  getAllRoles(): string[] {
    const realmRoles = this.getRealmRoles();
    const clientRoles = this.getClientRoles();
    return [...new Set([...realmRoles, ...clientRoles])];
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param role - Nombre del rol a verificar
   * @returns true si el usuario tiene el rol
   */
  hasRole(role: string): boolean {
    if (!this.kc) return false;
    return this.kc.hasRealmRole(role) || this.kc.hasResourceRole(role);
  }

  /**
   * Verifica si el usuario tiene al menos uno de los roles especificados
   * @param roles - Array de roles a verificar
   * @returns true si el usuario tiene al menos un rol
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Verifica si el usuario tiene todos los roles especificados
   * @param roles - Array de roles a verificar
   * @returns true si el usuario tiene todos los roles
   */
  hasAllRoles(roles: string[]): boolean {
    return roles.every(role => this.hasRole(role));
  }
}

export const authService = new AuthService();
