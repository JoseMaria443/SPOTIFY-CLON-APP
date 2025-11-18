import { Component, signal } from '@angular/core';
import { Song } from '../interfaces/song';
import { SpotifySearch } from '../services/spotify-search';
import { Router } from '@angular/router';
import { SpotifyAlbumService } from '../services/spotify-api/spotify-album-service';
import { SpotifySearchResponse } from '../interfaces/spotify-api/spotify-search-response';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-player',
  standalone: false,
  templateUrl: './player.html',
  styleUrl: './player.css'
})
export class Player {
  private searchSubject = new Subject<string>();
  protected searchResults = signal<SpotifySearchResponse>({});
  protected selectedAlbum: any = null;
  private previousPlaylist: Song[] | null = null;

  song: Song = {
    cover: "https://picsum.photos/200",
    name: "CANCION 1",
    artist: "ARTISTA 1",
    duration_ms: 180000
  }

  // Basic progress state (seconds)
  protected currentTime: number = 0;
  protected duration: number = 180; // default duration (seconds)

  playlist: Song[] = [
    {
      cover: "https://picsum.photos/201",
      name: "CANCION 1 ESTE TEXTO ES DEMASIADO LARGO",
      artist: "ARTISTA 1"
    },
    {
      cover: "https://picsum.photos/202",
      name: "CANCION 2",
      artist: "ARTISTA 1"
    },
    {
      cover: "https://picsum.photos/203",
      name: "CANCION 3",
      artist: "ARTISTA 1"
    },
    {
      cover: "https://picsum.photos/204",
      name: "CANCION 4",
      artist: "ARTISTA 1"
    },
    {
      cover: "https://picsum.photos/205",
      name: "CANCION 5",
      artist: "ARTISTA 1"
    },
    {
      cover: "https://picsum.photos/206",
      name: "CANCION 6",
      artist: "ARTISTA 1"
    },
    {
      cover: "https://picsum.photos/207",
      name: "CANCION 7",
      artist: "ARTISTA 1"
    },
    {
      cover: "https://picsum.photos/208",
      name: "CANCION 8",
      artist: "ARTISTA 1"
    },
  ];

