import { SpotifyTrackResponse } from "./spotify-track-response";
import { SpotifyArtistResponse } from "./spotify-artist-response.i";

export interface SpotifyAlbum {
    id: string;
    name: string;
    type: string;
    images?: Array<{
        url: string;
        height: number;
        width: number;
    }>;
    artists: Array<{
        id: string;
        name: string;
    }>;
    release_date: string;
    total_tracks: number;
}

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
    albums?: PagingObject<SpotifyAlbum>;
}
