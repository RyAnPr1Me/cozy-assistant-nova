
import { toast } from "sonner";

const CLIENT_ID = "ee1ae4430f0b433ebbded6e6e0c5ba79";
const CLIENT_SECRET = "99cc0ed7dbb54a91b8f8102ef730df2e";
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";

let accessToken: string | null = null;
let tokenExpiration: number = 0;

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  external_urls: {
    spotify: string;
  };
}

export interface SpotifySearchResult {
  tracks: SpotifyTrack[];
}

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && tokenExpiration > Date.now()) {
    return accessToken;
  }

  try {
    // Get new token
    const response = await fetch(SPOTIFY_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(`Failed to get Spotify token: ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiration = Date.now() + (data.expires_in * 1000);
    
    return accessToken;
  } catch (error) {
    console.error("Error getting Spotify access token:", error);
    throw error;
  }
}

export async function searchSpotify(query: string, type: "track" | "artist" | "album" = "track", limit: number = 5): Promise<SpotifySearchResult | null> {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(
      `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      tracks: data.tracks.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        artists: item.artists.map((artist: any) => ({ name: artist.name })),
        album: {
          name: item.album.name,
          images: item.album.images,
        },
        external_urls: {
          spotify: item.external_urls.spotify,
        },
      })),
    };
  } catch (error) {
    console.error("Error searching Spotify:", error);
    toast.error("Failed to search Spotify");
    return null;
  }
}

export async function getRecommendations(seedTracks: string[], limit: number = 5): Promise<SpotifyTrack[] | null> {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(
      `${SPOTIFY_API_URL}/recommendations?seed_tracks=${seedTracks.join(",")}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.tracks.map((item: any) => ({
      id: item.id,
      name: item.name,
      artists: item.artists.map((artist: any) => ({ name: artist.name })),
      album: {
        name: item.album.name,
        images: item.album.images,
      },
      external_urls: {
        spotify: item.external_urls.spotify,
      },
    }));
  } catch (error) {
    console.error("Error getting Spotify recommendations:", error);
    toast.error("Failed to get music recommendations");
    return null;
  }
}
