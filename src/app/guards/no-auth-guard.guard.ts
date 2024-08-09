import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    const token = localStorage.getItem('accessToken');

    const expiry = new Date(localStorage.getItem('expiry') || '');
    if (token && expiry.getTime() > new Date().getTime()) {
      this.router.navigate(['/']);
      return false; 
    }else{    
      return true;
    }
  }
}
