import { CompiledMetaTags } from "@oktomusic/meta-tags";

import type { EntryAssetTags } from "../utils/vite_manifest";

export interface ViewModel {
  readonly dev: boolean;
  readonly metaTags: CompiledMetaTags;
  readonly assetTags?: EntryAssetTags;
}

export function buildViewModel(overrides: Partial<ViewModel> = {}): ViewModel {
  const defaults: ViewModel = {
    dev: process.env.NODE_ENV !== "production",
    metaTags: [{ property: "og:title", content: "Oktomusic" }],
    assetTags: undefined,
  };

  const resolvedOverrides: Partial<ViewModel> = {
    ...overrides,
    metaTags: overrides.metaTags ?? defaults.metaTags,
  };

  return {
    ...defaults,
    ...resolvedOverrides,
  };
}
