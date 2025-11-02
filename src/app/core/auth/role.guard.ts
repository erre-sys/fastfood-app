import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { authService } from './auth.service';

/**
 * Guard para proteger rutas basado en roles de Keycloak
 *
 * @example
 * // En las rutas (app.routes.ts):
 * {
 *   path: 'pedidos',
 *   loadComponent: () => import('./pages/pedidos/list/pedido.component'),
 *   canActivate: [roleGuard(['ADMIN', 'CAJERO'])]
 * }
 *
 * @param allowedRoles - Array de roles permitidos (el usuario necesita al menos uno)
 * @returns CanActivateFn
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const router = inject(Router);

    // Verificar si el usuario tiene al menos uno de los roles permitidos
    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Redirigir a página de acceso denegado o home
    console.warn(`Acceso denegado. Roles requeridos: ${allowedRoles.join(', ')}`);
    router.navigate(['/']);
    return false;
  };
}

/**
 * Guard que requiere TODOS los roles especificados
 *
 * @example
 * {
 *   path: 'admin/config',
 *   loadComponent: () => import('./pages/admin/config.component'),
 *   canActivate: [requireAllRolesGuard(['ADMIN', 'SUPER_USER'])]
 * }
 */
export function requireAllRolesGuard(requiredRoles: string[]): CanActivateFn {
  return () => {
    const router = inject(Router);

    if (authService.hasAllRoles(requiredRoles)) {
      return true;
    }

    console.warn(`Acceso denegado. Se requieren todos los roles: ${requiredRoles.join(', ')}`);
    router.navigate(['/']);
    return false;
  };
}
