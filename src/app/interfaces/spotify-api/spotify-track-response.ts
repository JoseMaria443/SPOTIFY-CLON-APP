import { SpotifyArtistResponse } from "./spotify-artist-response.i";
import { SpotifyAlbum } from "./spotify-search-response";

export interface SpotifyTrackResponse {
    id: string;
    name: string;
    artists: SpotifyArtistResponse[];
    duration_ms: number;
    track_number: number;
    album?: SpotifyAlbum;
}
