import { HttpEventType, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { CookieStorageService } from '../services/cookie-storage-service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

  const _cookieService: CookieStorageService = inject(CookieStorageService);

  return next(req).pipe(
    tap(
      event => {
        if(!req.url.includes('/api/token'))
          return;

        if(event.type !== HttpEventType.Response)
          return;

        const body = event.body as any;

        if(!body || !body.access_token)
          return;

        // Usa expires_in si viene en la respuesta (segundos) y conviértelo a ms
        const expirationTimeMS = body.expires_in ? body.expires_in * 1000 : 3600 * 1000;
        const expirationDate = new Date(Date.now() + expirationTimeMS);

       _cookieService.createCookie('access_token', body.access_token, expirationDate);
       console.log("ACCESS TOKEN CREADO")
      }
    )
  );
};
