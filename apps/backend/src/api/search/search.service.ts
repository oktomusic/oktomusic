import { Injectable } from "@nestjs/common";

import type { AlbumModel } from "../album/album.model";
import { AlbumService } from "../album/album.service";
import type { ArtistModel } from "../artist/artist.model";
import { ArtistService } from "../artist/artist.service";
import type { TrackModel } from "../track/track.model";
import { TrackService } from "../track/track.service";
import type { SearchMusicInput } from "./dto/search-music.input";

@Injectable()
export class SearchService {
  constructor(
    private readonly trackService: TrackService,
    private readonly albumService: AlbumService,
    private readonly artistService: ArtistService,
  ) {}

  async searchMusic(input: SearchMusicInput): Promise<{
    tracks: TrackModel[];
    albums: AlbumModel[];
    artists: ArtistModel[];
  }> {
    const [tracks, albums, artists] = await Promise.all([
      input.includeTracks !== false
        ? this.trackService.searchTracks({
            name: input.trackName,
            artistId: input.artistId,
            albumId: input.albumId,
            limit: input.limit,
            offset: input.offset,
          })
        : Promise.resolve<TrackModel[]>([]),
      input.includeAlbums !== false
        ? this.albumService.searchAlbums({
            name: input.albumName,
            artistId: input.artistId,
            limit: input.limit,
            offset: input.offset,
          })
        : Promise.resolve<AlbumModel[]>([]),
      input.includeArtists !== false
        ? this.artistService.searchArtists({
            name: input.artistName,
            limit: input.limit,
            offset: input.offset,
          })
        : Promise.resolve<ArtistModel[]>([]),
    ]);

    return { tracks, albums, artists };
  }
}
