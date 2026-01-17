import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('accessToken');
    const sessionId = localStorage.getItem('sessionId');

    let authReq = req;

    if (token) {
      authReq = authReq.clone({
        setHeaders: {
          Authorization: token
        }
      });
    }

    if (sessionId) {
      authReq = authReq.clone({
        setHeaders: {
          'X-Session-ID': sessionId
        }
      });
    }

    return next.handle(authReq).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const newToken = event.headers.get('accessToken');
          const newExpiry = event.headers.get('expiry');
          const newSessionId = event.headers.get('X-Session-ID');

          if (newToken) localStorage.setItem('accessToken', newToken);
          if (newExpiry) localStorage.setItem('expiry', newExpiry);
          if (newSessionId) localStorage.setItem('sessionId', newSessionId);
        }
      })
    );
  }
}
