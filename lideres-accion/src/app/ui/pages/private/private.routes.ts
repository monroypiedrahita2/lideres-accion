import { ListaReridosComponent } from './referido/lista-referidos/lista-referidos.component';
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
        path: 'create-user',
        loadComponent: () => import('./create-user/create-user.component').then(m => m.CreateUserComponent),
      },
      {
        path: 'mi-perfil',
        loadComponent: () => import('./mi-perfil/mi-perfil.component').then(m => m.MiPerfilComponent),
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
        path: 'listar-referidos',
        loadComponent: () => import('./referido/lista-referidos/lista-referidos.component').then(m => m.ListaReridosComponent),
      },
      {
        path: 'control-accesos',
        loadComponent: () => import('./control-accesos/control-accesos.component').then(m => m.ControlAccesosComponent),
      },
      {
        path: 'roles',
        loadComponent: () => import('./roles/roles.component').then(m => m.RolesComponent),
      },
      {
        path: 'listar-lideres',
        loadComponent: () => import('./lideres/lista-lideres/lista-lideres.component').then(m => m.ListaLideresComponent),
      },
      {
        path: 'crear-lider',
        loadComponent: () => import('./lideres/create-lider/create-lider.component').then(m => m.CreateLiderComponent),
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
