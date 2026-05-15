import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(cloned).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login')) {
          if (!isRefreshing) {
            isRefreshing = true;
            refreshTokenSubject.next(null);

            return auth.refreshToken().pipe(
              switchMap((newToken: string) => {
                isRefreshing = false;
                refreshTokenSubject.next(newToken);
                return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
              }),
              catchError((refreshErr) => {
                isRefreshing = false;
                auth.logout();
                return throwError(() => refreshErr);
              })
            );
          } else {
            return refreshTokenSubject.pipe(
              filter((newToken) => newToken !== null),
              take(1),
              switchMap((jwt) => {
                return next(req.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } }));
              })
            );
          }
        } else if (err.status === 401) {
             auth.logout();
        }
      }
      return throwError(() => err);
    }),
  );
};
