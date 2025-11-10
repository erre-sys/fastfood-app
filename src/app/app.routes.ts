import { Routes } from '@angular/router';
import AppShellComponent from './core/layout/app-shell/app-shell.component';
import { roleGuard } from './core/auth/role.guard';
import { PERMISSIONS } from './core/auth/roles.config';

export const routes: Routes = [
  // UNAUTHORIZED - Sin protección (debe ser accesible sin roles)
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized.component').then(
        (m) => m.default
      ),
  },

  {
    path: '',
    component: AppShellComponent,
    children: [
      // DASHBOARD - Todos pueden acceder
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/home/home-dashboard.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.DASHBOARD.VER)]
      },

      // PROVEEDORES - Solo ADMIN
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./pages/proveedores/proveedor/list/proveedor.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PROVEEDORES.VER)]
      },
      {
        path: 'proveedores/nuevo',
        loadComponent: () =>
          import(
            './pages/proveedores/proveedor/form/proveedor-form.component'
          ).then((m) => m.default),
        canActivate: [roleGuard(PERMISSIONS.PROVEEDORES.CREAR)]
      },
      {
        path: 'proveedores/:id/editar',
        loadComponent: () =>
          import(
            './pages/proveedores/proveedor/form/proveedor-form.component'
          ).then((m) => m.default),
        canActivate: [roleGuard(PERMISSIONS.PROVEEDORES.EDITAR)]
      },

      // PAGOS PROVEEDOR - Solo ADMIN
      {
        path: 'pago-proveedor',
        loadComponent: () =>
          import('./pages/proveedores/pago/list/pago-proveedor.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PAGOS_PROVEEDOR.VER)]
      },
      {
        path: 'pago-proveedor/nuevo',
        loadComponent: () =>
          import('./pages/proveedores/pago/form/pago-proveedor-form.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PAGOS_PROVEEDOR.CREAR)]
      },
      {
        path: 'pago-proveedor/:id/nuevo',
        loadComponent: () =>
          import('./pages/proveedores/pago/form/pago-proveedor-form.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PAGOS_PROVEEDOR.CREAR)]
      },

      // COMPRAS - Solo ADMIN
      {
        path: 'compras',
        loadComponent: () =>
          import('./pages/compras/list/compra.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.COMPRAS.VER)]
      },
      {
        path: 'compras/nuevo',
        loadComponent: () =>
          import('./pages/compras/form/compra-form.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.COMPRAS.CREAR)]
      },
      {
        path: 'compras/:id/detalle',
        loadComponent: () =>
          import('./pages/compras/detail/compra-detail.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.COMPRAS.DETALLE)]
      },

      // GRUPOS INGREDIENTES - Solo ADMIN
      {
        path: 'grupo-ingredientes',
        loadComponent: () =>
          import(
            './pages/ingredientes/grupo-ingrediente/list/grupo-ingrediente.component'
          ).then((m) => m.default),
        canActivate: [roleGuard(PERMISSIONS.GRUPOS.VER)]
      },
      {
        path: 'grupo-ingredientes/nuevo',
        loadComponent: () =>
          import(
            './pages/ingredientes/grupo-ingrediente/form/grupo-ingrediente-form.component'
          ).then((m) => m.default),
        canActivate: [roleGuard(PERMISSIONS.GRUPOS.CREAR)]
      },
      {
        path: 'grupo-ingredientes/:id/editar',
        loadComponent: () =>
          import(
            './pages/ingredientes/grupo-ingrediente/form/grupo-ingrediente-form.component'
          ).then((m) => m.default),
        canActivate: [roleGuard(PERMISSIONS.GRUPOS.EDITAR)]
      },

      // INGREDIENTES - Solo ADMIN
      {
        path: 'ingredientes',
        loadComponent: () =>
          import(
            './pages/ingredientes/ingrediente/list/ingrediente.component'
          ).then((m) => m.default),
        canActivate: [roleGuard(PERMISSIONS.INGREDIENTES.VER)]
      },
      {
        path: 'ingredientes/nuevo',
        loadComponent: () =>
          import(
            './pages/ingredientes/ingrediente/form/ingrediente-form.component'
          ).then((m) => m.default),
        canActivate: [roleGuard(PERMISSIONS.INGREDIENTES.CREAR)]
      },
      {
        path: 'ingredientes/:id/editar',
        loadComponent: () =>
          import(
            './pages/ingredientes/ingrediente/form/ingrediente-form.component'
          ).then((m) => m.default),
        canActivate: [roleGuard(PERMISSIONS.INGREDIENTES.EDITAR)]
      },

      // GRUPOS PLATOS - Solo ADMIN
      {
        path: 'grupo-platos',
        loadComponent: () =>
          import('./pages/platos/grupo-plato/list/grupo-plato.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.GRUPOS.VER)]
      },
      {
        path: 'grupo-platos/nuevo',
        loadComponent: () =>
          import(
            './pages/platos/grupo-plato/form/grupo-plato-form.component'
          ).then((m) => m.default),
        canActivate: [roleGuard(PERMISSIONS.GRUPOS.CREAR)]
      },
      {
        path: 'grupo-platos/:id/editar',
        loadComponent: () =>
          import(
            './pages/platos/grupo-plato/form/grupo-plato-form.component'
          ).then((m) => m.default),
        canActivate: [roleGuard(PERMISSIONS.GRUPOS.EDITAR)]
      },

      // PLATOS - Todos pueden ver, solo ADMIN puede crear/editar
      {
        path: 'platos',
        loadComponent: () =>
          import('./pages/platos/plato/list/plato.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PLATOS.VER)]
      },
      {
        path: 'platos/rentabilidad',
        loadComponent: () =>
          import('./pages/platos/rentabilidad/rentabilidad-list.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PLATOS.VER)]
      },
      {
        path: 'platos/nuevo',
        loadComponent: () =>
          import('./pages/platos/plato/form/plato-form.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PLATOS.CREAR)]
      },
      {
        path: 'platos/:id/editar',
        loadComponent: () =>
          import('./pages/platos/plato/form/plato-form.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PLATOS.EDITAR)]
      },
      {
        path: 'platos/:id/receta',
        loadComponent: () =>
          import('./pages/platos/receta/receta.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PLATOS.VER_RECETA)]
      },

      // PROMOCIONES - Todos pueden ver, solo ADMIN puede crear/editar
      {
        path: 'promo-programada',
        loadComponent: () =>
          import('./pages/platos/promo-programada/list/promo-programada-list.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PROMOCIONES.VER)]
      },
      {
        path: 'promo-programada/nuevo',
        loadComponent: () =>
          import('./pages/platos/promo-programada/form/promo-programada-form.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PROMOCIONES.CREAR)]
      },
      {
        path: 'promo-programada/:id/editar',
        loadComponent: () =>
          import('./pages/platos/promo-programada/form/promo-programada-form.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PROMOCIONES.EDITAR)]
      },

      // INVENTARIO - Todos pueden ver stock, solo ADMIN puede ajustar
      {
        path: 'inventario/ajustar',
        loadComponent: () =>
          import('./pages/inventario/ajuste/ajuste-inventario.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.INVENTARIO.AJUSTAR)]
      },
      {
        path: 'inventario/stock',
        loadComponent: () =>
          import('./pages/inventario/stock/inventario-stock.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.INVENTARIO.VER_STOCK)]
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./pages/inventario/stock/inventario-stock.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.INVENTARIO.VER_STOCK)]
      },
      {
        path: 'kardex',
        loadComponent: () =>
          import('./pages/inventario/movimientos/inventario-movimientos.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.INVENTARIO.VER_KARDEX)]
      },

      // PAGOS CLIENTE - Todos pueden ver, ADMIN/CAJERO pueden crear
      {
        path: 'pagos-cliente',
        loadComponent: () =>
          import('./pages/pagos-cliente/list/pago-cliente.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PAGOS_CLIENTE.VER)]
      },
      {
        path: 'pagos-cliente/nuevo',
        loadComponent: () =>
          import('./pages/pagos-cliente/form/pago-cliente-form.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PAGOS_CLIENTE.CREAR)]
      },
      {
        path: 'pagos-cliente/:pedidoId/nuevo',
        loadComponent: () =>
          import('./pages/pagos-cliente/form/pago-cliente-form.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PAGOS_CLIENTE.CREAR)]
      },
      {
        path: 'pagos-cliente/:id/detalle',
        loadComponent: () =>
          import('./pages/pagos-cliente/detail/pago-cliente-detail.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PAGOS_CLIENTE.VER)]
      },

      // PEDIDOS - Todos pueden ver y crear
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./pages/pedidos/list/pedido.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PEDIDOS.VER)]
      },
      {
        path: 'pedidos/nuevo',
        loadComponent: () =>
          import('./pages/pedidos/form/pedido-form.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PEDIDOS.CREAR)]
      },
      {
        path: 'pedidos/:id/detalle',
        loadComponent: () =>
          import('./pages/pedidos/detail/pedido-detail.component').then(
            (m) => m.default
          ),
        canActivate: [roleGuard(PERMISSIONS.PEDIDOS.VER_DETALLE)]
      },

      { path: '**', redirectTo: '' },
    ],
  },
];