  constructor(
    private spotifySearch: SpotifySearch,
    private router: Router,
    private albumService: SpotifyAlbumService
  ) {
    console.log("Inicializando Player component");
    
    // Configurar el observable de búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe({
      next: query => {
        console.log('Ejecutando búsqueda para:', query);
        this.performSearch(query);
      },
      error: error => {
        console.error('Error en el observable de búsqueda:', error);
      }
    });
  }

  // When user clicks an album, fetch album metadata and tracks and show them in the same view
  showAlbum(album: any): void {
    if (!album || !album.id) return;
    console.log('Cargando canciones del álbum:', album.name, album.id);

    // Fetch album metadata first to get a reliable cover
    this.albumService.getAlbum(album.id).subscribe({
      next: (alb) => {
        const albumImage = alb?.images?.[0]?.url || null;

        // Then fetch album tracks and map them to Song
        this.albumService.getAlbumTracks(album.id).subscribe({
          next: (resp) => {
            const items = resp.tracks?.items || [];
            console.log('Album tracks received:', items.length);

            const mapped: Song[] = items.map((t: any) => ({
              cover: albumImage || t?.album?.images?.[0]?.url || 'assets/default-track.png',
              artist: t?.artists?.[0]?.name || 'Unknown Artist',
              name: t?.name || 'Unknown',
              duration_ms: t?.duration_ms || null
            }));

            // Keep previous playlist so the user can restore
            this.previousPlaylist = Array.isArray(this.playlist) ? [...this.playlist] : null;

            // Replace playlist with album tracks and set selectedAlbum
            this.playlist = mapped;
            this.selectedAlbum = alb;

            // Select first track if available
            if (mapped.length) {
              this.song = {
                cover: mapped[0].cover,
                name: mapped[0].name,
                artist: mapped[0].artist,
                duration_ms: mapped[0].duration_ms
              };
              if (mapped[0].duration_ms) {
                this.duration = Math.round(mapped[0].duration_ms / 1000);
              }
            }
          },
          error: (err) => {
            console.error('Error al obtener canciones del álbum:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener metadata del álbum:', err);
        // Fallback: try loading tracks without album metadata
        this.albumService.getAlbumTracks(album.id).subscribe({
          next: (resp) => {
            const items = resp.tracks?.items || [];
            const mapped: Song[] = items.map((t: any) => ({
              cover: t?.album?.images?.[0]?.url || 'assets/default-track.png',
              artist: t?.artists?.[0]?.name || 'Unknown Artist',
              name: t?.name || 'Unknown',
              duration_ms: t?.duration_ms || null
            }));
            this.previousPlaylist = Array.isArray(this.playlist) ? [...this.playlist] : null;
            this.playlist = mapped;
            this.selectedAlbum = album;
            if (mapped.length) {
              this.song = { cover: mapped[0].cover, name: mapped[0].name, artist: mapped[0].artist, duration_ms: mapped[0].duration_ms };
              if (mapped[0].duration_ms) {
                this.duration = Math.round(mapped[0].duration_ms / 1000);
              }
            }
          },
          error: (err2) => console.error('Error al obtener canciones del álbum (fallback):', err2)
        });
      }
    });
  }

  restorePlaylist(): void {
    if (this.previousPlaylist) {
      this.playlist = [...this.previousPlaylist];
      this.previousPlaylist = null;
    }
    this.selectedAlbum = null;
    // clear search results so detail panel shows
    this.searchResults.set({});
  }

  selectTrackFromPlaylist(item: Song): void {
    this.song = { cover: item.cover, name: item.name, artist: item.artist, duration_ms: (item as any).duration_ms };
    // reset progress when selecting a new track
    this.currentTime = 0;
    // optionally set a default duration or derive if available
    this.duration = (item as any).duration_ms ? Math.round(((item as any).duration_ms || 180000) / 1000) : 180;
  }

  // Format seconds to mm:ss (minutes and seconds)
  formatTime(sec?: number): string {
    if (!sec && sec !== 0) return '0:00';
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  }

  // Called from the progress range input
  seekTo(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const value = Number(input.value);
    if (!isNaN(value)) {
      this.currentTime = value;
      // If you want to actually control audio, forward this to the audio controller
      console.log('Seeking to', value, 'seconds');
    }
  }

  // Helper used in template to compute percent
  progressPercent(): number {
    if (!this.duration || this.duration <= 0) return 0;
    return Math.min(100, Math.round((this.currentTime / this.duration) * 100));
  }

  onSearch(event: Event): void {
    const searchInput = event.target as HTMLInputElement;
    const query = searchInput.value;
    console.log('Nuevo término de búsqueda:', query);
    this.searchSubject.next(query);
  }

  private performSearch(query: string): void {
    if (!query.trim()) {
      console.log('Búsqueda vacía, limpiando resultados');
      this.searchResults.set({});
      return;
    }

    console.log('Iniciando búsqueda en Spotify API para:', query);
    this.spotifySearch.search(query, ['track', 'artist', 'album']).subscribe({
      next: (results) => {
        console.log('Resultados de búsqueda recibidos:', {
          tracks: results.tracks?.items?.length || 0,
          artists: results.artists?.items?.length || 0,
          albums: results.albums?.items?.length || 0
        });
        this.searchResults.set(results);
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        if (error.status === 401) {
          console.error('Error de autorización. Posible token inválido.');
        }
        this.searchResults.set({});
      }
    });
  }

  // Helpers used by the template to avoid compile-time type-check errors
  artistImage(artist: any): string {
    try {
      return artist?.images?.[0]?.url || 'assets/default-artist.png';
    } catch {
      return 'assets/default-artist.png';
    }
  }

  trackImage(track: any): string {
    try {
      return track?.album?.images?.[0]?.url || 'assets/default-track.png';
    } catch {
      return 'assets/default-track.png';
    }
  }

}
