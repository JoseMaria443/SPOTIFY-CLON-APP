import { Component, OnInit, signal } from '@angular/core';
import { SpotifyLoginService } from './services/spotify-api/spotify-login-service';
import { SpotifyPlaylistService } from './services/spotify-api/spotify-playlist-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('EXAMPLE_APP');

  constructor(
    private _spotifyLoginService: SpotifyLoginService,
    private _spotifyPlaylistService: SpotifyPlaylistService
  ) {}


  ngOnInit(): void {
    // Intentar obtener un nuevo token al iniciar la aplicación
    this._spotifyLoginService.getToken().subscribe({
      next: (response) => {
        console.log('Token obtenido correctamente');
      },
      error: (error) => {
        console.error('Error al obtener el token:', error);
      }
    });
  }

  doRequest(){
    this._spotifyPlaylistService.getPlaylist().subscribe((data)=>console.log(data));
  }

}
