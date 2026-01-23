---
applyTo: "apps/frontend/**/*.tsx,apps/frontend/**/*.ts"
description: Instructions for Frontend
---

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG 2.2 AAA minimums, including focus management, color contrast, and ARIA attributes.
- It SHOULD use semantic HTML elements whenever possible.

## Content Security Policy (CSP)

- The project is strict by default regarding the `Content-Security-Policy` header.
- When absolutly needed, update the CSP in `apps/backend/src/utils/helmet_config.ts`
- You MUST avoid using `unsafe-inline` styles and scripts.
- Use ONLY external stylesheets and scripts instead.

## Permissions Policy

- The project is strict by default regarding the `Permissions-Policy` header.
- When using a new web API, update as needed the policies in `apps/backend/src/utils/permissions_policy.ts`

## React and JSX/TSX Guidelines

- Use functional components with hooks.
- You MUST use interfaces for defining component props.
- When possible, prefer `readonly` properties in props interfaces.
- You MUST never destructure props in the function signature.

```tsx
interface MyComponentProps {
  readonly title: string;
}

function MyComponent(props: MyComponentProps) {
  return <h1>{props.title}</h1>;
}
```
