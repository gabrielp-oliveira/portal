import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
  expiry: string;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
  expiry: string;
};

type ProfileDetails = {
  onboarding_complete: boolean;
  profile_complete: boolean;
  [key: string]: any;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isLogged$ = this.isLoggedSubject.asObservable();

  private readonly AUTH_BASE = environment.authUrl;
  private readonly REFRESH_URL = `${environment.authUrl}/api/auth/refresh-token`;

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

  getProfileDetails(): Observable<ProfileDetails> {
    return this.http.get<ProfileDetails>(`${this.AUTH_BASE}/logged/profile/details`);
  }

  googleLogin(): Observable<{ url: string }> {
    return this.http
      .get<{ url: string }>(`${this.AUTH_BASE}/auth/google/getUrl`)
      .pipe(tap(r => { window.location.href = r.url; }));
  }

  microsoftLogin(): Observable<{ url: string }> {
    return this.http
      .get<{ url: string }>(`${this.AUTH_BASE}/auth/meta/getUrl`)
      .pipe(tap(r => { if (r?.url) window.location.href = r.url; }));
  }

  signUp(body: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.AUTH_BASE}/signup`, body);
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
        }),
        switchMap(() => this.getProfileDetails()),
        tap((details: ProfileDetails) => {
          const redirect = localStorage.getItem('auth-redirect');
          localStorage.removeItem('auth-redirect');
          if (!details.onboarding_complete) {
            this.router.navigate(['/onboarding']);
          } else {
            this.router.navigate([redirect ?? '/dashboard']);
          }
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
    this.http.post(`${this.AUTH_BASE}/logged/logout`, null).pipe(
      finalize(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('expiry');
        this.isLoggedSubject.next(false);
        this.router.navigate(['/']);
      })
    ).subscribe({ error: () => {} });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.AUTH_BASE}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.AUTH_BASE}/auth/reset-password`, { token, password });
  }

  getReadingPreferences(): Observable<{
    configured: boolean;
    favorite_genres: string[];
    favorite_authors: { id: string; name: string; birth_year?: number; death_year?: number }[];
    preferred_lengths: string[];
    preferred_maturity: string[];
    preferred_languages: string[];
    updated_at?: string;
  }> {
    return this.http.get<any>(`${this.AUTH_BASE}/logged/profile/reading-preferences`);
  }

  getAuthors(search?: string): Observable<{ authors: { id: string; name: string; birth_year?: number; death_year?: number }[] }> {
    const url = search
      ? `${this.AUTH_BASE}/authors?search=${encodeURIComponent(search)}`
      : `${this.AUTH_BASE}/authors`;
    return this.http.get<{ authors: { id: string; name: string; birth_year?: number; death_year?: number }[] }>(url);
  }

  setLoggedStatus(logged: boolean): void {
    this.isLoggedSubject.next(logged);
  }

  getSessions(): Observable<{ ID: string; Device: string; CreatedAt: string; ExpiresAt: string }[]> {
    return this.http.get<{ ID: string; Device: string; CreatedAt: string; ExpiresAt: string }[]>(`${this.AUTH_BASE}/logged/sessions`);
  }

  revokeSession(sessionId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.AUTH_BASE}/logged/sessions/${sessionId}`);
  }

  getSessionId(): string | null {
    return localStorage.getItem('sessionId');
  }
}
