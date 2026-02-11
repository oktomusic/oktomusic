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

## GraphQL

- Queries MUST be defined in `apps/frontend/src/api/graphql/queries`
- Mutations MUST be defined in `apps/frontend/src/api/graphql/mutations`
- Subscriptions MUST be defined in `apps/frontend/src/api/graphql/subscriptions`
- Codegen MUST be used after any change to the GraphQL schema or queries/mutations/subscriptions, with the command `pnpm --filter @oktomusic/frontend codegen`
- Dates are sent by the backend as ISO strings, codegen give them type `Date` but that won't work unless the Apollo Client in `apps/frontend/src/api/graphql/client.ts` is configured to parse it from string
- Do not EVER use `new Date()` on a type that is already supposed to be a `Date`
