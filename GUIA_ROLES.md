# 🔐 Guía de Implementación de Roles

## 📋 Resumen de Roles

| Rol | Descripción |
|-----|-------------|
| **ADMIN** | Acceso total a todas las funcionalidades |
| **CAJERO** | Puede gestionar pedidos y pagos, ver inventario y platos (sin editar) |
| **VENDEDOR** | Similar a CAJERO pero con menos permisos en pagos |

---

## 🎯 Matriz de Permisos

### Dashboard
- ✅ Todos pueden ver

### Proveedores
- ✅ ADMIN: Ver, Crear, Editar, Eliminar
- ❌ CAJERO/VENDEDOR: Sin acceso

### Pagos Proveedor
- ✅ ADMIN: Ver, Crear
- ❌ CAJERO/VENDEDOR: Sin acceso

### Compras
- ✅ ADMIN: Ver, Crear, Detalle
- ❌ CAJERO/VENDEDOR: Sin acceso

### Ingredientes y Grupos
- ✅ ADMIN: Ver, Crear, Editar, Eliminar
- ❌ CAJERO/VENDEDOR: Sin acceso

### Platos
- ✅ ADMIN: Ver, Crear, Editar, Eliminar, Ver Receta
- 👁️ CAJERO/VENDEDOR: Solo Ver (sin botones de editar/eliminar, sin ver receta)

### Promociones
- ✅ ADMIN: Ver, Crear, Editar, Eliminar
- 👁️ CAJERO/VENDEDOR: Solo Ver (sin botones de editar/eliminar)

### Inventario
- ✅ ADMIN: Ver Stock, Ajustar, Ver Kardex
- 👁️ CAJERO/VENDEDOR: Solo Ver Stock (sin botones de ajustar)

### Pedidos
- ✅ Todos: Ver, Crear, Marcar Listo, Entregar, Ver Detalle
- ✅ ADMIN: Anular (solo ADMIN puede anular pedidos)

### Pagos Cliente
- ✅ ADMIN/CAJERO: Ver, Crear, Aprobar
- ✅ ADMIN: Rechazar
- 👁️ VENDEDOR: Solo Ver

---

## 🛠️ Cómo Implementar

### 1️⃣ En las Rutas (app.routes.ts)

```typescript
import { roleGuard } from './core/auth/role.guard';
import { PERMISSIONS } from './core/auth/roles.config';

// Ejemplo: Proteger una ruta completa
{
  path: 'proveedores',
  loadComponent: () => import('./pages/proveedores/...'),
  canActivate: [roleGuard(PERMISSIONS.PROVEEDORES.VER)]
},

// Ejemplo: Rutas que solo ADMIN puede acceder
{
  path: 'ingredientes',
  loadComponent: () => import('./pages/ingredientes/...'),
  canActivate: [roleGuard(PERMISSIONS.INGREDIENTES.VER)]
},

// Ejemplo: Rutas que todos pueden ver
{
  path: 'pedidos',
  loadComponent: () => import('./pages/pedidos/...'),
  canActivate: [roleGuard(PERMISSIONS.PEDIDOS.VER)]
}
```

### 2️⃣ En los Templates (HTML)

Usa la directiva `*hasRole`:

```html
<!-- Botón solo visible para ADMIN -->
<button *hasRole="['ADMIN']" (click)="editar()">
  Editar
</button>

<!-- Botón visible para ADMIN y CAJERO -->
<button *hasRole="['ADMIN', 'CAJERO']" (click)="aprobar()">
  Aprobar Pago
</button>

<!-- Sección completa solo para ADMIN -->
<div *hasRole="['ADMIN']">
  <h3>Panel de Administración</h3>
  <!-- contenido solo para ADMIN -->
</div>
```

**Usando el PermissionService:**

```html
<!-- En el componente TypeScript -->
import { PermissionService } from '../../core/auth/roles.config';

canEdit = PermissionService.can('PLATOS', 'EDITAR');
canDelete = PermissionService.can('PLATOS', 'ELIMINAR');

<!-- En el template -->
<button *ngIf="canEdit" (click)="editar()">Editar</button>
<button *ngIf="canDelete" (click)="eliminar()">Eliminar</button>
```

### 3️⃣ En los Componentes (TypeScript)

```typescript
import { Component, OnInit } from '@angular/core';
import { PermissionService } from '../../core/auth/roles.config';
import { HasRoleDirective } from '../../core/auth/has-role.directive';

@Component({
  selector: 'app-platos',
  standalone: true,
  imports: [CommonModule, HasRoleDirective], // ⚠️ Importar la directiva
  templateUrl: './platos.component.html'
})
export class PlatosComponent implements OnInit {

  // Verifica permisos en el código
  ngOnInit() {
    if (PermissionService.can('PLATOS', 'EDITAR')) {
      console.log('Usuario puede editar platos');
    }

    if (PermissionService.isAdmin()) {
      console.log('Usuario es ADMIN');
    }
  }

  // Protege métodos
  onEditar(id: number) {
    if (!PermissionService.can('PLATOS', 'EDITAR')) {
      alert('No tienes permisos para editar');
      return;
    }
    // ... lógica de edición
  }
}
```

