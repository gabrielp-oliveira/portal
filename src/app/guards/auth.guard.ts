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
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    
    const token = localStorage.getItem('accessToken');
    const expiryString = localStorage.getItem('expiry');
    const expiry = expiryString ? new Date(expiryString) : null;

    if (token && expiry && expiry.getTime() > Date.now()) {
      this.auth.logged = true;
      return true;
    }

    // Check if token is present in URL
    const urlToken = next.queryParams['accessToken'];
    const urlExpiry = next.queryParams['expiry'];

    if (urlToken && urlExpiry) {
      // Save to localStorage
      localStorage.setItem('accessToken', urlToken);
      localStorage.setItem('expiry', urlExpiry);
      this.auth.logged = true;

      // Remove token from URL without reloading the app
      const queryParams = { ...next.queryParams };
      delete queryParams['accessToken'];
      delete queryParams['expiry'];

      this.router.navigate([], {
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });

      // Return false so that the guard runs again with the updated localStorage
      return false;
    }

    // If no valid token, redirect to login
    this.auth.logged = false;
    this.router.navigate(['/login']);
    return false;
  }
}
