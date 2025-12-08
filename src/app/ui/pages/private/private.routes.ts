import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./private.component').then(m => m.PrivateComponent),
     ...canActivate(() => redirectUnauthorizedTo(['./public/login'])),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
      },
      {
        path: 'crear-iglesia',
        loadComponent: () => import('./iglesia/crear-iglesia.component').then(m => m.CrearIglesiaComponent),
      },
      {
        path: 'crear-comuna',
        loadComponent: () => import('./comuna/comuna.component').then(m => m.ComunaComponent),
      },
      {
        path: 'crear-referido',
        loadComponent: () => import('./referido/create/create-referido.component').then(m => m.CreateReferidoComponent),
      },
      {
        path: 'editar-referido/:id',
        loadComponent: () => import('./referido/create/create-referido.component').then(m => m.CreateReferidoComponent),
      },
      {
        path: 'listar-referidos',
        loadComponent: () => import('./referido/lista-referidos/lista-referidos.component').then(m => m.ListaReridosComponent),
      },
      {
        path: 'control-accesos',
        loadComponent: () => import('./control-accesos/control-accesos.component').then(m => m.ControlAccesosComponent),
      },
      {
        path: 'crear-pastor',
        loadComponent: () => import('./crear-pastor/crear-pastor.component').then(m => m.CrearPastorComponent),
      },
      {
        path: 'masivo-referidos',
        loadComponent: () => import('./masivo-referidos/masivo-referidos.component').then(m => m.MasivoReferidosComponent),
      },
      {
        path: 'testigos',
        loadComponent: () => import('./testigos/testigos.component').then(m => m.TestigosComponent),
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./estadisticas/estadisticas.component').then(m => m.EstadisticasComponent),
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