### 4️⃣ Ocultar Botones en Tablas

```html
<!-- En una tabla de platos -->
<table class="table">
  <thead>
    <tr>
      <th>Nombre</th>
      <th>Precio</th>
      <th *hasRole="['ADMIN']">Acciones</th> <!-- Columna solo para ADMIN -->
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let plato of platos">
      <td>{{ plato.nombre }}</td>
      <td>{{ plato.precio }}</td>
      <td *hasRole="['ADMIN']"> <!-- Botones solo para ADMIN -->
        <button (click)="editar(plato.id)">Editar</button>
        <button (click)="eliminar(plato.id)">Eliminar</button>
      </td>
    </tr>
  </tbody>
</table>
```

### 5️⃣ Ocultar Links en el Menú (Sidebar)

El menú ya está configurado en `roles.config.ts` con `MENU_ITEMS`.

Usa la función `getMenuForCurrentUser()` para obtener solo los items que el usuario puede ver:

```typescript
import { getMenuForCurrentUser } from './core/auth/roles.config';

export class SidebarComponent {
  menuItems = getMenuForCurrentUser();
}
```

---

## 📝 Ejemplos Prácticos

### Ejemplo 1: Ocultar botón "Ver Receta" en lista de platos

```html
<!-- platos.component.html -->
<button
  *hasRole="['ADMIN']"
  (click)="verReceta(plato.id)"
  class="btn"
  data-variant="secondary">
  Ver Receta
</button>
```

### Ejemplo 2: Deshabilitar botón "Ajustar" en inventario

```html
<!-- inventario.component.html -->
<button
  *hasRole="['ADMIN']"
  (click)="ajustar()"
  class="btn"
  data-variant="primary">
  Ajustar Inventario
</button>

<!-- Mensaje para usuarios sin permiso -->
<p *hasRole="['CAJERO', 'VENDEDOR']" class="text-muted">
  Solo puedes consultar el stock
</p>
```

### Ejemplo 3: Ocultar columna de acciones

```html
<!-- promociones.component.html -->
<table class="table">
  <thead>
    <tr>
      <th>Plato</th>
      <th>Descuento</th>
      <th>Vigencia</th>
      <th *hasRole="['ADMIN']">Acciones</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let promo of promociones">
      <td>{{ promo.platoNombre }}</td>
      <td>{{ promo.descuentoPct }}%</td>
      <td>{{ promo.vigenciaDesde }} - {{ promo.vigenciaHasta }}</td>
      <td *hasRole="['ADMIN']">
        <button (click)="editar(promo.id)">Editar</button>
        <button (click)="eliminar(promo.id)">Eliminar</button>
      </td>
    </tr>
  </tbody>
</table>
```

### Ejemplo 4: Proteger navegación programática

```typescript
// En un componente
import { Router } from '@angular/router';
import { PermissionService } from '../../core/auth/roles.config';

constructor(private router: Router) {}

irAReceta(platoId: number) {
  if (!PermissionService.can('PLATOS', 'VER_RECETA')) {
    alert('No tienes permisos para ver recetas');
    return;
  }
  this.router.navigate(['/platos', platoId, 'receta']);
}
```

---

## ✅ Checklist de Implementación

### En Keycloak
- [ ] Crear roles: ADMIN, CAJERO, VENDEDOR
- [ ] Asignar roles a usuarios de prueba

### En el Código
- [ ] Proteger rutas en `app.routes.ts` con `roleGuard`
- [ ] Ocultar botones de editar/eliminar en listas (platos, promociones, inventario)
- [ ] Ocultar link "Ver Receta" en platos
- [ ] Ocultar módulos completos en sidebar (proveedores, compras, ingredientes, grupos, kardex)
- [ ] Ocultar botón "Ajustar" en inventario
- [ ] Permitir solo ADMIN anular pedidos
- [ ] Permitir solo ADMIN rechazar pagos

### Testing
- [ ] Probar con usuario ADMIN (debe ver todo)
- [ ] Probar con usuario CAJERO (debe ver limitado)
- [ ] Probar con usuario VENDEDOR (debe ver más limitado)
- [ ] Verificar que los guards bloquean rutas correctamente
- [ ] Verificar que los botones se ocultan correctamente

---

## 🎨 Próximo Paso: Mejorar Dashboard

Una vez implementados los roles, vamos a mejorar el dashboard con los colores de la marca:

**Colores principales:**
- Brand: `#075056` (Deep Sea Green)
- Accent: `#ff5b04` (Blaze Orange)
- Success: Verde
- Warning: Amarillo

Podemos crear tarjetas (cards) con estadísticas por rol:
- **ADMIN**: Ve todo (ventas, compras, inventario, pedidos)
- **CAJERO**: Ve ventas, pedidos pendientes, pagos del día
- **VENDEDOR**: Ve pedidos, stock bajo, promociones activas
