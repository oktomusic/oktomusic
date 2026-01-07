// Web APIs not yet in TypeScript

// https://developer.mozilla.org/en-US/docs/Web/API/WindowControlsOverlay
interface Navigator {
  windowControlsOverlay?: {
    visible: boolean;
    height: number;
    width: number;
    addEventListener(
      type: "geometrychange",
      listener: (this: unknown, ev: Event) => unknown,
      options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener(
      type: "geometrychange",
      listener: (this: unknown, ev: Event) => unknown,
      options?: boolean | EventListenerOptions,
    ): void;
  };
}

// https://developer.mozilla.org/en-US/docs/Web/API/DocumentPictureInPicture
interface PictureInPictureOptions {
  disallowReturnToOpener: boolean;
  height: number;
  width: number;
  preferInitialWindowPlacement: boolean;
}

interface Window {
  documentPictureInPicture?: {
    window: Window;
    requestWindow(options?: PictureInPictureOptions): Promise<Window>;
    addEventListener(
      type: "enter",
      listener: (this: unknown, ev: Event) => unknown,
      options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener(
      type: "enter",
      listener: (this: unknown, ev: Event) => unknown,
      options?: boolean | EventListenerOptions,
    ): void;
  };
}

// https://github.com/w3c/audio-session/blob/main/explainer.md
enum AudioSessionState {
  "inactive",
  "active",
  "interrupted",
}

enum AudioSessionType {
  "auto",
  "playback",
  "transient",
  "transient-solo",
  "ambient",
  "play-and-record",
}

interface Navigator {
  // The default audio session that the user agent will use when media elements start/stop playing.
  readonly audioSession: AudioSession;
}

interface AudioSession extends EventTarget {
  type: AudioSessionType;

  readonly state: AudioSessionState;
  onstatechange: () => void;
}
