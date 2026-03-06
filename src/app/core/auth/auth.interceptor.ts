import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/auth/google/getUrl',
  '/auth/google/callback',
  '/auth/microsoft/getUrl',
  '/auth/microsoft/callback'
];

function isPublicRequest(url: string): boolean {
  return PUBLIC_PATHS.some(p => url.includes(p));
}

function attachAuthHeaders(req: any): any {
  const accessToken = localStorage.getItem('accessToken');
  const sessionId = localStorage.getItem('sessionId');

  if (!accessToken && !sessionId) return req;

  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = accessToken;     // sem Bearer
  if (sessionId) headers['X-Session-ID'] = sessionId;

  return req.clone({ setHeaders: headers });
}

function syncTokens(headers: any): void {
  if (!headers) return;

  const newToken = headers.get?.('accessToken');
  const newExpiry = headers.get?.('expiry');
  const newSessionId = headers.get?.('X-Session-ID');

  if (newToken) localStorage.setItem('accessToken', newToken);
  if (newExpiry) localStorage.setItem('expiry', newExpiry);
  if (newSessionId) localStorage.setItem('sessionId', newSessionId);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isPublic = isPublicRequest(req.url || '');
  const authReq = isPublic ? req : attachAuthHeaders(req);

  return next(authReq).pipe(
    tap(event => {
      if (!isPublic && event instanceof HttpResponse) {
        syncTokens(event.headers);
      }
    }),
    catchError((err: HttpErrorResponse) => {
      if (!isPublic) syncTokens(err.headers);
      return throwError(() => err);
    })
  );
};
