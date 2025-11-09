// Auth Service
export { authService } from './auth.service';

// Guards
export { roleGuard, requireAllRolesGuard } from './role.guard';

// Directives
export { HasRoleDirective } from './has-role.directive';

// Roles Configuration (Configuración centralizada)
export {
  APP_ROLES,
  PERMISSIONS,
  PermissionService,
  MENU_ITEMS,
  getMenuForCurrentUser
} from './roles.config';
export type { AppRole, MenuItem } from './roles.config';
