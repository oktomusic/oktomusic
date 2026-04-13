---
description: How to setup Oktomusic as a kiosk application
---

# Kiosk Mode

Oktomusic is designed to work well in kiosk environments.

## Running in Kiosk Mode

We consider to have an instance already running at `https://music.example.com`.

We need a Chromium-based browser, just like when using Oktomusic normally.

Open the app once normally to login and configure it as needed.

Install the PWA from the right button on the address bar, the app should open in it's own window.

Go to the PWA browser setting by clicking the three dots, then app informations, then settings.

The settings page will open, take note of the hash after `chrome://app-settings/` in it's URL.

### Enable client Kiosk Mode

The app provide a kiosk interface mode that can be enabled from the client settings.

It provides help to quit the app by alerting the user to press `Alt+F4` when `Escape` or `Ctrl+Q` are pressed, and disables popup windows such as the Picture-in-Picture mode, as well as any external links.

### Launching the browser in Kiosk Mode

When launching the browser, we will provide some additional flags to make it work well in kiosk mode.

Here is an example command line to launch Google Chrome in kiosk mode:

```bash [kisk-mode.sh] {7}
google-chrome \
  --kiosk \
  --no-first-run \
  --no-default-browser-check \
  --disable-translate \
  --disable-geolocation \
  --app-id=<app_id>
```

> [!TIP]
> You can use most chromium based browsers with similar CLI flags.
>
> - `google-chrome`
> - `chromium`
> - `brave`
> - `microsoft-edge`
>
> Including their Flatpak versions:
>
> - `flatpak run com.google.Chrome`
> - `flatpak run org.chromium.Chromium`
> - `flatpak run com.brave.Browser`
> - `flatpak run com.microsoft.Edge`

> [!NOTE]
> Instead of installing the PWA and launching Chrome with it's app id, you can launch the app in a non-PWA mode.
>
> Replace the `--app-id` flag with `--app`:
>
> ```shell
> --app=https://music.example.com
> ```

<!-- TODO: Add more flags -->

## Configuring a Linux based Kiosk system

For a dedicated kiosk device, we will describe the setup of a minimal Wayland based Linux session.

WIP

- https://gitlab.gnome.org/GNOME/gnome-kiosk
- https://github.com/cage-kiosk/cage
