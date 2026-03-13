import { inject } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../core/auth/auth.service';

const LOG = (...args: any[]) => console.log('[authGuard]', ...args);

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
  const expiryMs = parseExpiryToMs(expiryString);
  const now = Date.now();
  LOG(`token present: ${!!token} | expiry: ${expiryString} | expiryMs: ${expiryMs} | now: ${now} | valid: ${expiryMs > now}`);
  return expiryMs > now;
}

// Retorna 'oauth-error:<msg>' se há ?error=, string vazia se tokens salvos, false se não há nada
function consumeCallbackParams(route: ActivatedRouteSnapshot, auth: AuthService): string | false {
  const oauthError = route.queryParams['error'];
  if (oauthError) {
    LOG('OAuth error param:', oauthError);
    return `oauth-error:${oauthError}`;
  }

  const urlToken     = route.queryParams['accessToken'];
  const urlExpiry    = route.queryParams['expiry'];
  const urlSessionId = route.queryParams['sessionId'];

  LOG(`queryParams — accessToken: ${!!urlToken}, expiry: ${urlExpiry}, sessionId: ${!!urlSessionId}`);

  if (!urlToken || !urlExpiry) return false;
  if (!isTokenValid(urlToken, urlExpiry)) {
    LOG('Token from URL is expired or invalid — ignoring');
    return false;
  }

  localStorage.setItem('accessToken', urlToken);
  localStorage.setItem('expiry', urlExpiry);
  if (urlSessionId) localStorage.setItem('sessionId', urlSessionId);
  auth.setLoggedStatus(true);
  LOG('OAuth tokens saved to localStorage');

  const redirect = localStorage.getItem('auth-redirect') || '';
  localStorage.removeItem('auth-redirect');
  return redirect;
}

const ONBOARDING_CHECKED_ROUTES = ['/dashboard'];
const ONBOARDING_EXEMPT_ROUTES  = ['/onboarding'];

function requiresOnboardingCheck(url: string): boolean {
  if (ONBOARDING_EXEMPT_ROUTES.some(r => url.startsWith(r))) return false;
  return ONBOARDING_CHECKED_ROUTES.some(r => url.startsWith(r));
}

function checkOnboarding(
  auth: AuthService,
  router: Router,
  stateUrl: string
): Observable<boolean | UrlTree> {
  if (!requiresOnboardingCheck(stateUrl)) {
    LOG(`No onboarding check needed for: ${stateUrl}`);
    return of(true);
  }

  LOG(`Checking onboarding for: ${stateUrl}`);
  return auth.getProfileDetails().pipe(
    map(details => {
      LOG(`onboarding_complete: ${details.onboarding_complete}`);
      if (!details.onboarding_complete) {
        LOG('Redirecting to /onboarding');
        return router.createUrlTree(['/onboarding']);
      }
      return true as boolean | UrlTree;
    }),
    catchError(err => {
      LOG('getProfileDetails error — allowing through:', err.status, err.message);
      return of(true as boolean | UrlTree);
    })
  );
}

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const auth   = inject(AuthService);

  LOG(`--- Guard triggered for: ${state.url}`);

  // 1) Callback via URL (OAuth redirect ou email validation)
  const callbackResult = consumeCallbackParams(route, auth);

  if (callbackResult !== false) {
    if (callbackResult.startsWith('oauth-error:')) {
      const msg = callbackResult.slice('oauth-error:'.length);
      LOG('Redirecting to /login with OAuth error:', msg);
      return router.createUrlTree(['/login'], { queryParams: { error: msg } });
    }

    LOG('OAuth callback consumed — checking onboarding');
    return checkOnboarding(auth, router, state.url).pipe(
      map(result => {
        if (result !== true) { LOG('Redirecting to /onboarding'); return result; }
        if (callbackResult) { LOG('Redirecting to auth-redirect:', callbackResult); return router.parseUrl(callbackResult); }
        const tree = router.parseUrl(state.url);
        tree.queryParams = {};
        LOG('Clearing query params, allowing route:', state.url);
        return tree;
      })
    );
  }

  // 2) Token válido no storage
  const token  = localStorage.getItem('accessToken');
  const expiry = localStorage.getItem('expiry');
  LOG(`Storage — accessToken: ${token?.slice(0,20)}... | expiry: ${expiry}`);

  if (isTokenValid(token, expiry)) {
    auth.setLoggedStatus(true);
    LOG('Token valid — proceeding');
    return checkOnboarding(auth, router, state.url);
  }

  // 3) Sem token → login
  LOG('No valid token — redirecting to /login');
  auth.setLoggedStatus(false);
  localStorage.setItem('auth-redirect', state.url);
  return router.createUrlTree(['/login']);
};
