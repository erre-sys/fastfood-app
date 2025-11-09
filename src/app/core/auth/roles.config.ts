/**
 * =====================================================
 * CONFIGURACIÓN CENTRALIZADA DE ROLES Y PERMISOS
 * =====================================================
 *
 * Aquí defines TODO sobre roles y permisos UNA SOLA VEZ.
 * No quemes código repitiendo roles en múltiples archivos.
 */

import { authService } from './auth.service';

// ============================================
// PASO 1: Define los roles (deben coincidir con Keycloak)
// ============================================
export const APP_ROLES = {
  ADMIN: 'ADMIN',
  CAJERO: 'CAJERO',
  VENDEDOR: 'VENDEDOR',
} as const;

export type AppRole = typeof APP_ROLES[keyof typeof APP_ROLES];

// ============================================
// PASO 2: Define los permisos por módulo
// ============================================
export const PERMISSIONS = {
  // DASHBOARD
  DASHBOARD: {
    VER: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
  },

  // PROVEEDORES - Solo ADMIN
  PROVEEDORES: {
    VER: [APP_ROLES.ADMIN],
    CREAR: [APP_ROLES.ADMIN],
    EDITAR: [APP_ROLES.ADMIN],
    ELIMINAR: [APP_ROLES.ADMIN],
  },

  // PAGOS PROVEEDOR - Solo ADMIN
  PAGOS_PROVEEDOR: {
    VER: [APP_ROLES.ADMIN],
    CREAR: [APP_ROLES.ADMIN],
  },

  // COMPRAS - Solo ADMIN
  COMPRAS: {
    VER: [APP_ROLES.ADMIN],
    CREAR: [APP_ROLES.ADMIN],
    DETALLE: [APP_ROLES.ADMIN],
  },

  // GRUPOS (Ingredientes y Platos) - Solo ADMIN
  GRUPOS: {
    VER: [APP_ROLES.ADMIN],
    CREAR: [APP_ROLES.ADMIN],
    EDITAR: [APP_ROLES.ADMIN],
    ELIMINAR: [APP_ROLES.ADMIN],
  },

  // INGREDIENTES - Solo ADMIN
  INGREDIENTES: {
    VER: [APP_ROLES.ADMIN],
    CREAR: [APP_ROLES.ADMIN],
    EDITAR: [APP_ROLES.ADMIN],
    ELIMINAR: [APP_ROLES.ADMIN],
  },

  // PLATOS - ADMIN puede todo, VENDEDOR/CAJERO solo ver
  PLATOS: {
    VER: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
    CREAR: [APP_ROLES.ADMIN],
    EDITAR: [APP_ROLES.ADMIN],
    ELIMINAR: [APP_ROLES.ADMIN],
    VER_RECETA: [APP_ROLES.ADMIN], // VENDEDOR/CAJERO NO pueden ver receta
  },

  // PROMOCIONES - ADMIN puede editar, VENDEDOR/CAJERO solo ver
  PROMOCIONES: {
    VER: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
    CREAR: [APP_ROLES.ADMIN],
    EDITAR: [APP_ROLES.ADMIN],
    ELIMINAR: [APP_ROLES.ADMIN],
  },

  // INVENTARIO - ADMIN puede todo, VENDEDOR/CAJERO solo ver stock
  INVENTARIO: {
    VER_STOCK: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
    AJUSTAR: [APP_ROLES.ADMIN],
    VER_KARDEX: [APP_ROLES.ADMIN],
  },

  // PEDIDOS - Todos pueden ver y crear, solo ADMIN puede anular
  PEDIDOS: {
    VER: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
    CREAR: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
    MARCAR_LISTO: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
    ENTREGAR: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
    ANULAR: [APP_ROLES.ADMIN],
    VER_DETALLE: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
  },

  // PAGOS CLIENTE - Todos pueden ver, CAJERO/ADMIN pueden crear y aprobar
  PAGOS_CLIENTE: {
    VER: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
    CREAR: [APP_ROLES.ADMIN, APP_ROLES.CAJERO],
    APROBAR: [APP_ROLES.ADMIN, APP_ROLES.CAJERO],
    RECHAZAR: [APP_ROLES.ADMIN],
  },
} as const;

