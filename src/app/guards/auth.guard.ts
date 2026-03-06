import { inject } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from '../core/auth/auth.service';

function log(...args: any[]) {
  console.log('[AuthGuard]', ...args);
}

function maskToken(token: string | null): string {
  if (!token) return '(null)';
  const start = token.slice(0, 10);
  return `${start}... (len=${token.length})`;
}

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
  const expMs = parseExpiryToMs(expiryString);
  return expMs > Date.now();
}

function consumeCallbackParams(route: ActivatedRouteSnapshot, auth: AuthService): boolean {
  const urlToken = route.queryParams['accessToken'];
  const urlExpiry = route.queryParams['expiry'];
  const urlSessionId = route.queryParams['sessionId'];

  log('Callback params present?', {
    hasAccessToken: !!urlToken,
    hasExpiry: !!urlExpiry,
    hasSessionId: !!urlSessionId,
    accessToken: maskToken(urlToken ?? null),
    expiry: urlExpiry ?? null
  });

  if (!urlToken || !urlExpiry) return false;

  const expMs = parseExpiryToMs(urlExpiry);
  const valid = isTokenValid(urlToken, urlExpiry);

  log('Callback token validity', {
    valid,
    expMs,
    secondsLeft: expMs ? Math.round((expMs - Date.now()) / 1000) : null
  });

  if (!valid) return false;

  localStorage.setItem('accessToken', urlToken);
  localStorage.setItem('expiry', urlExpiry);

  if (urlSessionId) localStorage.setItem('sessionId', urlSessionId);

  auth.setLoggedStatus(true);

  log('Callback consumed and stored. Storage now:', {
    accessToken: maskToken(localStorage.getItem('accessToken')),
    expiry: localStorage.getItem('expiry'),
    sessionId: localStorage.getItem('sessionId') ? '(present)' : '(missing)'
  });

  return true;
}

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  log('canActivate ->', state.url);

  // 1) Callback tokens via URL
  if (consumeCallbackParams(route, auth)) {
    log('Returning UrlTree to clean query params for:', state.url);
    const tree = router.parseUrl(state.url);
    tree.queryParams = {};
    return tree;
  }

  // 2) Token válido no storage
  const token = localStorage.getItem('accessToken');
  const expiry = localStorage.getItem('expiry');
  const sessionId = localStorage.getItem('sessionId');

  const expMs = parseExpiryToMs(expiry);
  const secondsLeft = expMs ? Math.round((expMs - Date.now()) / 1000) : null;

  log('Storage snapshot', {
    accessToken: maskToken(token),
    hasSessionId: !!sessionId,
    expiry,
    expMs,
    secondsLeft
  });

  const tokenValid = isTokenValid(token, expiry);
  log('Token valid from storage?', tokenValid);

  if (tokenValid) {
    auth.setLoggedStatus(true);
    log('ALLOW -> token valid');
    return true;
  }

  // 3) Tenta refresh
  const refreshToken = localStorage.getItem('refreshToken');
  log('Token invalid/expired. Has refreshToken?', !!refreshToken);

  if (refreshToken) {
    log('Attempting refreshToken()...');
    return auth.refreshToken().pipe(
      tap(() => {
        const t2 = localStorage.getItem('accessToken');
        const e2 = localStorage.getItem('expiry');
        const exp2 = parseExpiryToMs(e2);
        log('Refresh SUCCESS. New storage:', {
          accessToken: maskToken(t2),
          expiry: e2,
          secondsLeft: exp2 ? Math.round((exp2 - Date.now()) / 1000) : null,
          hasSessionId: !!localStorage.getItem('sessionId')
        });
      }),
      map(() => {
        auth.setLoggedStatus(true);
        log('ALLOW -> refresh ok');
        return true as boolean;
      }),
      catchError((err) => {
        log('Refresh FAILED -> redirect login', err);
        auth.setLoggedStatus(false);
        return of(router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        }));
      })
    );
  }

  // 4) Sem refreshToken -> login
  log('DENY -> no refreshToken. Redirect login.');
  auth.setLoggedStatus(false);

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
