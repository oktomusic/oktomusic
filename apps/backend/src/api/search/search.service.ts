import { Injectable } from "@nestjs/common";

import type { AlbumModel } from "../album/album.model";
import { AlbumService } from "../album/album.service";
import type { ArtistModel } from "../artist/artist.model";
import { ArtistService } from "../artist/artist.service";
import type { PlaylistBasicModel } from "../playlist/playlist.model";
import { PlaylistService } from "../playlist/playlist.service";
import type { TrackModel } from "../track/track.model";
import { TrackService } from "../track/track.service";
import type { SearchMusicInput } from "./dto/search-music.input";

@Injectable()
export class SearchService {
  constructor(
    private readonly trackService: TrackService,
    private readonly albumService: AlbumService,
    private readonly artistService: ArtistService,
    private readonly playlistService: PlaylistService,
  ) {}

  async searchMusic(input: SearchMusicInput): Promise<{
    tracks: TrackModel[];
    albums: AlbumModel[];
    artists: ArtistModel[];
    playlists: PlaylistBasicModel[];
  }> {
    const trackLimit = input.trackLimit ?? input.limit;
    const albumLimit = input.albumLimit ?? input.limit;
    const artistLimit = input.artistLimit ?? input.limit;
    const playlistLimit = input.playlistLimit ?? input.limit;

    const tracksPromise: Promise<TrackModel[]> =
      input.includeTracks !== false
        ? this.trackService.searchTracks({
            name: input.trackName,
            artistId: input.artistId,
            albumId: input.albumId,
            limit: trackLimit,
            offset: input.offset,
          })
        : Promise.resolve([]);
    const albumsPromise: Promise<AlbumModel[]> =
      input.includeAlbums !== false
        ? this.albumService.searchAlbums({
            name: input.albumName,
            artistId: input.artistId,
            limit: albumLimit,
            offset: input.offset,
          })
        : Promise.resolve([]);
    const artistsPromise: Promise<ArtistModel[]> =
      input.includeArtists !== false
        ? this.artistService.searchArtists({
            name: input.artistName,
            limit: artistLimit,
            offset: input.offset,
          })
        : Promise.resolve([]);
    const playlistsPromise: Promise<PlaylistBasicModel[]> =
      input.includePlaylists !== false
        ? this.playlistService.searchUserPlaylists(
            input.playlistName ?? "",
            false,
            playlistLimit ?? 50,
          )
        : Promise.resolve([]);

    const [tracks, albums, artists, playlists] = await Promise.all([
      tracksPromise,
      albumsPromise,
      artistsPromise,
      playlistsPromise,
    ]);

    return { tracks, albums, artists, playlists };
  }
}
