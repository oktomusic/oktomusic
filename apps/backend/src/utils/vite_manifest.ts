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

export interface EntryAssetTags {
  readonly head: AssetTag[];
  readonly body: AssetTag[];
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
): EntryAssetTags {
  const entry = manifest[entryPoint];
  if (!entry || !entry.isEntry) {
    return {
      head: [],
      body: [],
    };
  }

  const headTags: AssetTag[] = [];
  const seenHeadFiles = new Set<string>();

  const pushStylesheetTags = (chunk: ManifestWithSRI): void => {
    for (const cssFile of chunk.css ?? []) {
      if (seenHeadFiles.has(cssFile)) {
        continue;
      }
      seenHeadFiles.add(cssFile);
      const cssEntry = findEntryByFile(manifest, cssFile);
      headTags.push({
        tag: "link",
        attrs: {
          rel: "stylesheet",
          href: `${basePath}${cssFile}`,
          ...(cssEntry?.sri && { integrity: cssEntry.sri }),
          crossorigin: true,
        },
      });
    }
  };

  const importedChunks = getImportedChunks(manifest, entry);

  // Add preload tags for imported JS chunks and linked CSS in <head>
  for (const chunk of importedChunks) {
    if (!seenHeadFiles.has(chunk.file)) {
      seenHeadFiles.add(chunk.file);
      headTags.push({
        tag: "link",
        attrs: {
          rel: "modulepreload",
          href: `${basePath}${chunk.file}`,
          ...(chunk.sri && { integrity: chunk.sri }),
          crossorigin: true,
        },
      });
    }

    pushStylesheetTags(chunk);
  }

  // Keep entry-linked CSS in <head>
  pushStylesheetTags(entry);

  const bodyTags: AssetTag[] = [
    {
      tag: "script",
      attrs: {
        type: "module",
        src: `${basePath}${entry.file}`,
        ...(entry.sri && { integrity: entry.sri }),
        crossorigin: true,
      },
    },
  ];

  return {
    head: headTags,
    body: bodyTags,
  };
}

function getImportedChunks(
  manifest: ViteManifest,
  entry: ManifestWithSRI,
): ManifestWithSRI[] {
  const chunks: ManifestWithSRI[] = [];
  const visited = new Set<string>();

  const visit = (importKey: string): void => {
    if (visited.has(importKey)) {
      return;
    }
    visited.add(importKey);

    const chunk = manifest[importKey];
    if (!chunk) {
      return;
    }

    chunks.push(chunk);
    for (const nextImport of [
      ...(chunk.imports ?? []),
      ...(chunk.dynamicImports ?? []),
    ]) {
      visit(nextImport);
    }
  };

  for (const importKey of [
    ...(entry.imports ?? []),
    ...(entry.dynamicImports ?? []),
  ]) {
    visit(importKey);
  }

  return chunks;
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
