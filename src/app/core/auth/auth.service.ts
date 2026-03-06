import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
  expiry: string; // PADRÃO DEFINITIVO
};

type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
  expiry: string; // PADRÃO DEFINITIVO
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isLogged$ = this.isLoggedSubject.asObservable();

  private readonly AUTH_BASE = 'http://localhost:8080';
  private readonly REFRESH_URL = '/api/auth/refresh-token';

  constructor(private http: HttpClient, private router: Router) {}

  private parseExpiry(raw?: string | null): number {
    if (!raw) return 0;

    // ISO / RFC string
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.getTime();

    // fallback caso venha timestamp string (ms ou s)
    const n = Number(raw);
    if (!isNaN(n)) return raw.length <= 10 ? n * 1000 : n;

    return 0;
  }

  private setAuthStorage(opts: {
    accessToken: string;
    refreshToken?: string;
    sessionId?: string;
    expiry: string;
  }): void {
    localStorage.setItem('accessToken', opts.accessToken);
    localStorage.setItem('expiry', opts.expiry);

    // refreshToken pode não existir em alguns fluxos (ex: oauth dependendo do backend)
    if (opts.refreshToken) localStorage.setItem('refreshToken', opts.refreshToken);

    // sessionId pode rotacionar
    if (opts.sessionId) localStorage.setItem('sessionId', opts.sessionId);
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('accessToken');
    const expiryRaw = localStorage.getItem('expiry');
    const expiryMs = this.parseExpiry(expiryRaw);
    return !!token && expiryMs > Date.now();
  }

  googleLogin(): Observable<any> {
    return this.http
      .get<{ url: string }>(`${this.AUTH_BASE}/auth/google/getUrl`)
      .pipe(tap(r => (window.location.href = r.url)));
  }

  microsoftLogin(): Observable<any> {
    return this.http
      .get<{ url: string }>(`${this.AUTH_BASE}/auth/microsoft/getUrl`)
      .pipe(tap(r => { if (r?.url) window.location.href = r.url; }));
  }

  signUp(body: any): void {
    this.http
      .post<{ url: string }>(`${this.AUTH_BASE}/signup`, body)
      .subscribe(r => (window.location.href = r.url));
  }

  login(body: any): Observable<void> {
    return this.http
      .post<LoginResponse>(`${this.AUTH_BASE}/login`, body)
      .pipe(
        tap(resp => {
          this.setAuthStorage({
            accessToken: resp.accessToken,
            refreshToken: resp.refreshToken,
            sessionId: resp.sessionId,
            expiry: resp.expiry
          });

          this.isLoggedSubject.next(true);
          this.router.navigate(['/dashboard']);
        }),
        map(() => void 0),
        catchError(err => {
          this.isLoggedSubject.next(false);
          return throwError(() => err);
        })
      );
  }

  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    const sessionId = localStorage.getItem('sessionId');

    if (!refreshToken) {
      this.isLoggedSubject.next(false);
      return throwError(() => new Error('Missing refreshToken'));
    }

    return this.http
      .post<RefreshResponse>(this.REFRESH_URL, { refreshToken, sessionId })
      .pipe(
        tap(resp => {
          this.setAuthStorage({
            accessToken: resp.accessToken,
            refreshToken: resp.refreshToken,
            sessionId: resp.sessionId,
            expiry: resp.expiry
          });

          this.isLoggedSubject.next(true);
        }),
        catchError(err => {
          this.isLoggedSubject.next(false);
          return throwError(() => err);
        })
      );
  }

  logOut(): void {
    localStorage.clear();
    this.isLoggedSubject.next(false);
    this.router.navigate(['/']);
  }

  setLoggedStatus(logged: boolean): void {
    this.isLoggedSubject.next(logged);
  }

  getSessionId(): string | null {
    return localStorage.getItem('sessionId');
  }
}
