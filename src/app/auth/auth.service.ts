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

  isUserLogged() :boolean{

    const token = localStorage.getItem('accessToken');

    const expiry = new Date(localStorage.getItem('expiry') || '');
    if (token && expiry.getTime() > new Date().getTime()) {
      return true;
    }else{    
      return false;
    }

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

  signUp(body:any){
    this.http.post<{ url: string }>('http://localhost:8080/signup', body).subscribe(response => {
      const url: any = response
      window.location.href = url;
    });
  }
  login(body:any){
    this.http.post<{ url: string }>('http://localhost:8080/login', body).subscribe(response => {
      this.router.navigate(['/dashboard'])
    }, (err) => {
      console.error(err.message)
    });
  }
}
