export type ViewModel = {
  dev: boolean;
  ogp: Array<{ property: string; content: string }>;
};

export function buildViewModel(overrides: Partial<ViewModel> = {}): ViewModel {
  const defaults: ViewModel = {
    dev: process.env.NODE_ENV !== "production",
    ogp: [{ property: "og:title", content: "Oktomusic" }],
  };

  return {
    ...defaults,
    ...overrides,
    ogp: overrides.ogp ?? defaults.ogp,
  };
}
