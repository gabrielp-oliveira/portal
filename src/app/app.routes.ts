import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth-guard.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./standAlone/auth/auth.component').then(c => c.AuthComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./standAlone/signup/signup.component').then(c => c.SignupComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: '',
    loadComponent: () => import('./standAlone/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(c => c.DashboardModule),
    canActivate: [authGuard]
  },
  {
    path: 'world/:id',
    loadChildren: () => import('./modules/world/world.module').then(c => c.worldModule),
    canActivate: [authGuard]
  },
  {
    path: 'library',
    loadChildren: () => import('./modules/library/library.module').then(c => c.LibraryModule),
    canActivate: [authGuard]
  },
  {
    path: 'store',
    loadChildren: () => import('./modules/store/store.module').then(c => c.StoreModule),
  },
  {
    path: 'world/:id/chapter/:chapterId',
    loadChildren: () => import('./modules/docx/docx.module').then(c => c.DocxModule),
    canActivate: [authGuard]
  },
  {
    path: 'read/:worldName',
    loadChildren: () => import('./modules/read-world/read-world.module').then(c => c.ReadWorldModule),
    canActivate: [authGuard]
  },
  {
    path: 'read/book/:paperId/chapter/:chapterOrder',
    loadChildren: () => import('./modules/readchapter/readChapter.module').then(c => c.ReadChapterModule),
    canActivate: [authGuard]
  }

];