# ✅ Implementación de Roles - COMPLETADA

## Resumen Ejecutivo

Se ha implementado un sistema completo de control de acceso basado en roles (RBAC) para la aplicación FastFood, con 3 roles principales: **ADMIN**, **CAJERO** y **VENDEDOR**.

---

## 🎯 Roles Implementados

### 1. ADMIN (Administrador)
- **Acceso**: Completo a todas las funcionalidades
- **Puede**: Ver, crear, editar, eliminar en todos los módulos
- **Módulos exclusivos**: Proveedores, Compras, Ingredientes, Grupos, Kardex

### 2. CAJERO
- **Acceso**: Operaciones de venta y atención al cliente
- **Puede**: Crear pedidos, registrar pagos, ver stock, ver platos y promociones
- **No puede**: Editar platos, ver recetas, ajustar inventario, acceder a módulos administrativos

### 3. VENDEDOR
- **Acceso**: Operaciones básicas de venta
- **Puede**: Crear pedidos, ver stock, ver platos y promociones
- **No puede**: Registrar pagos, editar platos, ver recetas, ajustar inventario, acceder a módulos administrativos

---

## 📁 Archivos Creados/Modificados

### ✨ Nuevos Archivos

1. **`src/app/core/auth/roles.config.ts`**
   - Configuración centralizada de roles y permisos
   - Define APP_ROLES, PERMISSIONS, PermissionService
   - Incluye MENU_ITEMS con permisos por rol
   - **NO QUEMAR CÓDIGO**: Todos los permisos se definen aquí una sola vez

2. **`GUIA_ROLES.md`**
   - Guía completa de implementación
   - Matriz de permisos por rol
   - Ejemplos de uso en rutas, templates y componentes
   - Checklist de implementación

### 🔄 Archivos Modificados

1. **`src/app/core/auth/index.ts`**
   - Exporta PermissionService, PERMISSIONS, APP_ROLES, etc.

2. **`src/app/app.routes.ts`**
   - Todas las rutas protegidas con `roleGuard`
   - Guards aplicados según PERMISSIONS

3. **`src/app/pages/home/home-dashboard.component.ts`**
   - Dashboard mejorado con colores de marca
   - Métricas filtradas por rol
   - Stock bajo visible para todos

4. **`src/app/pages/home/home-dashboard.component.html`**
   - Diseño renovado con colores de marca
   - Tarjetas con gradientes y bordes de color
   - Acciones rápidas filtradas por rol

5. **`src/app/pages/platos/plato/list/plato.component.html`**
   - Botones "Nuevo", "Editar" y "Ver Receta" ocultos para CAJERO/VENDEDOR
   - Solo ADMIN ve estos botones

6. **`src/app/pages/platos/plato/list/plato.component.ts`**
   - Importa HasRoleDirective

---

## 🔐 Matriz de Permisos Completa

| Módulo | Ver | Crear | Editar | Eliminar | Extras |
|--------|-----|-------|--------|----------|--------|
| **Dashboard** | Todos | - | - | - | - |
| **Proveedores** | ADMIN | ADMIN | ADMIN | ADMIN | - |
| **Pagos Proveedor** | ADMIN | ADMIN | - | - | - |
| **Compras** | ADMIN | ADMIN | ADMIN | - | Detalle: ADMIN |
| **Grupos** | ADMIN | ADMIN | ADMIN | ADMIN | - |
| **Ingredientes** | ADMIN | ADMIN | ADMIN | ADMIN | - |
| **Platos** | Todos | ADMIN | ADMIN | ADMIN | Ver Receta: ADMIN |
| **Promociones** | Todos | ADMIN | ADMIN | ADMIN | - |
| **Inventario** | Todos (stock) | - | - | - | Ajustar: ADMIN, Kardex: ADMIN |
| **Pedidos** | Todos | Todos | - | - | Anular: ADMIN |
| **Pagos Cliente** | Todos | ADMIN/CAJERO | - | - | Aprobar: ADMIN/CAJERO, Rechazar: ADMIN |

---

## 🛠️ Cómo Usar

### En las Rutas (app.routes.ts)

```typescript
import { roleGuard } from './core/auth/role.guard';
import { PERMISSIONS } from './core/auth/roles.config';

{
  path: 'platos',
  loadComponent: () => import('./pages/platos/...'),
  canActivate: [roleGuard(PERMISSIONS.PLATOS.VER)]
}
```

### En los Templates (HTML)

```html
<!-- Ocultar botón para no-ADMIN -->
<button *hasRole="['ADMIN']" (click)="editar()">
  Editar
</button>

<!-- Visible para ADMIN y CAJERO -->
<button *hasRole="['ADMIN', 'CAJERO']" (click)="crear()">
  Crear Pago
</button>
```

