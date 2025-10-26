import { SpotifyPlaylistTrackItem } from "./spotify-playlist-track-item.i";

export interface SpotifyPlaylistTracks {
 href: String 
 items: SpotifyPlaylistTrackItem[];
 total: number;
}
