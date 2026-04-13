---
name: new_package
description: Initialise a new monorepo package
tools:
  [
    execute,
    read/problems,
    read/readFile,
    edit,
    search/changes,
    search/codebase,
    search/fileSearch,
    search/listDirectory,
    search/searchResults,
    search/textSearch,
  ]
---

Packages in this monorepo contains code that is either shared between frontend/backend/website or that is specific enough to be tested and developed in isolation.

These packages are currently private and not published to NPM.

They use TypeScript and are built with `tsdown`.

`tsdown`, `@types/node` and `zod` dependencies are referenced as `catalog:default` in `package.json` files, to share the same version across all packages and avoid version mismatches.

---

# Create package folder

You will be given a NPM compatible package name, and optionally a mention of `node` to significate the module target NodeJS and not both NodeJS and browser.

The full package name will be in the format `@oktomusic/package-name`. Add the `@oktomusic/` prefix to the given package name if absent.

Create a folder in `packages/` with the package name (without the `@oktomusic/` prefix).

You will now create a set of base files in this package folder. Replace `<package-name>` in the following instructions with the actual package name (without the `@oktomusic/` prefix).

Inside that folder, create a `package.json` file with the following content:

```json
{
  "name": "@oktomusic/<package-name>",
  "version": "0.0.0",
  "description": "",
  "type": "module",
  "license": "AGPL-3.0-only",
  "homepage": "https://github.com/oktomusic/oktomusic#readme",
  "bugs": {
    "url": "https://github.com/oktomusic/oktomusic/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/oktomusic/oktomusic.git"
  },
  "author": {
    "name": "AFCMS",
    "email": "afcm.contact@gmail.com",
    "url": "https://afcms.dev"
  },
  "files": ["dist"],
  "types": "./dist/index.d.mts",
  "exports": {
    ".": "./dist/index.mjs",
    "./package.json": "./package.json"
  },
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch",
    "test": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "pnpm -w exec eslint -c eslint.config.ts packages/<package-name>",
    "lint:fix": "pnpm -w exec eslint -c eslint.config.ts --fix packages/<package-name>"
  },
  "devDependencies": {
    "@types/node": "catalog:default",
    "tsdown": "catalog:default"
  },
  "dependencies": {}
}
```

Create `README.md` file with the following content:

```markdown
# @oktomusic/<package-name>
```

Create `tsdown.config.ts` file with the following content.

If the package targets **NodeJS** (`node` was mentioned):

```typescript
import { defineConfig } from "tsdown";

export default defineConfig({
  exports: true,
  platform: "node",
  dts: {
    sourcemap: true,
  },
});
```

If the package targets **both NodeJS and browser** (default, `node` was not mentioned):

```typescript
import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["./src/index.ts"],
    platform: "neutral",
    dts: {
      sourcemap: true,
    },
  },
]);
```

Create `vitest.config.ts` file with the following content:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    name: "@oktomusic/<package-name>",
    root: __dirname,
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "../../coverage/<package-name>",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/**/*.{test,spec}.{ts,tsx}"],
    },
  },
});
```

Create `tsconfig.json` file with the following content.

If the package targets **NodeJS** (`node` was mentioned), include `"types": ["node"]`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["es2023"],
    "moduleDetection": "force",
    "module": "preserve",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "types": ["node"],
    "strict": true,
    "noUnusedLocals": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src", "tests"]
}
```

If the package targets **both NodeJS and browser** (default), omit the `types` field:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["es2023"],
    "moduleDetection": "force",
    "module": "preserve",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "noUnusedLocals": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src", "tests"]
}
```

Create `src/index.ts` file with no content.

Create `tests/index.test.ts` file with the following content:

```typescript
import { describe, it } from "vitest";

describe("@oktomusic/<package-name>", () => {
  it("should be tested", () => {
    // This test is intentionally left empty.
  });
});
```

# Install dependencies and verify build

Run `pnpm install` at the root of the monorepo to link the new package:

```sh
pnpm install
```

Then verify the package builds correctly:

```sh
pnpm run --filter @oktomusic/<package-name> build
```

# Update root files

Next we need to update some root files to reference the new package.

## Vitest config

Update `vitest.config.ts` at the root of the monorepo, add the path to the new package config file `"./packages/<package-name>/vitest.config.ts"` in the projects array.

You should try running all monorepo tests with `pnpm run test` (not with the tools).

## ESLint config

Update `eslint.config.ts` at the root of the monorepo, add a new entry in the `defineConfig` array with the following content:

```typescript
  // @oktomusic/<package-name> (tsdown)
  {
    files: ["packages/<package-name>/**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      prettier,
    ],
    languageOptions: {
      parserOptions: {
        project: "./packages/<package-name>/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
```

## GitHub workflows

Update `.github/workflows/ci.yml` file.

There is at minimum a single job per package, create a new job for the new package with the following content:

```yaml
pkg-<package-name>:
  name: "@oktomusic/<package-name>"
  runs-on: ubuntu-latest
  steps:
    - name: Checkout repository
      uses: actions/checkout@v6

    - name: Setup Environment
      uses: ./.github/actions/setup-environment

    - name: Build
      run: pnpm --filter "@oktomusic/<package-name>" build

    - name: Typecheck
      run: pnpm --filter "@oktomusic/<package-name>" run typecheck

    - name: Lint
      run: |
        pnpm --filter "@oktomusic/<package-name>" run lint

    - name: Tests
      run: |
        pnpm --filter "@oktomusic/<package-name>" run test
```

Do not add this new job as a dependency of another job.

## Dockerfile

Update `Dockerfile` at the root of the monorepo. The Dockerfile uses a multi-stage build with a `builder` stage and a `production` stage.

### Builder stage

In the `builder` stage, apply the following changes in order:

1. **Copy package.json for dependency installation**: Add a `COPY` instruction alongside the other package.json copies (before `pnpm install`):

   ```dockerfile
   COPY packages/<package-name>/package.json packages/<package-name>/
   ```

2. **Add filter to pnpm install**: Add `--filter @oktomusic/<package-name>` as a new line to the `pnpm install` command in the builder stage, alongside the existing `--filter` flags.

3. **Copy full package source**: Add a `COPY` instruction alongside the other full package copies (after `pnpm install`):

   ```dockerfile
   COPY packages/<package-name>/ packages/<package-name>/
   ```

4. **Add build step**: Add a build command for the new package **before** the frontend and backend build steps, alongside the other package build steps:

   ```dockerfile
   # Build the <package-name> package
   RUN pnpm run --filter @oktomusic/<package-name> build
   ```

### Production stage

No package-specific changes are required in the `production` stage when adding a new package.

If a new package must be available at runtime, ensure:

1. The package is built in the `builder` stage.
2. The backend package depends on it so `pnpm --filter @oktomusic/backend --prod deploy /prod/backend` includes it in the deploy output.
