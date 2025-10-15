// https://vite.dev/guide/backend-integration

import fs from "node:fs";

interface ManifestChunk {
  src?: string;
  file: string;
  css?: string[];
  assets?: string[];
  isEntry?: boolean;
  name?: string;
  names?: string[];
  isDynamicEntry?: boolean;
  imports?: string[];
  dynamicImports?: string[];
}

interface ManifestWithSRI extends ManifestChunk {
  sri?: string;
}

export type ViteManifest = Record<string, ManifestWithSRI>;

export interface AssetTag {
  tag: "script" | "link";
  attrs: Record<string, string | boolean>;
}

/**
 * Load and parse the Vite manifest file
 */
export function loadManifest(manifestPath: string): ViteManifest | null {
  try {
    if (!fs.existsSync(manifestPath)) {
      return null;
    }
    const content = fs.readFileSync(manifestPath, "utf-8");
    return JSON.parse(content) as ViteManifest;
  } catch {
    return null;
  }
}

/**
 * Get asset tags for a given entry point from the manifest
 */
export function getAssetTags(
  manifest: ViteManifest,
  entryPoint: string,
  basePath = "/",
): AssetTag[] {
  const entry = manifest[entryPoint];
  if (!entry || !entry.isEntry) {
    return [];
  }

  const tags: AssetTag[] = [];

  // Add CSS files
  if (entry.css) {
    for (const cssFile of entry.css) {
      const cssEntry = findEntryByFile(manifest, cssFile);
      tags.push({
        tag: "link",
        attrs: {
          rel: "stylesheet",
          href: `${basePath}${cssFile}`,
          ...(cssEntry?.sri && { integrity: cssEntry.sri }),
          crossorigin: true,
        },
      });
    }
  }

  // Add the main JS entry file
  tags.push({
    tag: "script",
    attrs: {
      type: "module",
      src: `${basePath}${entry.file}`,
      ...(entry.sri && { integrity: entry.sri }),
      crossorigin: true,
    },
  });

  return tags;
}

/**
 * Find a manifest entry by its file path
 */
function findEntryByFile(
  manifest: ViteManifest,
  filePath: string,
): ManifestWithSRI | null {
  for (const entry of Object.values(manifest)) {
    if (entry.file === filePath) {
      return entry;
    }
  }
  return null;
}
