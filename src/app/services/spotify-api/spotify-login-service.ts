import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CookieStorageService } from '../cookie-storage-service';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyLoginService {
  constructor(
    private _http: HttpClient,
    private _cookieService: CookieStorageService
  ) { }

  getToken(): Observable<TokenResponse> {
    const body = new HttpParams().set('grant_type', 'client_credentials');
    const basic = btoa(`${environment.CLIENT_ID}:${environment.CLIENT_SECRET}`);

    return this._http.post<TokenResponse>(
      environment.AUTH_API_URL,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basic}`
        }
      }
    ).pipe(
      tap(response => {
        // Almacenar el token y su tiempo de expiración
        this._cookieService.createCookie('access_token', response.access_token);
        const expiryTime = Date.now() + (response.expires_in * 1000);
        this._cookieService.createCookie('token_expiry', expiryTime.toString());
      }),
      catchError(error => {
        console.error('Error al obtener el token:', error);
        return throwError(() => new Error('Error al obtener el token de Spotify'));
      })
    );
  }
}
