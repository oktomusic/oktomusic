// https://vite.dev/guide/backend-integration

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
