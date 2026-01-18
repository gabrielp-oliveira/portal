import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private auth: AuthService) {}

  private log(...args: any[]) {
    // você pode desligar fácil depois
    console.log('[AuthGuard]', ...args);
  }

  private maskToken(token: string | null): string {
    if (!token) return '(null)';
    const start = token.slice(0, 10);
    return `${start}... (len=${token.length})`;
  }

  private parseExpiryToMs(raw: string | null): number {
    if (!raw) return 0;

    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.getTime();

    const n = Number(raw);
    if (!isNaN(n)) return raw.length <= 10 ? n * 1000 : n;

    return 0;
  }

  private isTokenValid(token: string | null, expiryString: string | null): boolean {
    if (!token || !expiryString) return false;
    const expMs = this.parseExpiryToMs(expiryString);
    return expMs > Date.now();
  }

  private consumeCallbackParams(next: ActivatedRouteSnapshot): boolean {
    const urlToken = next.queryParams['accessToken'];
    const urlExpiry = next.queryParams['expiry'];
    const urlSessionId = next.queryParams['sessionId'];

    this.log('Callback params present?', {
      hasAccessToken: !!urlToken,
      hasExpiry: !!urlExpiry,
      hasSessionId: !!urlSessionId,
      // não loga tudo
      accessToken: this.maskToken(urlToken ?? null),
      expiry: urlExpiry ?? null
    });

    if (!urlToken || !urlExpiry) return false;

    const expMs = this.parseExpiryToMs(urlExpiry);
    const valid = this.isTokenValid(urlToken, urlExpiry);

    this.log('Callback token validity', {
      valid,
      expMs,
      secondsLeft: expMs ? Math.round((expMs - Date.now()) / 1000) : null
    });

    if (!valid) return false;

    localStorage.setItem('accessToken', urlToken);
    localStorage.setItem('expiry', urlExpiry);

    if (urlSessionId) localStorage.setItem('sessionId', urlSessionId);

    this.auth.setLoggedStatus(true);

    this.log('Callback consumed and stored. Storage now:', {
      accessToken: this.maskToken(localStorage.getItem('accessToken')),
      expiry: localStorage.getItem('expiry'),
      sessionId: localStorage.getItem('sessionId') ? '(present)' : '(missing)'
    });

    return true;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> {

    this.log('canActivate ->', state.url);

    // 1) Callback tokens via URL
    if (this.consumeCallbackParams(next)) {
      this.log('Returning UrlTree to clean query params for:', state.url);
      const tree = this.router.parseUrl(state.url);
      tree.queryParams = {};
      return tree;
    }

    // 2) Token válido no storage
    const token = localStorage.getItem('accessToken');
    const expiry = localStorage.getItem('expiry');
    const sessionId = localStorage.getItem('sessionId');

    const expMs = this.parseExpiryToMs(expiry);
    const secondsLeft = expMs ? Math.round((expMs - Date.now()) / 1000) : null;

    this.log('Storage snapshot', {
      accessToken: this.maskToken(token),
      hasSessionId: !!sessionId,
      expiry,
      expMs,
      secondsLeft
    });

    const tokenValid = this.isTokenValid(token, expiry);
    this.log('Token valid from storage?', tokenValid);

    if (tokenValid) {
      this.auth.setLoggedStatus(true);
      this.log('ALLOW -> token valid');
      return true;
    }

    // 3) Tenta refresh
    const refreshToken = localStorage.getItem('refreshToken');
    this.log('Token invalid/expired. Has refreshToken?', !!refreshToken);

    if (refreshToken) {
      this.log('Attempting refreshToken()...');
      return this.auth.refreshToken().pipe(
        tap(() => {
          const t2 = localStorage.getItem('accessToken');
          const e2 = localStorage.getItem('expiry');
          const exp2 = this.parseExpiryToMs(e2);
          this.log('Refresh SUCCESS. New storage:', {
            accessToken: this.maskToken(t2),
            expiry: e2,
            secondsLeft: exp2 ? Math.round((exp2 - Date.now()) / 1000) : null,
            hasSessionId: !!localStorage.getItem('sessionId')
          });
        }),
        map(() => {
          this.auth.setLoggedStatus(true);
          this.log('ALLOW -> refresh ok');
          return true;
        }),
        catchError((err) => {
          this.log('Refresh FAILED -> redirect login', err);
          this.auth.setLoggedStatus(false);
          return of(this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
          }));
        })
      );
    }

    // 4) Sem refreshToken -> login
    this.log('DENY -> no refreshToken. Redirect login.');
    this.auth.setLoggedStatus(false);

    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
}
