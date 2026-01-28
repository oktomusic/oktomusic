---
description: How to setup Oktomusic as a kiosk application
---

# Kiosk Mode

Oktomusic is designed to work well in kiosk environments.

## Running in Kiosk Mode

We consider to have an instance already running at `https://music.example.com`.

We need a Chromium-based browser, just like when using Oktomusic normally.

Open the app once normally to login and configure it as needed.

### Enable client Kiosk Mode

The app provide a kiosk interface mode that can be enabled from the client settings.

It provides help to quit the app by alerting the user to press `Alt+F4` when `Escape` or `Ctrl+Q` are pressed, and disables popup windows such as the Picture-in-Picture mode.

### Launching the browser in Kiosk Mode

When launching the browser, we need to provide some flags to make it work well in kiosk mode.

Here is an example command line to launch Google Chrome in kiosk mode:

```bash
google-chrome --kiosk --no-first-run --disable-translate https://music.example.com
```

<!-- TODO: Add more flags -->

## Configuring a Linux based Kiosk system

For a dedicated kiosk device, we will describe the setup of a minimal Wayland based Linux session.

WIP

- https://gitlab.gnome.org/GNOME/gnome-kiosk
- https://github.com/cage-kiosk/cage
