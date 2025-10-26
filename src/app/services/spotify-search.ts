import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {of} from 'rxjs';
import { environment } from '../../environments/environment.development'; 
import { SpotifySearchResponse } from '../interfaces/spotify-api/spotify-search-response';
@Injectable({
  providedIn: 'root'
})
export class SpotifySearch {
  private baseUrl = environment.URL_API;
  constructor(private http: HttpClient) { }
  search(query: string, types: string[] = ['track', 'artist']): Observable<SpotifySearchResponse> {
   
    if (!query) {
      return of({} as SpotifySearchResponse); 
    }
    let params = new HttpParams()
        .set('q', query) 
        .set('type', types.join(',')) 
        .set('limit', '10'); 
    const url = `${this.baseUrl}/search`;
    
    return this.http.get<SpotifySearchResponse>(url, { params: params });
  }
}
