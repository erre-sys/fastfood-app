import { Routes } from '@angular/router';
import AppShellComponent from './core/layout/app-shell/app-shell.component';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/home/home-dashboard.component').then(
            (m) => m.default
          ),
      },

      {
        path: 'proveedores',
        loadComponent: () =>
          import('./pages/proveedores/proveedor/list/proveedor.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'proveedores/nuevo',
        loadComponent: () =>
          import(
            './pages/proveedores/proveedor/form/proveedor-form.component'
          ).then((m) => m.default)
      },
      {
        path: 'proveedores/:id/editar',
        loadComponent: () =>
          import(
            './pages/proveedores/proveedor/form/proveedor-form.component'
          ).then((m) => m.default)
      },

      {
        path: 'pago-proveedor',
        loadComponent: () =>
          import('./pages/proveedores/pago/list/pago-proveedor.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'pago-proveedor/nuevo',
        loadComponent: () =>
          import('./pages/proveedores/pago/form/pago-proveedor-form.component').then(
            (m) => m.default
          ),
      },
{
        path: 'pago-proveedor/:id/nuevo',
        loadComponent: () =>
          import('./pages/proveedores/pago/form/pago-proveedor-form.component').then(
            (m) => m.default
          ),
      },


      // COMPRAS - Acceso: ADMIN, INVENTARIO
      {
        path: 'compras',
        loadComponent: () =>
          import('./pages/compras/list/compra.component').then(
            (m) => m.default
          )
      },
      {
        path: 'compras/nuevo',
        loadComponent: () =>
          import('./pages/compras/form/compra-form.component').then(
            (m) => m.default
          )
      },
      {
        path: 'compras/:id/detalle',
        loadComponent: () =>
          import('./pages/compras/detail/compra-detail.component').then(
            (m) => m.default
          )
      },

      {
        path: 'grupo-ingredientes',
        loadComponent: () =>
          import(
            './pages/ingredientes/grupo-ingrediente/list/grupo-ingrediente.component'
          ).then((m) => m.default),
      },
      {
        path: 'grupo-ingredientes/nuevo',
        loadComponent: () =>
          import(
            './pages/ingredientes/grupo-ingrediente/form/grupo-ingrediente-form.component'
          ).then((m) => m.default),
      },
      {
        path: 'grupo-ingredientes/:id/editar',
        loadComponent: () =>
          import(
            './pages/ingredientes/grupo-ingrediente/form/grupo-ingrediente-form.component'
          ).then((m) => m.default),
      },

      {
        path: 'ingredientes',
        loadComponent: () =>
          import(
            './pages/ingredientes/ingrediente/list/ingrediente.component'
          ).then((m) => m.default),
      },
      {
        path: 'ingredientes/nuevo',
        loadComponent: () =>
          import(
            './pages/ingredientes/ingrediente/form/ingrediente-form.component'
          ).then((m) => m.default),
      },
      {
        path: 'ingredientes/:id/editar',
        loadComponent: () =>
          import(
            './pages/ingredientes/ingrediente/form/ingrediente-form.component'
          ).then((m) => m.default),
      },

      {
        path: 'grupo-platos',
        loadComponent: () =>
          import('./pages/platos/grupo-plato/list/grupo-plato.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'grupo-platos/nuevo',
        loadComponent: () =>
          import(
            './pages/platos/grupo-plato/form/grupo-plato-form.component'
          ).then((m) => m.default),
      },
      {
        path: 'grupo-platos/:id/editar',
        loadComponent: () =>
          import(
            './pages/platos/grupo-plato/form/grupo-plato-form.component'
          ).then((m) => m.default),
      },

      {
        path: 'platos',
        loadComponent: () =>
          import('./pages/platos/plato/list/plato.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'platos/nuevo',
        loadComponent: () =>
          import('./pages/platos/plato/form/plato-form.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'platos/:id/editar',
        loadComponent: () =>
          import('./pages/platos/plato/form/plato-form.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'platos/:id/receta',
        loadComponent: () =>
          import('./pages/platos/receta/receta.component').then(
            (m) => m.default
          ),
      },

      {
        path: 'promo-programada',
        loadComponent: () =>
          import('./pages/platos/promo-programada/list/promo-programada-list.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'promo-programada/nuevo',
        loadComponent: () =>
          import('./pages/platos/promo-programada/form/promo-programada-form.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'promo-programada/:id/editar',
        loadComponent: () =>
          import('./pages/platos/promo-programada/form/promo-programada-form.component').then(
            (m) => m.default
          ),
      },

      // INVENTARIO - Acceso: ADMIN, INVENTARIO
      {
        path: 'inventario/ajustar',
        loadComponent: () =>
          import('./pages/inventario/ajuste/ajuste-inventario.component').then(
            (m) => m.default
          )
      },
      {
        path: 'inventario/stock',
        loadComponent: () =>
          import('./pages/inventario/stock/inventario-stock.component').then(
            (m) => m.default
          )
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./pages/inventario/stock/inventario-stock.component').then(
            (m) => m.default
          )
      },
      {
        path: 'kardex',
        loadComponent: () =>
          import('./pages/inventario/movimientos/inventario-movimientos.component').then(
            (m) => m.default
          )
      },

      // PAGOS CLIENTE - Acceso: ADMIN, USUARIO
      {
        path: 'pagos-cliente',
        loadComponent: () =>
          import('./pages/pagos-cliente/list/pago-cliente.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'pagos-cliente/nuevo',
        loadComponent: () =>
          import('./pages/pagos-cliente/form/pago-cliente-form.component').then(
            (m) => m.default
          )
      },
      {
        path: 'pagos-cliente/:pedidoId/nuevo',
        loadComponent: () =>
          import('./pages/pagos-cliente/form/pago-cliente-form.component').then(
            (m) => m.default
          )
      },
      {
        path: 'pagos-cliente/:id/detalle',
        loadComponent: () =>
          import('./pages/pagos-cliente/detail/pago-cliente-detail.component').then(
            (m) => m.default
          )
      },

      // PEDIDOS - Acceso: ADMIN, USUARIO, COCINERO
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./pages/pedidos/list/pedido.component').then(
            (m) => m.default
          )
      },
      {
        path: 'pedidos/nuevo',
        loadComponent: () =>
          import('./pages/pedidos/form/pedido-form.component').then(
            (m) => m.default
          )
      },
      {
        path: 'pedidos/:id/detalle',
        loadComponent: () =>
          import('./pages/pedidos/detail/pedido-detail.component').then(
            (m) => m.default
          )
      },

      { path: '**', redirectTo: '' },
    ],
  },
];
