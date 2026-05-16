import { CompiledMetaTags } from "@oktomusic/meta-tags";

import type { EntryAssetTags } from "../utils/vite_manifest";
import appConfig from "../config/definitions/app.config";

export interface ViewModel {
  readonly dev: boolean;
  readonly appName: string;
  readonly metaTags: CompiledMetaTags;
  readonly assetTags?: EntryAssetTags;
}

export function buildViewModel(overrides: Partial<ViewModel> = {}): ViewModel {
  const defaults: ViewModel = {
    appName: appConfig().appName,
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
