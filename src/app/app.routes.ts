import { Routes } from '@angular/router';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

export const routes: Routes = [
    {
        path: 'private',
        loadChildren: () => import('./ui/pages/private/private.module').then((m) => m.PrivateModule),
        ...canActivate(() => redirectUnauthorizedTo(['./public/login'])),
    },
    {
        path: 'public',
        loadChildren: () => import('./ui/pages/public/public.module').then((m) => m.PublicModule)
    },
    {
        path: '',
        redirectTo: 'private/home',
        pathMatch: 'prefix'
      },
      {
        path: '**',
        redirectTo: 'private/home',
        pathMatch: 'prefix'
      }

];