### En los Componentes (TypeScript)

```typescript
import { PermissionService } from './core/auth';
import { HasRoleDirective } from './core/auth';

@Component({
  imports: [CommonModule, HasRoleDirective], // ⚠️ Importar directiva
})
export class MiComponente {

  canEdit = PermissionService.can('PLATOS', 'EDITAR');

  onAction() {
    if (!PermissionService.can('PLATOS', 'ELIMINAR')) {
      alert('Sin permisos');
      return;
    }
    // ... acción
  }
}
```

---

## 🎨 Dashboard Mejorado

### Colores de Marca Aplicados

- **Brand (#075056)**: Verde oscuro - Pedidos, títulos principales
- **Accent (#ff5b04)**: Naranja - Pedidos listos, CTAs secundarios
- **Success (Verde)**: Ventas, pedidos entregados
- **Warning (Amarillo)**: Stock bajo, pedidos pendientes

### Métricas por Rol

#### Todos los roles ven:
1. **Pedidos del Día** (Brand)
2. **Pedidos Listos** (Accent)
3. **Stock Bajo** (Warning)

#### Solo ADMIN y CAJERO ven:
4. **Ventas del Día** (Success)

### Acciones Rápidas Filtradas

- Nuevo Pedido: Todos
- Ver Pedidos: Todos
- Ver Stock: Todos
- Ver Platos: Todos
- Pagos Cliente: ADMIN/CAJERO
- Kardex: ADMIN
- Compras: ADMIN
- Promociones: Todos

---

## ✅ Checklist de Implementación

### Completado ✅

- [x] Archivo de configuración `roles.config.ts` creado
- [x] Guards aplicados a todas las rutas en `app.routes.ts`
- [x] Dashboard rediseñado con colores de marca
- [x] Métricas filtradas por rol en dashboard
- [x] Botones ocultos en lista de Platos
- [x] Directiva `HasRoleDirective` importada
- [x] Documentación completa en `GUIA_ROLES.md`

### Pendiente (Para siguientes iteraciones) 🔄

- [ ] Configurar roles en Keycloak
- [ ] Asignar roles a usuarios de prueba
- [ ] Ocultar botones en Promociones
- [ ] Ocultar botón "Ajustar" en Inventario
- [ ] Ocultar botón "Anular" en Pedidos (solo para ADMIN)
- [ ] Ocultar columna "Acciones" completa para CAJERO/VENDEDOR
- [ ] Testing con cada rol
- [ ] Actualizar menú lateral con `getMenuForCurrentUser()`

---

## 📝 Próximos Pasos

### 1. Configurar Keycloak

Ir a Keycloak Admin Console → Realm `fastfood` → Client `web-fastfood` → Roles:

```
Crear 3 roles:
- ADMIN
- CAJERO
- VENDEDOR
```

Luego asignar a usuarios en: Users → [Usuario] → Role Mapping

### 2. Aplicar permisos en más vistas

**Promociones:**
```html
<!-- promo-programada-list.component.html -->
<ui-button *hasRole="['ADMIN']" label="Nuevo" ...></ui-button>
<ui-button *hasRole="['ADMIN']" label="Editar" ...></ui-button>
<ui-button *hasRole="['ADMIN']" label="Eliminar" ...></ui-button>
```

**Inventario:**
```html
<!-- inventario-stock.component.html -->
<ui-button *hasRole="['ADMIN']" label="Ajustar" ...></ui-button>
```

**Pedidos:**
```html
<!-- pedido.component.html -->
<ui-button *hasRole="['ADMIN']" label="Anular" ...></ui-button>
```

### 3. Actualizar Sidebar

Usar la función `getMenuForCurrentUser()` para filtrar el menú automáticamente según el rol del usuario.

---

## 🎓 Recursos

- **Guía Completa**: Ver `GUIA_ROLES.md`
- **Configuración**: Ver `src/app/core/auth/roles.config.ts`
- **Ejemplos**: Ver `src/app/pages/platos/plato/list/plato.component.html`

---

## 🔒 Seguridad

- ✅ Guards en rutas impiden acceso directo por URL
- ✅ Directivas ocultan elementos del DOM
- ✅ Backend debe validar permisos (nunca confiar solo en frontend)
- ✅ Tokens JWT con roles en Keycloak

---

## 📊 Estadísticas

- **Rutas protegidas**: 35+
- **Permisos definidos**: 40+
- **Roles**: 3
- **Vistas actualizadas**: 2 (Platos, Dashboard)
- **Archivos de configuración**: 1 centralizado

---

**Fecha de implementación**: 2025-01-09
**Versión**: 1.0.0
**Estado**: ✅ Implementación Base Completada
