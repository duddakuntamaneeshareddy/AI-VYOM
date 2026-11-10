# Browser Manager

Browser validation must use existing environment capabilities unless the developer explicitly approves installation.

## Responsibilities

- detect whether Playwright or Cypress is declared in project dependencies
- detect whether browser binaries are already installed
- detect common local browsers when useful
- report missing dependencies clearly
- prevent validators from downloading browsers implicitly

## Detection Checklist

1. Inspect package manager files for `playwright`, `@playwright/test`, or `cypress`.
2. Check existing commands in `package.json`.
3. Run version checks only for declared tools, such as `npx playwright --version`.
4. For Playwright, run `npx playwright install --dry-run` only if supported by the installed version and only to inspect, not install.
5. Do not run `npx playwright install`, `npx playwright install-deps`, or Cypress binary downloads without explicit approval.

## Validator Behavior

- Static UX validation is the default.
- Browser flow validation requires a request or release validation.
- Missing Playwright or browser binaries is reported as `NOT RUN`, not silently fixed.
- Installation is a separate developer-approved task.

## Report Fields

- Playwright dependency present:
- Cypress dependency present:
- Browser binaries present:
- App start command:
- Browser validation action:
- Missing requirements:
