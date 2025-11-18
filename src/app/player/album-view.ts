import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyAlbumService } from '../services/spotify-api/spotify-album-service';
import { SpotifySearch } from '../services/spotify-search';
import { Song } from '../interfaces/song';

@Component({
  selector: 'app-album-view',
  standalone: false,
  templateUrl: './album-view.html',
  styleUrl: './album-view.css'
})
export class AlbumView implements OnInit {
  protected album: any = null;
  protected tracks: Song[] = [];
  protected relatedAlbums: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private albumService: SpotifyAlbumService,
    private spotifySearch: SpotifySearch
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    // Fetch album metadata
    this.albumService.getAlbum(id).subscribe({
      next: (alb) => {
        this.album = alb;

        // Fetch album tracks
        this.albumService.getAlbumTracks(id).subscribe({
          next: (resp) => {
            const items = resp.tracks?.items || [];
            this.tracks = items.map((t: any) => ({
              cover: t?.album?.images?.[0]?.url || 'assets/default-track.png',
              artist: t?.artists?.[0]?.name || 'Unknown Artist',
              name: t?.name || 'Unknown'
            }));
          },
          error: (err) => console.error('Error cargando pistas del álbum:', err)
        });

        // Populate right-hand column with other albums by same artist (simple search)
        const artistName = this.album?.artists?.[0]?.name;
        if (artistName) {
          this.spotifySearch.search(artistName, ['album']).subscribe({
            next: (res) => {
              this.relatedAlbums = res.albums?.items || [];
            },
            error: (err) => console.error('Error buscando albums relacionados:', err)
          });
        }
      },
      error: (err) => console.error('Error cargando album:', err)
    });
  }

  // Play a track from left column
  playTrack(t: Song) {
    // navigate back to main player and set the song via query params OR use router navigation to pass state
    // For simplicity, navigate to root and include a fragment with track info not implemented; instead open player and let user select.
    // Here we'll just log the selection; Player component has selectTrackFromPlaylist which could be exposed via a shared service.
    console.log('Reproducir pista:', t.name);
  }

  // Open a different album from the right column
  openAlbum(album: any) {
    if (!album || !album.id) return;
    this.router.navigate(['/album', album.id]);
  }

  backToMain() {
    this.router.navigate(['/']);
  }
}
