import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '@shared/services/toast.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse) {
        switch (err.status) {
          case 0:
            toast.error('Network error. Please check your internet connection.');
            break;
          case 403:
            router.navigate(['/forbidden']);
            break;
          case 404:
            // 404 on API calls might be intentional (e.g. check if something exists)
            // so we don't always redirect to /not-found, but we could log it.
            console.error('API Resource not found:', req.url);
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            toast.error('Server error. Please try again later.');
            break;
          default:
            // For other errors like 400, 409, we usually want the component to handle them
            // to show specific validation messages.
            break;
        }
      }
      return throwError(() => err);
    }),
  );
};
