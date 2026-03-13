import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const noAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');
  const expiry = new Date(localStorage.getItem('expiry') || '');

  if (token && expiry.getTime() > new Date().getTime()) {
    router.navigate(['/dashboard']);
    return false;
  } else {
    return true;
  }
};
