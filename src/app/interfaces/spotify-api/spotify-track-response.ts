import { SpotifyArtistResponse } from "./spotify-artist-response.i";
export interface SpotifyTrackResponse {
    id: string;
    name: string;
    artists: SpotifyArtistResponse[];
    duration_ms: number;
    track_number: number;
}
