# Music collection

## File organization

The library is the single read-only source of truth for your music collection.

It must use a tree structure with a folder per album, containing only [FLAC](https://xiph.org/flac) files.

Each folder is validated separately, with all files having consistent metadata and the exact same album related metadata.

Additionally, the cover of the album must be present as a file in the folder, named either `cover.png`, `cover.avif`, `cover.jpg` or `cover.jpeg`, taken by this order of preference.

These will be converted to lossy [AVIF](https://en.wikipedia.org/wiki/AVIF) images of various sizes, so the ideal would be to use a lossless [PNG](https://en.wikipedia.org/wiki/PNG) or [AVIF](https://en.wikipedia.org/wiki/AVIF) image as source.

The app supports lyrics stored as separate files in the album folder.
Supported formats are [TTML](https://en.wikipedia.org/wiki/Timed_Text_Markup_Language) `.ttml` and both [LRC](<https://en.wikipedia.org/wiki/LRC_(file_format)>) and [Enhanced LRC](<https://en.wikipedia.org/wiki/LRC_(file_format)#A2_extension_(Enhanced_LRC_format)>) `.lrc`.

To be picked up, the lyrics file must have the exact same base name as the corresponding track file, only with the relevant extension.
If multiple matching lyric files exist, `.ttml` is preferred over `.lrc`.

## Individual file metadata

FLAC files metadata is composed of [Vorbis comments](https://xiph.org/vorbis/doc/v-comment.html), and extracted by the server using [`metaflac`](https://github.com/xiph/flac).

> [!NOTE]
> Sadly, the Vorbis standard doesn't clearly define tag names and formats, so we have to define our own rules.
>
> We try to stick as close as possible to [Vorbis recommendations](https://xiph.org/vorbis/doc/v-comment.html#fieldnames), as well as names used by [MusicBrainz Picard](https://picard-docs.musicbrainz.org/en/variables/tags_basic.html).

| Tag Name      | Required | Format                             | Unique | Multiple Allowed |
| ------------- | -------- | ---------------------------------- | ------ | ---------------- |
| `TITLE`       | ✅       | String                             | ❌     | ❌               |
| `ARTIST`      | ✅       | String                             | ❌     | ✅               |
| `ALBUM`       | ✅       | String                             | ✅     | ❌               |
| `TRACKNUMBER` | ✅       | Integer (1-based)                  | ❌     | ❌               |
| `TOTALTRACKS` | ✅       | Integer (1-based)                  | ❌     | ❌               |
| `DISCNUMBER`  | ✅       | Integer (1-based)                  | ❌     | ❌               |
| `TOTALDISCS`  | ✅       | Integer (1-based)                  | ❌     | ❌               |
| `ISRC`        | ❌       | [ISRC code](https://isrc.ifpi.org) | ❌     | ❌               |

> [!IMPORTANT]
>
> - **Unique**: All files in the same album folder must have the exact same value for this tag
> - **Multiple Allowed**: The tag may appear multiple times in the same file
> - Splitting a tag value by separator (ex: `;`) is NOT supported and will never be
> - `TOTALTRACKS` is the total number of tracks in the track's disc `DISCNUMBER`
> - `TRACKNUMBER` is the number of the track in its disc `DISCNUMBER`
> - `TOTALTRACKS`, `TOTALDISCS` are validated for consistency across all files in the album folder
> - `DISCNUMBER` + `TRACKNUMBER` pairs are validated for uniqueness across all files in the album folder
> - At the moment, two different artists with the same name cannot be distinguished. The indexing process might support an additional key like `MUSICBRAINZ_ARTISTID` in the future to solve this.

## Indexing process

To allow moving/renaming files as well as modifying them (ex: replacing them with higher quality version) without breaking things like listening stats and playlists, we have to start with a stable data model that separate files from tracks.

The first step of the indexing process is to read each album folder, extract metadata for each file, and validate it individually.
Then, the album metadata is extracted from the files and validated for consistency.

We then have to both check for duplicates inside the file collection, match the extracted albums to database and determine which ones will need to be created.

An album in database is almost considered immutable and usually can't be updated by a later indexing job.

Multiple albums may share the same name, so we have to check multiple criterias to uniquely identify an album:

- Album name
- Album artist name(s)
- Track count per disc
- ISRC or track names if no ISRC is present

> [!NOTE]
> While ISRC codes aren't mandatory (as it prevent using "private", non published albums)
> we use it instead of track names when possible to prevent rare cases of albums sharing the name/artist/track count and track names.
>
> One example would be albums released both in a explicit and non-explicit version, like _I'm Good (Blue)_ by _David Guetta_, with the exact same metadata and track names except for the ISRC codes of the tracks.
>
> If an ISRC code is present for a track, it's name _can_ be updated by the indexing process since we already have a unique way to identify the track.

Finally music files are linked to their corresponding track in database, and any required transcoding/cover derived files are generated.

> [!NOTE]
> Multiple albums can share individual tracks with the same ISRC code.
>
> Since we start from a flat files collection, we won't de-duplicate tracks files across albums
> (a source file is always linked to a single track in a single album, not a ISRC).
>
> This may cause some data duplication (including on the client when downloading tracks).
