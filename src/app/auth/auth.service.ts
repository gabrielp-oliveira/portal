import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isLogged$ = this.isLoggedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private hasValidToken(): boolean {
    const token = localStorage.getItem('accessToken');
    const expiry = new Date(localStorage.getItem('expiry') || '');
    return !!token && expiry.getTime() > Date.now();
  }

  googleLogin(): Observable<any> {
    return this.http.get<{ url: string }>('http://localhost:8080/auth/google/getUrl').pipe(
      tap(response => window.location.href = response.url)
    );
  }

  microsoftLogin(): Observable<any> {
    return this.http.get<{ url: string }>('http://localhost:8080/auth/microsoft/getUrl');
  }

  logOut(): void {
    console.log('3')
    localStorage.clear();
    this.isLoggedSubject.next(false);
    this.router.navigate(['/']);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    const sessionId = localStorage.getItem('sessionId');

    console.log('sessionId ->', sessionId)
    return this.http.post('/api/auth/refresh-token', { refreshToken, sessionId }).pipe(
      tap((response: any) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('expiry', response.tokenExpiry);

            console.log('NOVO -> sessionId ->', response.sessionId)
            console.log('SET NOVO -> sessionId ->', response)

        // Garante que sessionId seja mantido atualizado, se o backend enviar um novo
        if (response.sessionId) {
          localStorage.setItem('sessionId', response.sessionId);
        }

        this.isLoggedSubject.next(true);
      }),
      catchError(error => throwError(error))
    );
  }

  signUp(body: any): void {
    this.http.post<{ url: string }>('http://localhost:8080/signup', body)
      .subscribe(response => window.location.href = response.url);
  }

  login(body: any): Observable<void> {
    return this.http.post<{ accessToken: string, refreshToken: string, expiry: string, sessionId: string }>('http://localhost:8080/login', body).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('expiry', response.expiry);
        localStorage.setItem('sessionId', response.sessionId);
    console.log('SET LOGIN SESSIONiD ->', response.sessionId)

        this.isLoggedSubject.next(true);
        this.router.navigate(['/dashboard']);
      }),
      map(() => void 0),
      catchError(err => {
        this.isLoggedSubject.next(false);
        return throwError(err);
      })
    );
  }

  // Método extra (opcional) para usar no AuthGuard
  setLoggedStatus(logged: boolean): void {
    this.isLoggedSubject.next(logged);
  }

  // (opcional) para reutilizar sessionId
  getSessionId(): string | null {
    return localStorage.getItem('sessionId');
  }
}
