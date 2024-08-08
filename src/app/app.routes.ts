import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
      path: 'auth/login',
      loadComponent: () => import('./standAlone/auth/auth.component').then(c => c.AuthComponent),
      // canDeactivate: [AuthGuard]
    },
    {
      path: 'auth/signup',
      loadComponent: () => import('./standAlone/auth/signUp.component').then(c => c.SignUpComponent),
      // canDeactivate: [AuthGuard]
    },
    {
      path: '',
      loadComponent: () => import('./standAlone/home/home.component').then(c => c.HomeComponent)
    },
    {
      path: 'dashboard',
      loadChildren: () => import('./modules/dashboard/dashboard.module').then(c => c.DashboardModule),
      canActivate: [AuthGuard]
    },
    {
      path: 'papper',
      loadChildren: () => import('./modules/papper/papper.module').then(c => c.PapperModule)
    },
  ];