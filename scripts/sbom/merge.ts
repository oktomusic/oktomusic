/// <reference types="@types/node" />

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

interface Component {
  readonly "bom-ref": string;
  readonly type: string;
  readonly name: string;
  readonly version?: string;
  readonly components?: readonly Component[];
  readonly [key: string]: unknown;
}

interface Dependency {
  readonly ref: string;
  readonly dependsOn?: readonly string[];
  readonly provides?: readonly string[];
}

export interface Bom {
  readonly bomFormat: string;
  readonly specVersion: string;
  readonly metadata: {
    readonly component: Component;
    readonly [key: string]: unknown;
  };
  readonly components: readonly Component[];
  readonly dependencies: readonly Dependency[];
}

function assembly(bom: Bom, category: "backend" | "frontend") {
  if (
    bom.bomFormat !== "CycloneDX" ||
    bom.specVersion !== "1.7" ||
    !bom.metadata?.component?.["bom-ref"] ||
    !Array.isArray(bom.components) ||
    !Array.isArray(bom.dependencies)
  ) {
    throw new Error(`${category}: expected a pnpm CycloneDX 1.7 SBOM`);
  }
  if (bom.metadata.component.name !== category) {
    throw new Error(`${category}: expected the filtered ${category} SBOM`);
  }

  const refs = new Set<string>();
  const component = (source: Component): Component => {
    const ref = source["bom-ref"];
    if (!ref || refs.has(ref)) {
      throw new Error(`${category}: missing or duplicate component reference`);
    }
    refs.add(ref);
    return {
      ...source,
      "bom-ref": `${category}:${ref}`,
      ...(source.components && {
        components: source.components.map(component),
      }),
    };
  };

  const root = component(bom.metadata.component);
  const components = bom.components.map(component);
  const reference = (ref: string) => {
    if (!refs.has(ref)) {
      throw new Error(`${category}: unknown component reference ${ref}`);
    }
    return `${category}:${ref}`;
  };

  return {
    component: {
      ...root,
      type: "application",
      components: [...(root.components ?? []), ...components],
    },
    dependencies: bom.dependencies.map((dependency) => ({
      ref: reference(dependency.ref),
      ...(dependency.dependsOn && {
        dependsOn: dependency.dependsOn.map(reference),
      }),
      ...(dependency.provides && {
        provides: dependency.provides.map(reference),
      }),
    })),
  };
}

/** Merge pnpm BOMs as two component assemblies, preserving both dependency graphs. */
export function mergeSboms(backend: Bom, frontend: Bom) {
  const assemblies = [
    assembly(backend, "backend"),
    assembly(frontend, "frontend"),
  ];
  const metadata: Bom["metadata"] = {
    ...backend.metadata,
    timestamp: new Date().toISOString(),
    component: {
      type: "application",
      "bom-ref": "oktomusic",
      name: "Oktomusic",
      version: backend.metadata.component.version,
      licenses: backend.metadata.component.licenses,
    },
  };

  return {
    $schema: "http://cyclonedx.org/schema/bom-1.7.schema.json",
    bomFormat: "CycloneDX",
    specVersion: "1.7",
    serialNumber: `urn:uuid:${randomUUID()}`,
    version: 1,
    metadata,
    components: assemblies.map((entry) => entry.component),
    dependencies: [
      {
        ref: "oktomusic",
        dependsOn: assemblies.map((entry) => entry.component["bom-ref"]),
      },
      ...assemblies.flatMap((entry) => entry.dependencies),
    ],
  };
}

if (import.meta.main) {
  const sbomDirectory = path.resolve(
    import.meta.dirname,
    "../../apps/backend/dist",
  );
  const backendPath = path.join(sbomDirectory, "backend.cdx.json");
  const frontendPath = path.join(sbomDirectory, "frontend.cdx.json");
  const outputPath = path.join(sbomDirectory, "sbom.cdx.json");

  const backend: Bom = JSON.parse(await readFile(backendPath, "utf8"));
  const frontend: Bom = JSON.parse(await readFile(frontendPath, "utf8"));
  const merged = mergeSboms(backend, frontend);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(merged, null, 2)}\n`);
  await Promise.all([unlink(backendPath), unlink(frontendPath)]);
}
