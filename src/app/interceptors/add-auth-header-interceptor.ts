import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/auth/token.service';

let isRefreshing = false;

export const addAuthHeaderInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);

  // No interceptar peticiones al endpoint de token
  if (req.url.includes('accounts.spotify.com/api/token')) {
    return next(req);
  }

  // Solo interceptar peticiones a la API de Spotify
  if (!req.url.includes('api.spotify.com/v1')) {
    return next(req);
  }

  const addTokenHeader = (request: HttpRequest<unknown>, token: string) => {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
  };

  const currentToken = tokenService.getStoredToken();
  
  if (!currentToken || tokenService.isTokenExpired()) {
    if (!isRefreshing) {
      isRefreshing = true;
      console.log('Token no válido, solicitando uno nuevo...');
      return tokenService.requestNewToken().pipe(
        switchMap(newToken => {
          isRefreshing = false;
          const newReq = addTokenHeader(req, newToken);
          return next(newReq);
        }),
        catchError(err => {
          isRefreshing = false;
          console.error('Error al renovar token:', err);
          return throwError(() => err); 
        })
      );
    }
    return throwError(() => new Error('Token refresh in progress'));
  }

  const reqWithToken = addTokenHeader(req, currentToken);
  return next(reqWithToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isRefreshing) {
        return throwError(() => error);
      }
      console.log('Error 401 recibido. Renovando token y reintentando...');
      isRefreshing = true;

      return tokenService.requestNewToken().pipe(
        switchMap(newToken => {
          isRefreshing = false;
          const reattemptReq = addTokenHeader(req, newToken); 
          return next(reattemptReq);
        }),
        catchError(err => {
          isRefreshing = false;
          console.error('Error al reintento con nuevo token:', err);
          return throwError(() => err);
        })
      );
    })
  );
};