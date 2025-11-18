import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { SpotifySearchResponse } from '../../interfaces/spotify-api/spotify-search-response';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAlbumService {
  constructor(private http: HttpClient) {}

  // Get album tracks and return shape compatible with SpotifySearchResponse
  getAlbumTracks(albumId: string): Observable<SpotifySearchResponse> {
    const url = `${environment.URL_API}/albums/${albumId}/tracks`;
    // The /albums/{id}/tracks endpoint returns a paging object with items (simplified tracks)
    return this.http.get<any>(url).pipe(
      map((resp) => {
        return {
          tracks: {
            href: resp.href,
            items: resp.items,
            limit: resp.limit || resp.items.length,
            next: resp.next || null,
            offset: resp.offset || 0,
            previous: resp.previous || null,
            total: resp.total || resp.items.length
          }
        } as SpotifySearchResponse;
      })
    );
  }

  // Get full album object (images, name, artists, release_date, etc.)
  getAlbum(albumId: string): Observable<any> {
    const url = `${environment.URL_API}/albums/${albumId}`;
    return this.http.get<any>(url);
  }
}