// ============================================
// PASO 3: Helper para verificar permisos
// ============================================
export class PermissionService {
  /**
   * Verifica si el usuario tiene permiso para una acción
   *
   * @example
   * if (PermissionService.can('PLATOS', 'EDITAR')) {
   *   // Mostrar botón editar
   * }
   */
  static can(module: keyof typeof PERMISSIONS, action: string): boolean {
    const permission = (PERMISSIONS[module] as any)[action];
    if (!permission) {
      console.warn(`⚠️ Permiso no encontrado: ${module}.${action}`);
      return false;
    }
    return authService.hasAnyRole(permission);
  }

  /**
   * Verifica si el usuario puede acceder a un módulo (tiene al menos una acción)
   */
  static canAccessModule(module: keyof typeof PERMISSIONS): boolean {
    const modulePermissions = PERMISSIONS[module] as any;
    return Object.values(modulePermissions).some((roles: any) =>
      authService.hasAnyRole(roles)
    );
  }

  /**
   * Obtiene los roles del usuario
   */
  static getUserRoles(): string[] {
    return authService.getAllRoles();
  }

  /**
   * Helpers de roles específicos
   */
  static isAdmin(): boolean {
    return authService.hasRole(APP_ROLES.ADMIN);
  }

  static isCajero(): boolean {
    return authService.hasRole(APP_ROLES.CAJERO);
  }

  static isVendedor(): boolean {
    return authService.hasRole(APP_ROLES.VENDEDOR);
  }
}

// ============================================
// PASO 4: Configuración de navegación por rol
// ============================================
export interface MenuItem {
  label: string;
  route: string;
  icon?: string;
  requiredRoles: AppRole[];
  children?: MenuItem[];
}

/**
 * Menú de navegación con permisos
 * Define qué opciones del menú ve cada rol
 */
export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    route: '/',
    requiredRoles: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
  },
  {
    label: 'Pedidos',
    route: '/pedidos',
    requiredRoles: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
  },
  {
    label: 'Pagos Cliente',
    route: '/pagos-cliente',
    requiredRoles: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
  },
  {
    label: 'Platos',
    route: '/platos',
    requiredRoles: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
  },
  {
    label: 'Promociones',
    route: '/promo-programada',
    requiredRoles: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
  },
  {
    label: 'Inventario',
    route: '/inventario',
    requiredRoles: [APP_ROLES.ADMIN, APP_ROLES.CAJERO, APP_ROLES.VENDEDOR],
  },

  // Solo ADMIN ve estas secciones
  {
    label: 'Proveedores',
    route: '/proveedores',
    requiredRoles: [APP_ROLES.ADMIN],
  },
  {
    label: 'Pagos Proveedor',
    route: '/pago-proveedor',
    requiredRoles: [APP_ROLES.ADMIN],
  },
  {
    label: 'Compras',
    route: '/compras',
    requiredRoles: [APP_ROLES.ADMIN],
  },
  {
    label: 'Ingredientes',
    route: '/ingredientes',
    requiredRoles: [APP_ROLES.ADMIN],
  },
  {
    label: 'Grupos',
    route: '',
    requiredRoles: [APP_ROLES.ADMIN],
    children: [
      {
        label: 'Grupos Ingredientes',
        route: '/grupo-ingredientes',
        requiredRoles: [APP_ROLES.ADMIN],
      },
      {
        label: 'Grupos Platos',
        route: '/grupo-platos',
        requiredRoles: [APP_ROLES.ADMIN],
      },
    ],
  },
  {
    label: 'Kardex',
    route: '/kardex',
    requiredRoles: [APP_ROLES.ADMIN],
  },
];

/**
 * Helper para filtrar el menú según los roles del usuario
 */
export function getMenuForCurrentUser(): MenuItem[] {
  return MENU_ITEMS.filter(item =>
    authService.hasAnyRole(item.requiredRoles)
  ).map(item => ({
    ...item,
    children: item.children?.filter(child =>
      authService.hasAnyRole(child.requiredRoles)
    ),
  }));
}
