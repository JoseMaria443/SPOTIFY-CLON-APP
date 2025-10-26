// src/app/interceptors/add-auth-header-interceptor.ts (Unificado)

import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieStorageService } from '../services/cookie-storage-service';
import { SpotifyLoginService } from '../services/spotify-api/spotify-login-service';
import { catchError, switchMap, throwError, Observable, of } from 'rxjs'; 

let isRefreshing = false;

export const addAuthHeaderInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const SPOTIFY_API_URL = 'api.spotify.com/v1'; 

  if (!req.url.startsWith(SPOTIFY_API_URL)) {  
    return next(req);
  }
  
  const _cookieService: CookieStorageService = inject(CookieStorageService);
  const _loginService: SpotifyLoginService = inject(SpotifyLoginService);
  const addTokenHeader = (request: HttpRequest<unknown>, token: string) => {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
  };

  if (!_cookieService.isCookieValid('access_token')) {
    console.log('Token inválido/ausente, renovando antes de la petición...');

    if (!isRefreshing) {
      isRefreshing = true;
      return _loginService.getToken().pipe(
        switchMap(() => {
          isRefreshing = false;
          const newToken = _cookieService.getCookieValue('access_token');
          const newReq = addTokenHeader(req, newToken);
          return next(newReq);
        }),
        catchError(err => {
          isRefreshing = false;
          return throwError(() => err); 
        })
      );
    }
  }
  const currentToken = _cookieService.getCookieValue('access_token');
  const reqWithToken = addTokenHeader(req, currentToken);
  return next(reqWithToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isRefreshing) {
        return throwError(() => error);
      }
      console.log('Error 401 recibido. Renovando token y reintentando...');
      isRefreshing = true;

      return _loginService.getToken().pipe(
        switchMap(() => {
          isRefreshing = false;
          const newToken = _cookieService.getCookieValue('access_token');
          const reattemptReq = addTokenHeader(req, newToken); 
          return next(reattemptReq);
        }),
        catchError(err => {
          isRefreshing = false;
          return throwError(() => err);
        })
      );
    })
  );
};