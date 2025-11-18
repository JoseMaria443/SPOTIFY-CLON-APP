import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retryWhen, delay, take, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development'; 
import { SpotifySearchResponse } from '../interfaces/spotify-api/spotify-search-response';
import { TokenService } from './auth/token.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifySearch {
  private baseUrl = environment.URL_API;
  private maxRetries = 3;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  search(query: string, types: string[] = ['track', 'artist', 'album']): Observable<SpotifySearchResponse> {
    console.log('Iniciando búsqueda con query:', query);
   
    if (!query) {
      console.log('Query vacío, retornando respuesta vacía');
      return of({} as SpotifySearchResponse); 
    }

    // Verificar si hay token válido antes de hacer la petición
    if (!this.tokenService.getStoredToken() || this.tokenService.isTokenExpired()) {
      console.log('Token inválido o expirado, solicitando nuevo token');
        // Manejar la renovación del token y luego hacer la búsqueda
        return this.tokenService.requestNewToken().pipe(
          tap(() => console.log('Nuevo token obtenido')),
          switchMap(() => this.performSearch(query, types)),
          catchError(error => {
            console.error('Error al obtener nuevo token:', error);
            return throwError(() => new Error('Error al obtener el token'));
          })
        );
    }

      return this.performSearch(query, types);
    }

    private performSearch(query: string, types: string[]): Observable<SpotifySearchResponse> {
    let params = new HttpParams()
        .set('q', query) 
        .set('type', types.join(',')) 
        .set('limit', '20'); 
    
    const url = `${this.baseUrl}/search`;
    
    console.log('Realizando petición de búsqueda a:', url);
    return this.http.get<SpotifySearchResponse>(url, { params: params }).pipe(
      tap(response => {
        console.log('Respuesta de búsqueda recibida:', {
          tracks: response.tracks?.items?.length || 0,
          artists: response.artists?.items?.length || 0,
          albums: response.albums?.items?.length || 0
        });
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en la búsqueda:', error);
        
        if (error.status === 401) {
          console.log('Error de autorización, intentando renovar token...');
            return this.tokenService.requestNewToken().pipe(
              tap(() => console.log('Token renovado, reintentando búsqueda')),
              switchMap(() => this.performSearch(query, types)),
              catchError(tokenError => {
                console.error('Error al renovar token:', tokenError);
                return throwError(() => tokenError);
              })
            );
        }
        
        return throwError(() => error);
      }),
      retryWhen(errors => 
        errors.pipe(
          delay(1000),
          take(this.maxRetries),
          tap(retryCount => console.log(`Reintento ${retryCount + 1}/${this.maxRetries}`))
        )
      )
    );
  }
}
