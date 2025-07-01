import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth-guard.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./standAlone/auth/auth.component').then(c => c.AuthComponent),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./standAlone/signup/signup.component').then(c => c.SignupComponent),
    canActivate: [NoAuthGuard]
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
    path: 'world/:id',
    loadChildren: () => import('./modules/world/world.module').then(c => c.worldModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'library',
    loadChildren: () => import('./modules/library/library.module').then(c => c.LibraryModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'store',
    loadChildren: () => import('./modules/store/store.module').then(c => c.StoreModule),
  },
  {
    path: 'world/:id/chapter/:chapterId',
    loadChildren: () => import('./modules/docx/docx.module').then(c => c.DocxModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'read/:worldName',
    loadChildren: () => import('./modules/read-world/read-world.module').then(c => c.ReadWorldModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'read/book/:paperId/chapter/:chapterOrder',
    loadChildren: () => import('./modules/readchapter/readChapter.module').then(c => c.ReadChapterModule),
    canActivate: [AuthGuard]
  }

];