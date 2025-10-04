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
        path: 'grupos',
        loadComponent: () =>
          import(
            './pages/ingredientes/grupo-ingrediente/list/grupo-ingrediente.component'
          ).then((m) => m.default),
      },
      {
        path: 'grupos/nuevo',
        loadComponent: () =>
          import(
            './pages/ingredientes/grupo-ingrediente/form/grupo-ingrediente-form.component'
          ).then((m) => m.default),
      },
      {
        path: 'grupos/:id/editar',
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

      { path: '**', redirectTo: '' },
    ],
  },
];
