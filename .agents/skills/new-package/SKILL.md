---
name: new-package
description: Create and integrate a new TypeScript package in the Oktomusic monorepo. Use when asked to add, initialise, or scaffold a package under packages/.
---

# New package

Create an internal, unpublished package that follows the repository's current `tsdown`, TypeScript, Vitest, ESLint, CI, and Docker conventions.

## Inputs

- Accept an npm-compatible name with or without the `@oktomusic/` scope. Use `@oktomusic/<name>` as the package name and `packages/<name>` as its directory.
- Default to code usable in Node.js and browsers. Use a Node.js-only target when the user mentions `node`.

## Scaffold

Inspect a current package before editing and reuse its repository metadata and formatting. Create:

- `package.json` with version `0.0.0`, ESM, `dist` files/types/exports, the standard `build`, `dev`, `test`, `typecheck`, `lint`, and `lint:fix` scripts, empty dependencies, and `@types/node` plus `tsdown` from `catalog:default` as dev dependencies. Do not add publishing or release setup.
- `README.md` containing the scoped package name as its heading.
- `src/index.ts`, initially empty.
- `tests/index.test.ts` with a minimal placeholder Vitest test.
- `vitest.config.ts` using the scoped package name and `../../coverage/<name>`.
- `tsconfig.json` matching current strict package settings and including `src` and `tests`.
- `tsdown.config.ts` with declaration sourcemaps.

For Node.js-only packages, set the tsdown platform to `node`, enable generated exports, and include Node types in `tsconfig.json`. Otherwise use the `./src/index.ts` entry with the `neutral` platform and omit Node types.

Use `catalog:default` for `zod` if it is added.

## Integrate

- Add the package Vitest config to the root `vitest.config.ts` projects.
- Add a type-aware package block to root `eslint.config.ts`, following the existing tsdown package blocks.
- Add an independent `pkg-<name>` job to `.github/workflows/ci.yml` that checks out, installs, builds, typechecks, lints, and tests the package. Do not make another job depend on it unless the package is actually consumed there.
- Add the package to the Docker builder's package-manifest copies, install filters, source copies, and package build steps. No production-stage change is needed; runtime inclusion comes through a backend dependency.

## Verify

From the workspace root, run `pnpm install`, then the package's build, typecheck, lint, and tests. Finally run the root test suite. Report any failure that cannot be resolved within the package-creation scope.
