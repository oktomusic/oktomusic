/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import crypto from "node:crypto";
import path from "node:path";
import type { Plugin } from "vite";

/**
 * Generate a Subresource Integrity (SRI) hash for given asset content.
 */
function generateSRI(content: Buffer, algo: string = "sha384"): string {
  const hash = crypto.createHash(algo).update(content).digest("base64");
  return `${algo}-${hash}`;
}

/**
 * Vite plugin that adds SRI hashes to manifest entries.
 */
export default function manifestSRIPlugin(): Plugin {
  return {
    name: "vite-plugin-manifest-sri",
    apply: "build",
    enforce: "post",

    async writeBundle(options, bundle) {
      if (!options.dir) return;
      const manifestPath = path.resolve(options.dir, ".vite", "manifest.json");

      const file = await this.fs.readFile(manifestPath);

      const manifest = JSON.parse(file.toString());

      // Generate SRI for main entries
      for (const entry of Object.values<any>(manifest)) {
        if (entry.file && bundle[entry.file]) {
          const asset = bundle[entry.file];
          const content = Buffer.from(
            asset.type === "asset" ? asset.source : asset.code,
          );
          entry.sri = generateSRI(content);
        }

        // Generate SRI for CSS files
        if (entry.css && Array.isArray(entry.css)) {
          for (const cssFile of entry.css) {
            if (bundle[cssFile]) {
              const asset = bundle[cssFile];
              const content = Buffer.from(
                asset.type === "asset" ? asset.source : asset.code,
              );
              const sri = generateSRI(content);

              // Add CSS file as its own entry if it doesn't exist
              if (!manifest[cssFile]) {
                manifest[cssFile] = {
                  file: cssFile,
                  src: cssFile,
                  sri,
                };
              } else {
                manifest[cssFile].sri = sri;
              }
            }
          }
        }
      }

      const manifestNew = JSON.stringify(manifest, null, 2);

      await this.fs.writeFile(manifestPath, manifestNew);
    },
  };
}
