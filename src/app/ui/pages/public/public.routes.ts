import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'nueva-cuenta',
    loadComponent: () =>
      import('./nueva-cuenta/nueva-cuenta.component').then((m) => m.NuevaCuentaComponent),
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () =>
      import('./recuperar-contraseña/recuperar-contraseña.component').then(
        (m) => m.RecuperarContraseñaComponent
      ),
  },
];
