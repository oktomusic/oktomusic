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
