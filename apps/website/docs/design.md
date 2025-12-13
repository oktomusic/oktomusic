# Music collection

Single read-only source of truth for your music collection.

A folder structure with a folder per album, containing only FLAC files.

Each folder is validated separately, all files should have consistent metadata and the exact same album related metadata.

Metadata is composed of [Vorbis comments](https://xiph.org/vorbis/doc/v-comment.html) extracted using [`metaflac`](https://github.com/xiph/flac).

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

The app support lyrics stored as separate files in the album folder, named as the track title. The supported formats are [TTML](https://en.wikipedia.org/wiki/Timed_Text_Markup_Language) `.ttml` and both [LRC](<https://en.wikipedia.org/wiki/LRC_(file_format)>) and [Enhanced LRC](<https://en.wikipedia.org/wiki/LRC_(file_format)#A2_extension_(Enhanced_LRC_format)>) `.lrc`.

---

> [!INFO]
> Why is only Chromium supported and not Firefox?
>
> There are multiple reasons but the main one is the terrible lack of modern features in Firefox.
>
> Here are all the APIs the project uses or will use that are not supported by Firefox:
>
> - [Progressive Web Apps (PWA)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
> - [Background Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Fetch_API)
> - [Document Picture-in-Picture API](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API)
> - [AudioSession API](https://www.w3.org/TR/audio-session)
>
> The monopoly of Chromium is sad, but until Firefox, which was once one of the most inovative browser, stop shooting itself in the foot with stupid decisions it's the only viable option for a modern web app.
