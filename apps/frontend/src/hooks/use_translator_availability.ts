import { useEffect, useState } from "react";

import { Locale } from "../utils/locales";

export interface TranslatorAvailabilityState {
  readonly availabilityByLocale: Readonly<
    Partial<Record<Locale, Availability>>
  >;
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly error: string | null;
}

export interface TranslatorAvailabilityOptions {
  readonly enabled: boolean;
  readonly sourceLanguage: string | null;
  readonly targetLanguages: readonly Locale[];
  readonly refreshTrigger?: number;
}

/**
 * Resolves Translator.availability per target locale for a detected source language.
 */
export function useTranslatorAvailability(
  options: TranslatorAvailabilityOptions,
): TranslatorAvailabilityState {
  const [availabilityByLocale, setAvailabilityByLocale] = useState<
    Partial<Record<Locale, Availability>>
  >({});
  const [status, setStatus] =
    useState<TranslatorAvailabilityState["status"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      setAvailabilityByLocale({});
      setError(null);
      setStatus(options.enabled && options.sourceLanguage ? "loading" : "idle");
    });

    if (!options.enabled || !options.sourceLanguage) {
      return () => {
        isActive = false;
      };
    }

    const sourceLanguage = options.sourceLanguage;

    Promise.all(
      options.targetLanguages.map(async (targetLanguage) => {
        try {
          const availability = await Translator.availability({
            sourceLanguage,
            targetLanguage,
          });

          return [targetLanguage, availability] as const;
        } catch {
          return [targetLanguage, "unavailable"] as const;
        }
      }),
    )
      .then((availabilityEntries) => {
        if (!isActive) {
          return;
        }

        setAvailabilityByLocale(Object.fromEntries(availabilityEntries));
        setStatus("ready");

        if (
          availabilityEntries.some(
            ([, availability]) => availability === "downloading",
          )
        ) {
          timeoutId = setTimeout(() => {
            if (isActive) {
              setRefreshCount((current) => current + 1);
            }
          }, 1500);
        }
      })
      .catch((availabilityError: unknown) => {
        if (!isActive) {
          return;
        }

        setError(
          availabilityError instanceof Error
            ? availabilityError.message
            : "Failed to check translator availability",
        );
        setStatus("error");
      });

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    options.enabled,
    options.sourceLanguage,
    options.targetLanguages,
    options.refreshTrigger,
    refreshCount,
  ]);

  return { availabilityByLocale, status, error };
}
