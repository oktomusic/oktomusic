import { useEffect, useRef, useState } from "react";

export interface TranslatorState {
  readonly translator: Translator | null;
  readonly error: string | null;
  readonly status: "idle" | "loading" | "downloading" | "ready" | "error";
  readonly downloadProgress: number | null;
}

export interface TranslatorOptions {
  readonly enabled: boolean;
  readonly sourceLanguage: string | null;
  readonly targetLanguage: string;
}

/**
 * Creates and manages a single Translator instance.
 *
 * Lifecycle:
 * - Resets when disabled or languages change.
 * - Aborts pending creation on teardown.
 * - Destroys the translator to release resources.
 * - Reports download progress when model is being downloaded.
 */
export function useTranslator(options: TranslatorOptions): TranslatorState {
  const [translator, setTranslator] = useState<Translator | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TranslatorState["status"]>(
    options.enabled && options.sourceLanguage ? "loading" : "idle",
  );
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const translatorRef = useRef<Translator | null>(null);

  const { enabled, sourceLanguage, targetLanguage } = options;

  useEffect(() => {
    let isActive = true;

    const destroyTranslator = () => {
      const current = translatorRef.current;
      translatorRef.current = null;
      if (current) {
        current.destroy();
      }
    };

    const scheduleReset = () => {
      // Avoid synchronous state updates inside effects.
      queueMicrotask(() => {
        if (!isActive) {
          return;
        }

        setTranslator(null);
        setError(null);
        setDownloadProgress(null);
        setStatus(enabled && sourceLanguage ? "loading" : "idle");
      });
    };

    // Ensure stale instances are released before re-creating.
    destroyTranslator();
    scheduleReset();

    if (!enabled || !sourceLanguage) {
      return () => {
        isActive = false;
        destroyTranslator();
      };
    }

    // Skip if source and target are the same language.
    if (sourceLanguage === targetLanguage) {
      queueMicrotask(() => {
        if (isActive) {
          setStatus("idle");
        }
      });
      return () => {
        isActive = false;
        destroyTranslator();
      };
    }

    // Abort creation if the component unmounts or input changes.
    const abortController = new AbortController();

    const monitorCallback: CreateMonitorCallback = (monitor) => {
      monitor.ondownloadprogress = (event: ProgressEvent) => {
        if (abortController.signal.aborted || !isActive) {
          return;
        }

        if (event.lengthComputable && event.total > 0) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setDownloadProgress(progress);
        }
        setStatus("downloading");
      };
    };

    Translator.create({
      sourceLanguage,
      targetLanguage,
      signal: abortController.signal,
      monitor: monitorCallback,
    })
      .then((createdTranslator) => {
        if (abortController.signal.aborted) {
          createdTranslator.destroy();
          return;
        }

        translatorRef.current = createdTranslator;
        setTranslator(createdTranslator);
        setDownloadProgress(null);
        setStatus("ready");
      })
      .catch((createError: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setError(
          createError instanceof Error
            ? createError.message
            : "Failed to create translator",
        );
        setDownloadProgress(null);
        setStatus("error");
      });

    return () => {
      isActive = false;
      abortController.abort();
      destroyTranslator();
    };
  }, [enabled, sourceLanguage, targetLanguage]);

  return { translator, error, status, downloadProgress };
}

export interface LyricsTranslationState {
  readonly translatedLyrics: ReadonlyArray<string> | null;
  readonly error: string | null;
  readonly status:
    | "idle"
    | "loading"
    | "downloading"
    | "translating"
    | "ready"
    | "error";
  readonly downloadProgress: number | null;
}

export interface LyricsTranslationOptions {
  readonly enabled: boolean;
  readonly sourceLanguage: string | null;
  readonly targetLanguage: string;
  readonly lyrics: ReadonlyArray<{ readonly t: string }>;
}

/**
 * Translates the provided lyrics using a managed translator.
 *
 * This hook handles:
 * - Translator availability and creation states.
 * - Line-by-line translation.
 * - Cancelation of in-flight translation on changes.
 * - Download progress reporting.
 */
export function useLyricsTranslation(
  options: LyricsTranslationOptions,
): LyricsTranslationState {
  const translatorState = useTranslator({
    enabled: options.enabled,
    sourceLanguage: options.sourceLanguage,
    targetLanguage: options.targetLanguage,
  });

  const [translatedLyrics, setTranslatedLyrics] =
    useState<ReadonlyArray<string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LyricsTranslationState["status"]>(
    options.enabled && options.sourceLanguage ? "loading" : "idle",
  );

  const lyrics = options.lyrics;

  useEffect(() => {
    let isActive = true;
    const translator = translatorState.translator;
    const translatorReady =
      options.enabled && translatorState.status === "ready" && translator;

    const scheduleUpdate = (update: () => void) => {
      // Queue state updates to avoid cascading renders.
      queueMicrotask(() => {
        if (!isActive) {
          return;
        }

        update();
      });
    };

    // Derive state from translator readiness and input.
    scheduleUpdate(() => {
      setTranslatedLyrics(null);
      setError(null);

      if (!options.enabled || !options.sourceLanguage) {
        setStatus("idle");
        return;
      }

      // Skip translation if source and target are the same.
      if (options.sourceLanguage === options.targetLanguage) {
        setStatus("idle");
        return;
      }

      if (translatorState.status === "loading") {
        setStatus("loading");
        return;
      }

      if (translatorState.status === "downloading") {
        setStatus("downloading");
        return;
      }

      if (translatorState.status === "error") {
        setStatus("error");
        setError(translatorState.error);
        return;
      }

      if (translatorReady) {
        setStatus(lyrics.length > 0 ? "translating" : "ready");
        return;
      }

      setStatus("idle");
    });

    if (!translatorReady || !translator) {
      return () => {
        isActive = false;
      };
    }

    // Skip translation on empty input.
    if (lyrics.length === 0) {
      return () => {
        isActive = false;
      };
    }

    // Abort translation when unmounted or lyrics change.
    const abortController = new AbortController();

    const translateAllLines = async () => {
      const results: string[] = [];

      for (const line of lyrics) {
        if (abortController.signal.aborted) {
          return;
        }

        // Skip empty lines.
        if (!line.t.trim()) {
          results.push("");
          continue;
        }

        try {
          const translated = await translator.translate(line.t, {
            signal: abortController.signal,
          });
          results.push(translated);
        } catch (translateError: unknown) {
          if (abortController.signal.aborted) {
            return;
          }
          throw translateError;
        }
      }

      return results;
    };

    translateAllLines()
      .then((results) => {
        if (abortController.signal.aborted || !results) {
          return;
        }

        scheduleUpdate(() => {
          setTranslatedLyrics(results);
          setStatus("ready");
        });
      })
      .catch((translateError: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        scheduleUpdate(() => {
          setError(
            translateError instanceof Error
              ? translateError.message
              : "Failed to translate lyrics",
          );
          setStatus("error");
        });
      });

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [
    lyrics,
    options.enabled,
    options.sourceLanguage,
    options.targetLanguage,
    translatorState.error,
    translatorState.status,
    translatorState.translator,
  ]);

  return {
    translatedLyrics,
    error,
    status,
    downloadProgress: translatorState.downloadProgress,
  };
}
