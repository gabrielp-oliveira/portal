import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private auth: AuthService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      console.log('..')

    const token = localStorage.getItem('accessToken');
    const tokenExpiry = new Date(localStorage.getItem('expiry') || '');
    if (token && tokenExpiry.getTime() > new Date().getTime()) {
      delete next.queryParams['accessToken']
      delete next.queryParams['expiry']
      this.auth.logged = true
      return true;
    } else {

      const urlToken = next.queryParams['accessToken'];
      const tokenExpiry = next.queryParams['expiry'];
      if (urlToken) {
        localStorage.setItem('accessToken', urlToken);
        localStorage.setItem('expiry', tokenExpiry);
        this.removeTokenFromUrl(next);
        this.auth.logged = false
        return false; // Return false to ensure the route gets reactivated
      } else {
        this.router.navigate(['/auth/login']);
        this.auth.logged = false
        return false;
      }
    }
  }

  private removeTokenFromUrl(next: ActivatedRouteSnapshot) {
    const queryParams = { ...next.queryParams };
    delete queryParams['accessToken'];
    delete queryParams['expiry'];

    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    }).then(() => {
      // Ensure the route gets reactivated
      this.router.navigate([next.routeConfig?.path ?? '']);
    });
  }
}
