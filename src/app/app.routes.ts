import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth-guard.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./shared/auth/auth.component').then(c => c.AuthComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./shared/signup/signup.component').then(c => c.SignupComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: '',
    loadComponent: () => import('./shared/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./shared/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./shared/reset-password/reset-password.component').then(c => c.ResetPasswordComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./shared/profile/profile.component').then(c => c.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./shared/onboarding/onboarding.component').then(c => c.OnboardingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(c => c.DashboardModule),
    canActivate: [authGuard]
  },
  {
    path: 'library',
    loadChildren: () => import('./features/library/library.module').then(c => c.LibraryModule),
    canActivate: [authGuard]
  },
  {
    path: 'world/:id',
    loadChildren: () => import('./features/world/world.module').then(c => c.WorldModule),
    canActivate: [authGuard]
  },
  {
    path: 'store',
    loadChildren: () => import('./features/store/store.module').then(c => c.StoreModule),
  },
  {
    path: 'read/book/:paperId/chapter/:chapterOrder',
    loadChildren: () => import('./features/readchapter/readChapter.module').then(c => c.ReadChapterModule),
    canActivate: [authGuard]
  },
  {
    path: 'read/:worldName',
    loadChildren: () => import('./features/read-world/read-world.module').then(c => c.ReadWorldModule),
    canActivate: [authGuard]
  },
  {
    path: 'terms',
    loadComponent: () => import('./shared/legal/terms.component').then(c => c.TermsComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./shared/legal/privacy.component').then(c => c.PrivacyComponent)
  },
  {
    path: 'refunds',
    loadComponent: () => import('./shared/legal/refunds.component').then(c => c.RefundsComponent)
  },
  { path: '**', redirectTo: '' }

];