---
description: Frequently Asked Questions about Oktomusic
---

# FAQ

## Why is only Chromium supported and not Firefox?

There are multiple reasons but the main one is the terrible lack of modern app features in Firefox.

Here are all many APIs the project uses or will use that are not supported by Firefox:

- [Progressive Web Apps (PWA)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Background Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Fetch_API)
- [Document Picture-in-Picture API](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API)
- [AudioSession API](https://www.w3.org/TR/audio-session)

Some of the missing features are explicitly rejected by the Firefox team, like [PWA support](https://bugzilla.mozilla.org/show_bug.cgi?id=1682593) (later "replaced" by a half-baked kind of [taskbar bookmark](https://www.firefox.com/en-US/firefox/143.0/releasenotes) without actual PWA features).

The monopoly of Chromium is sad (competition is always a good thing), but until Firefox, which was once one of the most inovative browser, stop shooting itself in the foot with stupid decisions and consequently [drop market share each year](https://gs.statcounter.com/browser-market-share), it just makes everything harder for the developer for a smaller and smaller number of users.
