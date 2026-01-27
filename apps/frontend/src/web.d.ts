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
type AudioSessionState = "inactive" | "active" | "interrupted";

type AudioSessionType =
  | "auto"
  | "playback"
  | "transient"
  | "transient-solo"
  | "ambient"
  | "play-and-record";

interface Navigator {
  // The default audio session that the user agent will use when media elements start/stop playing.
  readonly audioSession: AudioSession;
}

interface AudioSession extends EventTarget {
  type: AudioSessionType;

  readonly state: AudioSessionState;
  onstatechange: ((this: AudioSession, event: Event) => void) | null;
}

// https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs
// https://webmachinelearning.github.io/translation-api
// https://webmachinelearning.github.io/writing-assistance-apis/#shared-apis
type Availability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

interface CreateMonitor extends EventTarget {
  ondownloadprogress:
    | ((this: CreateMonitor, event: ProgressEvent) => void)
    | null;
}

type CreateMonitorCallback = (monitor: CreateMonitor) => void;

interface DestroyableModel {
  destroy(): void;
}

interface Translator extends DestroyableModel {
  readonly sourceLanguage: string;
  readonly targetLanguage: string;
  readonly inputQuota: number;

  translate(
    input: string,
    options?: TranslatorTranslateOptions,
  ): Promise<string>;
  translateStreaming(
    input: string,
    options?: TranslatorTranslateOptions,
  ): ReadableStream<string>;
  measureInputUsage(
    input: string,
    options?: TranslatorTranslateOptions,
  ): Promise<number>;
}

interface TranslatorConstructor {
  create(options: TranslatorCreateOptions): Promise<Translator>;
  availability(options: TranslatorCreateCoreOptions): Promise<Availability>;
}

declare const Translator: TranslatorConstructor;

interface TranslatorCreateCoreOptions {
  readonly sourceLanguage: string;
  readonly targetLanguage: string;
}

interface TranslatorCreateOptions extends TranslatorCreateCoreOptions {
  readonly signal?: AbortSignal;
  readonly monitor?: CreateMonitorCallback;
}

interface TranslatorTranslateOptions {
  readonly signal?: AbortSignal;
}

interface LanguageDetector extends DestroyableModel {
  readonly expectedInputLanguages: readonly string[] | null;
  readonly inputQuota: number;

  detect(
    input: string,
    options?: LanguageDetectorDetectOptions,
  ): Promise<LanguageDetectionResult[]>;
  measureInputUsage(
    input: string,
    options?: LanguageDetectorDetectOptions,
  ): Promise<number>;
}

interface LanguageDetectorConstructor {
  create(options?: LanguageDetectorCreateOptions): Promise<LanguageDetector>;
  availability(
    options?: LanguageDetectorCreateCoreOptions,
  ): Promise<Availability>;
}

declare const LanguageDetector: LanguageDetectorConstructor;

interface LanguageDetectorCreateCoreOptions {
  readonly expectedInputLanguages?: readonly string[];
}

interface LanguageDetectorCreateOptions extends LanguageDetectorCreateCoreOptions {
  readonly signal?: AbortSignal;
  readonly monitor?: CreateMonitorCallback;
}

interface LanguageDetectorDetectOptions {
  readonly signal?: AbortSignal;
}

interface LanguageDetectionResult {
  readonly detectedLanguage: string;
  readonly confidence: number;
}
