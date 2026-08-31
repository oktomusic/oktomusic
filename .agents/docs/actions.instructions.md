---
applyTo: ".github/workflows/*.yml,.github/actions/**/*.yml"
description: Instructions for GitHub Actions workflows
---

# GitHub Actions

Follow the patterns in `.github/workflows/ci.yml`:

- Run CI jobs on `ubuntu-latest`
- Check out with `actions/checkout@v7`
- Set up dependencies with `pnpm/setup@v2` and `install: true`
- Add `needs` only for real job dependencies
- Keep external action versions consistent across workflows
