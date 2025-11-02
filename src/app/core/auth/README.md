# Sistema de Roles y Permisos con Keycloak

Este módulo integra Keycloak para manejar autenticación, autorización y control de acceso basado en roles (RBAC).

## 📋 Configuración en Keycloak

### 1. Crear Roles en Keycloak

Ve a tu **Realm** → **Roles** → **Create Role** y crea los siguientes roles:

- `ADMIN` - Acceso total al sistema
- `CAJERO` - Gestión de pedidos y pagos
- `COCINERO` - Ver y preparar pedidos
- `INVENTARIO` - Gestión de compras e inventario
- `REPORTES` - Acceso solo lectura a reportes

### 2. Asignar Roles a Usuarios

**Realm** → **Users** → [Seleccionar usuario] → **Role Mappings** → Asignar roles

---

## 🚀 Uso en el Frontend

### 1. Proteger Rutas con Guards

En `app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { roleGuard } from './core/auth';

export const routes: Routes = [
  // Ruta accesible solo para ADMIN
  {
    path: 'compras',
    loadComponent: () => import('./pages/compras/list/compra.component'),
    canActivate: [roleGuard(['ADMIN', 'INVENTARIO'])]
  },

  // Ruta accesible solo para ADMIN o CAJERO
  {
    path: 'pedidos',
    loadComponent: () => import('./pages/pedidos/list/pedido.component'),
    canActivate: [roleGuard(['ADMIN', 'CAJERO'])]
  },

  // Ruta que requiere TODOS los roles especificados
  {
    path: 'admin/config',
    loadComponent: () => import('./pages/admin/config.component'),
    canActivate: [requireAllRolesGuard(['ADMIN', 'SUPER_USER'])]
  }
];
```

### 2. Mostrar/Ocultar Elementos en UI

Importa la directiva en tu componente:

```typescript
import { HasRoleDirective } from '../../core/auth';

@Component({
  selector: 'app-pedidos-list',
  imports: [HasRoleDirective, /* otros imports */],
  // ...
})
```

Úsala en el template:

```html
<!-- Mostrar solo para ADMIN -->
<button *hasRole="'ADMIN'" (click)="deleteAll()">
  Eliminar Todo
</button>

<!-- Mostrar para ADMIN o CAJERO -->
<div *hasRole="['ADMIN', 'CAJERO']">
  <h3>Panel de Ventas</h3>
  <button (click)="crearPedido()">Nuevo Pedido</button>
</div>

<!-- Requerir TODOS los roles (ADMIN Y SUPER_USER) -->
<section *hasRole="['ADMIN', 'SUPER_USER']" [hasRoleRequireAll]="true">
  <h2>Configuración Avanzada</h2>
</section>

<!-- Ocultar para COCINERO -->
<div *hasRole="['ADMIN', 'CAJERO', 'INVENTARIO']">
  <!-- Los cocineros NO verán esto -->
  <button>Ajustar Precios</button>
</div>
```

### 3. Usar en Componentes TypeScript

```typescript
import { authService } from '../../core/auth/auth.service';

export class MiComponente {
  // Verificar un rol específico
  esAdmin(): boolean {
    return authService.hasRole('ADMIN');
  }

  // Verificar múltiples roles (al menos uno)
  puedeGestionarPedidos(): boolean {
    return authService.hasAnyRole(['ADMIN', 'CAJERO']);
  }

  // Verificar todos los roles
  esAdminCompleto(): boolean {
    return authService.hasAllRoles(['ADMIN', 'SUPER_USER']);
  }

  // Obtener todos los roles del usuario
  mostrarRoles(): void {
    const roles = authService.getAllRoles();
    console.log('Roles del usuario:', roles);
  }
}
```

---

## 📝 API del AuthService

### Métodos de Roles

| Método | Descripción | Ejemplo |
|--------|-------------|---------|
| `hasRole(role)` | Verifica si tiene un rol | `authService.hasRole('ADMIN')` |
| `hasAnyRole(roles)` | Verifica si tiene al menos uno | `authService.hasAnyRole(['ADMIN', 'CAJERO'])` |
| `hasAllRoles(roles)` | Verifica si tiene todos | `authService.hasAllRoles(['ADMIN', 'SUPER'])` |
| `getAllRoles()` | Obtiene todos los roles | `authService.getAllRoles()` |
| `getRealmRoles()` | Obtiene roles del realm | `authService.getRealmRoles()` |
| `getClientRoles()` | Obtiene roles del cliente | `authService.getClientRoles()` |

### Métodos Existentes

| Método | Descripción |
|--------|-------------|
| `token()` | Obtiene el token JWT |
| `logout()` | Cierra sesión |
| `profile()` | Obtiene perfil del usuario |
| `getSub()` | Obtiene el ID único del usuario |

---

## 🎯 Roles Sugeridos para Fast-Food App

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso total |
| **CAJERO** | Pedidos, Pagos, Entregas |
| **COCINERO** | Ver pedidos, Marcar como listo |
| **INVENTARIO** | Compras, Ajustes de inventario |
| **REPORTES** | Solo lectura de dashboards |

---

## ⚠️ Importante

- **La seguridad real está en el backend**: Los guards y directivas solo mejoran la UX
- **Siempre valida en el backend**: Cada endpoint debe verificar roles
- **Keycloak maneja todo**: No guardes roles en localStorage manualmente
- **Los tokens se refrescan automáticamente**: El servicio ya lo hace cada 10 segundos

---

## 🔍 Debugging

```typescript
// Ver el token decodificado (incluye roles)
console.log(authService['kc']?.tokenParsed);

// Ver solo roles
console.log('Realm Roles:', authService.getRealmRoles());
console.log('Client Roles:', authService.getClientRoles());
console.log('All Roles:', authService.getAllRoles());
```
