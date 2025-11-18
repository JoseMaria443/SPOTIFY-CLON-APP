import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { CookieStorageService } from '../cookie-storage-service';

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'spotify_access_token';
  private readonly EXPIRY_KEY = 'spotify_token_expiry';

  constructor(
    private http: HttpClient,
    private cookieService: CookieStorageService
  ) { }

  getStoredToken(): string | null {
    if (this.isTokenExpired()) {
      this.clearToken();
      return null;
    }
    return this.cookieService.getCookieValue(this.TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const expiry = this.cookieService.getCookieValue(this.EXPIRY_KEY);
    if (!expiry) return true;
    return new Date().getTime() > parseInt(expiry);
  }

  clearToken(): void {
    this.cookieService.deleteCookie(this.TOKEN_KEY);
    this.cookieService.deleteCookie(this.EXPIRY_KEY);
  }

  requestNewToken(): Observable<string> {
    const credentials = btoa(`${environment.CLIENT_ID}:${environment.CLIENT_SECRET}`);
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', `Basic ${credentials}`);

    const body = 'grant_type=client_credentials';

    return this.http.post<SpotifyTokenResponse>(
      environment.AUTH_API_URL,
      body,
      { headers }
    ).pipe(
      tap(response => this.storeToken(response)),
      map(response => response.access_token),
      catchError(error => {
        console.error('Error obtaining token:', error);
        return throwError(() => error);
      })
    );
  }

  private storeToken(response: SpotifyTokenResponse): void {
    const expiryTime = new Date().getTime() + (response.expires_in * 1000);
    this.cookieService.createCookie(this.TOKEN_KEY, response.access_token);
    this.cookieService.createCookie(this.EXPIRY_KEY, expiryTime.toString());
  }
}