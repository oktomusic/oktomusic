/// <reference types="@types/node" />

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mergeSboms, type Bom } from "./merge.ts";

const sharedRef = "pkg:npm/shared@1.0.0";
const leafRef = "pkg:npm/leaf@2.0.0";

function fixture(name: "backend" | "frontend"): Bom {
  const rootRef = `pkg:npm/%40oktomusic/${name}@0.0.1`;
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.7",
    metadata: {
      authors: [{ name: "AFCMS" }],
      lifecycles: [{ phase: "build" }],
      tools: { components: [{ type: "application", name: "pnpm" }] },
      component: {
        type: "library",
        name,
        version: "0.0.1",
        "bom-ref": rootRef,
        purl: rootRef,
        licenses: [{ license: { id: "AGPL-3.0-only" } }],
      },
    },
    components: [
      {
        type: "library",
        name: "shared",
        "bom-ref": sharedRef,
        purl: sharedRef,
        licenses: [{ license: { id: "MIT" } }],
        hashes: [{ alg: "SHA-256", content: "a".repeat(64) }],
      },
      { type: "library", name: "leaf", "bom-ref": leafRef, purl: leafRef },
    ],
    dependencies: [
      { ref: rootRef, dependsOn: [sharedRef] },
      { ref: sharedRef, dependsOn: [leafRef] },
      { ref: leafRef, dependsOn: [] },
    ],
  };
}

void describe("mergeSboms", () => {
  void it("preserves separate assemblies, package identities and complete dependency graphs", () => {
    const backend = fixture("backend");
    const frontend = fixture("frontend");
    const original = structuredClone([backend, frontend]);
    const merged = mergeSboms(backend, frontend);

    assert.equal(merged.bomFormat, "CycloneDX");
    assert.equal(merged.specVersion, "1.7");
    assert.match(merged.serialNumber, /^urn:uuid:/);
    assert.deepEqual(merged.metadata.authors, [{ name: "AFCMS" }]);
    assert.deepEqual(merged.metadata.tools, backend.metadata.tools);
    assert.equal(merged.metadata.component.type, "application");
    assert.deepEqual(
      merged.components.map((component) => component.name),
      ["backend", "frontend"],
    );

    for (const [index, category] of ["backend", "frontend"].entries()) {
      const assembly = merged.components[index]!;
      assert.equal(assembly.type, "application");
      assert.deepEqual(assembly.components[0], {
        ...backend.components[0],
        "bom-ref": `${category}:${sharedRef}`,
      });
      assert.deepEqual(
        merged.dependencies.find(
          (dependency) => dependency.ref === assembly["bom-ref"],
        ),
        { ref: assembly["bom-ref"], dependsOn: [`${category}:${sharedRef}`] },
      );
      assert.deepEqual(
        merged.dependencies.find(
          (dependency) => dependency.ref === `${category}:${sharedRef}`,
        ),
        {
          ref: `${category}:${sharedRef}`,
          dependsOn: [`${category}:${leafRef}`],
        },
      );
    }

    const refs = [
      merged.metadata.component["bom-ref"],
      ...merged.components.flatMap((component) => [
        component["bom-ref"],
        ...component.components.map((child) => child["bom-ref"]),
      ]),
    ];
    assert.equal(new Set(refs).size, refs.length);
    for (const dependency of merged.dependencies) {
      assert.ok(refs.includes(dependency.ref));
      for (const ref of dependency.dependsOn ?? [])
        assert.ok(refs.includes(ref));
    }
    assert.deepEqual(merged.dependencies[0], {
      ref: "oktomusic",
      dependsOn: merged.components.map((component) => component["bom-ref"]),
    });
    assert.deepEqual([backend, frontend], original);
  });

  void it("rejects unsupported formats and unfiltered workspace inventories", () => {
    const backend = fixture("backend");
    const frontend = fixture("frontend");
    assert.throws(
      () => mergeSboms({ ...backend, specVersion: "1.6" }, frontend),
      /expected a pnpm CycloneDX 1.7 SBOM/,
    );
    assert.throws(
      () => mergeSboms(frontend, frontend),
      /expected the filtered backend SBOM/,
    );
  });

  void it("rejects dangling dependency references and duplicate component references", () => {
    const backend = fixture("backend");
    const frontend = fixture("frontend");
    assert.throws(
      () =>
        mergeSboms(
          { ...backend, dependencies: [{ ref: "missing" }] },
          frontend,
        ),
      /unknown component reference missing/,
    );
    assert.throws(
      () =>
        mergeSboms(
          {
            ...backend,
            components: [...backend.components, backend.components[0]!],
          },
          frontend,
        ),
      /duplicate component reference/,
    );
  });
});
