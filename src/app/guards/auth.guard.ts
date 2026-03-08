import { inject } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../core/auth/auth.service';

function parseExpiryToMs(raw: string | null): number {
  if (!raw) return 0;
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.getTime();
  const n = Number(raw);
  if (!isNaN(n)) return raw.length <= 10 ? n * 1000 : n;
  return 0;
}

function isTokenValid(token: string | null, expiryString: string | null): boolean {
  if (!token || !expiryString) return false;
  return parseExpiryToMs(expiryString) > Date.now();
}

function consumeCallbackParams(route: ActivatedRouteSnapshot, auth: AuthService): boolean {
  const urlToken     = route.queryParams['accessToken'];
  const urlExpiry    = route.queryParams['expiry'];
  const urlSessionId = route.queryParams['sessionId'];

  if (!urlToken || !urlExpiry) return false;
  if (!isTokenValid(urlToken, urlExpiry)) return false;

  localStorage.setItem('accessToken', urlToken);
  localStorage.setItem('expiry', urlExpiry);
  if (urlSessionId) localStorage.setItem('sessionId', urlSessionId);
  auth.setLoggedStatus(true);
  return true;
}

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const auth   = inject(AuthService);

  // 1) Callback tokens via URL (OAuth redirect)
  if (consumeCallbackParams(route, auth)) {
    const tree = router.parseUrl(state.url);
    tree.queryParams = {};
    return tree;
  }

  // 2) Token válido no storage
  const token  = localStorage.getItem('accessToken');
  const expiry = localStorage.getItem('expiry');

  if (isTokenValid(token, expiry)) {
    auth.setLoggedStatus(true);
    return true;
  }

  // 3) Tenta refresh
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    return auth.refreshToken().pipe(
      map(() => {
        auth.setLoggedStatus(true);
        return true as boolean;
      }),
      catchError(() => {
        auth.setLoggedStatus(false);
        return of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
      })
    );
  }

  // 4) Sem token -> login
  auth.setLoggedStatus(false);
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
