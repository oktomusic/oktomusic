import { CompiledMetaTags } from "@oktomusic/meta-tags";

import type { AssetTag } from "../utils/vite_manifest";

export interface ViewModel {
  readonly dev: boolean;
  readonly metaTags: CompiledMetaTags;
  readonly assetTags?: AssetTag[];
}

export function buildViewModel(overrides: Partial<ViewModel> = {}): ViewModel {
  const defaults: ViewModel = {
    dev: process.env.NODE_ENV !== "production",
    metaTags: [{ property: "og:title", content: "Oktomusic" }],
  };

  return {
    ...defaults,
    ...overrides,
    metaTags: overrides.metaTags ?? defaults.metaTags,
  };
}
