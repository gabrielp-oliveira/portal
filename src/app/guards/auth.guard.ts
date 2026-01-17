import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private auth: AuthService) {}

  private isTokenValid(token: string | null, expiryString: string | null): boolean {
    if (!token || !expiryString) return false;

    const expMs = Date.parse(expiryString);
    if (!Number.isFinite(expMs)) return false;

    return expMs > Date.now();
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    // ✅ Caso 1: Token válido no localStorage
    const token = localStorage.getItem('accessToken');
    const expiryString = localStorage.getItem('expiry');

    if (this.isTokenValid(token, expiryString)) {
      this.auth.setLoggedStatus(true);
      return true;
    }

    // ✅ Caso 2: Token vindo por URL (callback do login)
    const urlToken = next.queryParams['accessToken'];
    const urlExpiry = next.queryParams['expiry'];
    const urlSessionId = next.queryParams['sessionId'];

    if (urlToken && urlExpiry && this.isTokenValid(urlToken, urlExpiry)) {
      localStorage.setItem('accessToken', urlToken);
      localStorage.setItem('expiry', urlExpiry);

      // ✅ essencial pro seu backend (middleware exige X-Session-ID)
      if (urlSessionId) {
        localStorage.setItem('sessionId', urlSessionId);
      }

      this.auth.setLoggedStatus(true);

      // limpa os query params
      this.router.navigate([], {
        queryParams: {},
        queryParamsHandling: '',
        replaceUrl: true
      });

      return false;
    }

    // ❌ Caso 3: Token ausente ou inválido
    this.auth.setLoggedStatus(false);

    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
}
