import { useEffect, useRef, useState } from "react";

export interface LanguageDetectorState {
  readonly detector: LanguageDetector | null;
  readonly error: string | null;
  readonly status: "idle" | "loading" | "ready" | "error";
}

/**
 * Creates and manages a single LanguageDetector instance.
 *
 * Lifecycle:
 * - Resets when disabled.
 * - Aborts pending creation on teardown.
 * - Destroys the detector to release resources.
 */
export function useLanguageDetector(enabled: boolean): LanguageDetectorState {
  const [detector, setDetector] = useState<LanguageDetector | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LanguageDetectorState["status"]>(
    enabled ? "loading" : "idle",
  );
  const detectorRef = useRef<LanguageDetector | null>(null);

  useEffect(() => {
    let isActive = true;

    const destroyDetector = () => {
      const current = detectorRef.current;
      detectorRef.current = null;
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

        setDetector(null);
        setError(null);
        setStatus(enabled ? "loading" : "idle");
      });
    };

    // Ensure stale instances are released before re-creating.
    destroyDetector();
    scheduleReset();

    if (!enabled) {
      return () => {
        isActive = false;
        destroyDetector();
      };
    }

    // Abort creation if the component unmounts or input changes.
    const abortController = new AbortController();

    LanguageDetector.create({ signal: abortController.signal })
      .then((createdDetector) => {
        if (abortController.signal.aborted) {
          createdDetector.destroy();
          return;
        }

        detectorRef.current = createdDetector;
        setDetector(createdDetector);
        setStatus("ready");
      })
      .catch((createError: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setError(
          createError instanceof Error
            ? createError.message
            : "Failed to create language detector",
        );
        setStatus("error");
      });

    return () => {
      isActive = false;
      abortController.abort();
      destroyDetector();
    };
  }, [enabled]);

  return { detector, error, status };
}

export interface LyricsLanguageDetectionState {
  readonly detectedLanguage: string | null;
  readonly error: string | null;
  readonly status: "idle" | "loading" | "detecting" | "ready" | "error";
}

export interface LyricsLanguageDetectionOptions {
  readonly enabled: boolean;
  readonly lyrics: ReadonlyArray<{ readonly t: string }>;
}

/**
 * Detects the language of the provided lyrics, using a managed detector.
 *
 * This hook handles:
 * - Detector availability and creation states.
 * - Input normalization for detection.
 * - Cancelation of in-flight detection on changes.
 */
export function useLyricsLanguageDetection(
  options: LyricsLanguageDetectionOptions,
): LyricsLanguageDetectionState {
  const detectorState = useLanguageDetector(options.enabled);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LyricsLanguageDetectionState["status"]>(
    options.enabled ? "loading" : "idle",
  );

  // Normalize lyrics into a single detection input string.
  const input = options.lyrics
    .map((line) => line.t)
    .join("\n")
    .trim();

  useEffect(() => {
    let isActive = true;
    const detector = detectorState.detector;
    const detectorReady =
      options.enabled && detectorState.status === "ready" && detector;

    const scheduleUpdate = (update: () => void) => {
      // Queue state updates to avoid cascading renders.
      queueMicrotask(() => {
        if (!isActive) {
          return;
        }

        update();
      });
    };

    // Derive state from detector readiness and input.
    scheduleUpdate(() => {
      setDetectedLanguage(null);
      setError(null);

      if (!options.enabled) {
        setStatus("idle");
        return;
      }

      if (detectorState.status === "loading") {
        setStatus("loading");
        return;
      }

      if (detectorState.status === "error") {
        setStatus("error");
        setError(detectorState.error);
        return;
      }

      if (detectorReady) {
        setStatus(input ? "detecting" : "ready");
        return;
      }

      setStatus("idle");
    });

    if (!detectorReady || !detector) {
      return () => {
        isActive = false;
      };
    }

    // Skip detection on empty input.
    if (!input) {
      return () => {
        isActive = false;
      };
    }

    // Abort detection when unmounted or lyrics change.
    const abortController = new AbortController();

    detector
      .detect(input, { signal: abortController.signal })
      .then((results) => {
        if (abortController.signal.aborted) {
          return;
        }

        const bestMatch = results[0];
        scheduleUpdate(() => {
          setDetectedLanguage(bestMatch?.detectedLanguage ?? null);
          setStatus("ready");
        });
      })
      .catch((detectError: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        scheduleUpdate(() => {
          setError(
            detectError instanceof Error
              ? detectError.message
              : "Failed to detect language",
          );
          setStatus("error");
        });
      });

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [
    detectorState.detector,
    detectorState.error,
    detectorState.status,
    input,
    options.enabled,
  ]);

  return { detectedLanguage, error, status };
}
