# Oktomusic - Copilot Instructions

## Project Overview

Oktomusic is a self-hostable music streaming server and web client licensed under AGPL-3.0-only.

## Repository Structure

This is a pnpm monorepo with the following structure:

- `apps/backend/` - NestJS backend API server
- `apps/frontend/` - React + Vite frontend application
- `apps/website/` - VitePress documentation website
- `packages/lyrics/` - TypeScript package for lyrics functionality
- `docs/website/` - Documentation content for VitePress

## Technology Stack

### Backend
- **Framework**: NestJS 11.x
- **Language**: TypeScript (CommonJS)
- **Testing**: Jest
- **Build**: NestJS CLI

### Frontend
- **Framework**: React 19.x
- **Build Tool**: Vite 7.x
- **Language**: TypeScript (ESM)
- **Compiler**: React Compiler enabled

### Documentation
- **Framework**: VitePress 2.x

### Packages
- **Build Tool**: tsdown

## Code Style and Formatting

### ESLint
- Root configuration in `eslint.config.ts` using flat config format
- Backend: TypeScript recommended + type-checked rules
- Frontend: React recommended + type-checked rules, React hooks, React refresh
- Different configurations per workspace package

### Prettier
- Configuration in `prettier.config.ts`
- 2 spaces indentation (no tabs)
- Double quotes
- No semicolons
- Trailing commas everywhere
- Tailwind CSS plugin enabled

### Commands
- Lint: `pnpm lint` (root) or workspace-specific
- Format check: `pnpm format`
- Format fix: `prettier --write .`

## Testing

### Backend
- Framework: Jest with ts-jest
- Test files: `*.spec.ts` for unit tests, `*.e2e-spec.ts` for e2e tests
- Run tests: `pnpm --filter @oktomusic/backend test`
- Coverage: `pnpm --filter @oktomusic/backend test:cov`

### Frontend
- No test framework configured yet

## Commit Message Convention

**IMPORTANT**: All commits MUST follow Conventional Commits specification.

Format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

Enforced by commitlint with `@commitlint/config-conventional`.

Examples:
- `feat(backend): add user authentication`
- `fix(frontend): resolve playback issue`
- `docs: update API documentation`

## Build and Development

### Package Manager
- **pnpm** version 10.18.0 (specified in package.json)
- Workspaces enabled via `pnpm-workspace.yaml`
- Shared lockfile at root

### Development Commands
- **Backend dev**: `pnpm --filter @oktomusic/backend start:dev`
- **Frontend dev**: `pnpm --filter @oktomusic/frontend dev`
- **Docs dev**: `pnpm --filter @oktomusic/website dev`

### Build Commands
- **Backend**: `pnpm --filter @oktomusic/backend build`
- **Frontend**: `pnpm --filter @oktomusic/frontend build`
- **Docs**: `pnpm --filter @oktomusic/website build`
- **Lyrics package**: `pnpm --filter @oktomusic/lyrics build`

## Additional Guidelines

- When making changes, ensure code passes linting and formatting checks
- Add tests for new functionality when applicable
- Update documentation if changing public APIs or user-facing features
- Follow existing code patterns and conventions in each workspace
