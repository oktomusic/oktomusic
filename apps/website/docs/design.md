# Music collection

Single read-only source of truth for your music collection.

A folder structure with a folder per album, containing only FLAC files.

Each folder is validated separately, all files should have consistent metadata and the exact same album related metadata.

Metadata is composed of [Vorbis comments](https://xiph.org/vorbis/doc/v-comment.html) extracted using `metaflac`.

> [!INFO]
> Sadly, the standard is very loose, so we have to define our own rules for required tags and formats.

| Tag Name      | Required | Format            | Unique | Multiple Allowed |
| ------------- | -------- | ----------------- | ------ | ---------------- |
| `TITLE`       | Yes      | String            | No     | No               |
| `ARTIST`      | Yes      | String            | No     | Yes              |
| `ALBUM`       | Yes      | String            | Yes    | No               |
| `TRACKNUMBER` | Yes      | Integer (1-based) | No     | No               |
| `TOTALTRACKS` | Yes      | Integer (1-based) | No     | No               |
| `DISCNUMBER`  | Yes      | Integer (1-based) | No     | No               |
| `TOTALDISCS`  | Yes      | Integer (1-based) | No     | No               |

Additionally, the cover of the album must be present as a file in the folder, named either `cover.png`, `cover.avif`, `cover.jpg` or `cover.jpeg`, taken by this order of preference.

These will be converted to lossy AVIF images of various sizes, so the ideal would be to use a lossless PNG or AVIF image as source.
