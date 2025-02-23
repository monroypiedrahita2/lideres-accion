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
    ]
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
