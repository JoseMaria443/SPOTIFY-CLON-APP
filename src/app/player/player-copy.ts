import { Component, signal, OnInit } from '@angular/core';
import { Song } from '../interfaces/song';
import { SpotifySearch } from '../services/spotify-search';
import { SpotifyAlbumService } from '../services/spotify-api/spotify-album-service';
import { SpotifySearchResponse } from '../interfaces/spotify-api/spotify-search-response';
import { debounceTime, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-player-copy',
  standalone: false,
  templateUrl: './player-copy.html',
  styleUrl: './player.css'
})
export class PlayerCopy implements OnInit {
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

  playlist: Song[] = [];

  constructor(
    private spotifySearch: SpotifySearch,
    private albumService: SpotifyAlbumService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // initialize an empty playlist similar to Player; keep logic same
    this.playlist = [
      { cover: "https://picsum.photos/201", name: "CANCION 1 ESTE TEXTO ES DEMASIADO LARGO", artist: "ARTISTA 1" },
      { cover: "https://picsum.photos/202", name: "CANCION 2", artist: "ARTISTA 1" },
      { cover: "https://picsum.photos/203", name: "CANCION 3", artist: "ARTISTA 1" },
    ];

    this.searchSubject.pipe(debounceTime(300)).subscribe({
      next: query => this.performSearch(query),
      error: err => console.error('search error', err)
    });
  }

  ngOnInit(): void {
    const albumId = this.route.snapshot.paramMap.get('id');
    if (albumId) {
      this.loadAlbumById(albumId);
    }
  }

  loadAlbumById(albumId: string): void {
    if (!albumId) return;
    this.albumService.getAlbum(albumId).subscribe({
      next: (alb) => {
        const albumImage = alb?.images?.[0]?.url || null;
        this.albumService.getAlbumTracks(albumId).subscribe({
          next: (resp) => {
            const items = resp.tracks?.items || [];
            const mapped: Song[] = items.map((t: any) => ({
              cover: albumImage || t?.album?.images?.[0]?.url || 'assets/default-track.png',
              artist: t?.artists?.[0]?.name || 'Unknown Artist',
              name: t?.name || 'Unknown',
              duration_ms: t?.duration_ms || null
            }));
            this.previousPlaylist = Array.isArray(this.playlist) ? [...this.playlist] : null;
            this.playlist = mapped;
            this.selectedAlbum = alb;
            if (mapped.length) {
              this.song = { cover: mapped[0].cover, name: mapped[0].name, artist: mapped[0].artist, duration_ms: mapped[0].duration_ms };
              if (mapped[0].duration_ms) this.duration = Math.round(mapped[0].duration_ms / 1000);
            }
          },
          error: (err) => console.error('Error loading album tracks', err)
        });
      },
      error: (err) => console.error('Error loading album metadata', err)
    });
  }

  goBack(): void {
    // navigate back to main player view
    this.router.navigate(['/']);
  }

  selectTrackFromPlaylist(item: Song): void {
    this.song = { cover: item.cover, name: item.name, artist: item.artist, duration_ms: (item as any).duration_ms };
    this.currentTime = 0;
    this.duration = (item as any).duration_ms ? Math.round(((item as any).duration_ms || 180000) / 1000) : 180;
  }

  formatTime(sec?: number): string {
    if (!sec && sec !== 0) return '0:00';
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  }

  seekTo(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const value = Number(input.value);
    if (!isNaN(value)) this.currentTime = value;
  }

  progressPercent(): number {
    if (!this.duration || this.duration <= 0) return 0;
    return Math.min(100, Math.round((this.currentTime / this.duration) * 100));
  }

  onSearch(event: Event): void {
    const searchInput = event.target as HTMLInputElement;
    this.searchSubject.next(searchInput.value);
  }

  private performSearch(query: string): void {
    if (!query.trim()) { this.searchResults.set({}); return; }
    this.spotifySearch.search(query, ['track', 'artist', 'album']).subscribe({
      next: (results) => this.searchResults.set(results),
      error: (err) => { console.error('search err', err); this.searchResults.set({}); }
    });
  }

  trackImage(track: any): string {
    try { return track?.album?.images?.[0]?.url || 'assets/default-track.png'; } catch { return 'assets/default-track.png'; }
  }

}
