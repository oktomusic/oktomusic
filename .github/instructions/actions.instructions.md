---
applyTo: ".github/workflows/*.yml,.github/actions/**/*.yml"
description: Instructions for GitHub Actions workflows
---

# GitHub Actions Workflows

The main part of the CI/CD setup for this repository is done using GitHub Actions in the `.github/workflows/ci.yml` file.

The setup-environment action in `.github/actions/setup-environment/action.yml` is used to setup the project environment in most steps.

`ubuntu-latest` is used as the runner for all jobs.

To add a new job, add the following:

```yaml
new-job-name:
  name: Descriptive Job Name
  runs-on: ubuntu-latest
  needs: [other-job-if-needed]
  steps:
    - name: Checkout repository
      uses: actions/checkout@v6

    - name: Setup Environment
      uses: ./.github/actions/setup-node-pnpm

    - name: Do something
      run: |
        # Your commands here
```

External actions should use the same versions across all jobs to ensure consistency.
