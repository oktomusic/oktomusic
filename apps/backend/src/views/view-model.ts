import { CompiledMetaTags } from "@oktomusic/meta-tags";

import type { EntryAssetTags } from "../utils/vite_manifest";

export interface ViewModel {
  readonly dev: boolean;
  readonly appName: string;
  readonly metaTags: CompiledMetaTags;
  readonly assetTags?: EntryAssetTags;
}
