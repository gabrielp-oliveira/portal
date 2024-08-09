import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const accessToken = localStorage.getItem('accessToken');
    console.log('auth interceptor')

    if (accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `${accessToken}`
        }
      });
    }
    return next.handle(req)
    // .pipe(
    //   catchError(error => {
    //     console.log(error)
    //     if (error.status === 401) {
    //       return this.authService.refreshToken().pipe(
    //         switchMap(() => {
    //           const newAccessToken = localStorage.getItem('accessToken');
    //           if (newAccessToken) {
    //             req = req.clone({
    //               setHeaders: {
    //                 Authorization: `Bearer ${newAccessToken}`
    //               }
    //             });
    //           }
    //           return next.handle(req);
    //         })
    //       );
    //     }

    //     return throwError(error);
    //   })
    // );
  }
}
