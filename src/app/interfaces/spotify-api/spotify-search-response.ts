import { SpotifyTrackResponse } from "./spotify-track-response";
import { SpotifyArtistResponse } from "./spotify-artist-response.i";
interface PagingObject<T> {
    href: string;
    items: T[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
}
export interface SpotifySearchResponse {
    tracks?: PagingObject<SpotifyTrackResponse>;
    artists?: PagingObject<SpotifyArtistResponse>;

}
