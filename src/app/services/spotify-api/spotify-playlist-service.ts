import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SpotifyPlaylistResponse } from '../../interfaces/spotify-api/spotify-playlist-response';
import {environment} from '../../../environments/environment.development'


@Injectable({
  providedIn: 'root'
})
export class SpotifyPlaylistService {

  constructor(
    private _http: HttpClient
  ){ }

  getPlaylist(): Observable<SpotifyPlaylistResponse>{
    
    const url = `${environment.URL_API}/playlists/3cEYpjA9oz9GiPac4AsH4n`;
    return this._http.get<SpotifyPlaylistResponse>(url)

  }
  
}
