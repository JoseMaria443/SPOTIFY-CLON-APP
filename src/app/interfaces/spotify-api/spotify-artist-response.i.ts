export interface SpotifyArtistResponse {
    id: string;
    name: string;
    href: string;
    images?: Array<{
        url: string;
        height: number;
        width: number;
    }>;
}
