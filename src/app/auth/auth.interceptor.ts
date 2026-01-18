import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly PUBLIC_PATHS = [
    '/login',
    '/signup',
    '/auth/google/getUrl',
    '/auth/google/callback',
    '/auth/microsoft/getUrl',
    '/auth/microsoft/callback'
  ];

  private isPublicRequest(req: HttpRequest<any>): boolean {
    const url = req.url || '';
    return this.PUBLIC_PATHS.some(p => url.includes(p));
  }

  private attachAuthHeaders(req: HttpRequest<any>): HttpRequest<any> {
    const accessToken = localStorage.getItem('accessToken');
    const sessionId = localStorage.getItem('sessionId');

    if (!accessToken && !sessionId) return req;

    const headers: Record<string, string> = {};
    if (accessToken) headers['Authorization'] = accessToken;     // sem Bearer
    if (sessionId) headers['X-Session-ID'] = sessionId;

    return req.clone({ setHeaders: headers });
  }

  private syncTokens(headers: any): void {
    if (!headers) return;

    const newToken = headers.get?.('accessToken');
    const newExpiry = headers.get?.('expiry');
    const newSessionId = headers.get?.('X-Session-ID');

    if (newToken) localStorage.setItem('accessToken', newToken);
    if (newExpiry) localStorage.setItem('expiry', newExpiry);
    if (newSessionId) localStorage.setItem('sessionId', newSessionId);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isPublic = this.isPublicRequest(req);
    const authReq = isPublic ? req : this.attachAuthHeaders(req);

    return next.handle(authReq).pipe(
      tap(event => {
        if (!isPublic && event instanceof HttpResponse) {
          this.syncTokens(event.headers);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        // ✅ aqui salva token mesmo em erro, se o backend enviou
        if (!isPublic) this.syncTokens(err.headers);
        return throwError(() => err);
      })
    );
  }
}
