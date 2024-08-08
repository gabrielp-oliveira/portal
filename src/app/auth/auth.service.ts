import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {}
  logged:boolean = false


  googleLogin() {
    this.http.get<{ url: string }>('http://localhost:8080/auth/google/getUrl').subscribe(response => {
      const url: any = response
      window.location.href = url;
    });
  }
  microsoftLogin() {
    this.http.get<{ url: string }>('http://localhost:8080/auth/microsoft/getUrl').subscribe(response => {
      const url: any = response
      window.location.href = url;
    });
  }


  logOut(){
    localStorage.clear();
    this.logged = false
    this.router.navigate(['/']);

  }


  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');

    return this.http.post('/api/auth/refresh-token', { refreshToken }).pipe(
      tap((response: any) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('tokenExpiry', response.tokenExpiry);
      }),
      catchError(error => {
        // Redirecionar para a página de login ou tratar erro
        return throwError(error);
      })
    );
  }
}
