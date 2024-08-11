import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Aqui você pode acessar todos os headers
          const accessToken = event.headers.get('accessToken');
          const tokenExpiry = event.headers.get('expiry');


          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
          }

          if (tokenExpiry) {
            localStorage.setItem('expiry', tokenExpiry);
          }
        }
      })
    );
  }
}
