import { Routes } from '@angular/router';
import AppShellComponent from './core/layout/app-shell/app-shell.component';

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
          ).then((m) => m.default),
      },
      {
        path: 'proveedores/:id/editar',
        loadComponent: () =>
          import(
            './pages/proveedores/proveedor/form/proveedor-form.component'
          ).then((m) => m.default),
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

      { path: '**', redirectTo: '' },
    ],
  },
];
