# GraphQL Introspection Configuration

## Current Configuration

GraphQL introspection is **explicitly enabled** in all environments, including production.

Location: `apps/backend/src/api/api.module.ts`

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  graphiql: true,
  introspection: true,  // ← Explicitly enabled for all environments
  path: "/api/graphql",
  autoSchemaFile: path.join(__dirname, "schema.gql"),
  sortSchema: true,
})
```

## Why This Configuration?

By default, Apollo Server v5 disables introspection when `NODE_ENV=production` for security reasons. However, in our case, we **want** introspection to be enabled in all environments, so we explicitly set `introspection: true`.

This overrides Apollo Server's default production behavior and ensures introspection is always available.

## How to Test Introspection

### Method 1: Using GraphiQL (Recommended)

1. Start the server (in production or development mode)
2. Navigate to `http://localhost:3000/api/graphql` in your browser
3. You should see the GraphiQL interface
4. If introspection is enabled, you'll see:
   - The schema documentation panel (click "Docs" button)
   - Auto-complete suggestions when typing queries
   - The ability to explore the schema

### Method 2: Using an Introspection Query

Send a POST request to `/api/graphql` with the following introspection query:

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { queryType { name } } }"
  }'
```

**Expected response if introspection is enabled:**
```json
{
  "data": {
    "__schema": {
      "queryType": {
        "name": "Query"
      }
    }
  }
}
```

**Expected response if introspection is disabled:**
```json
{
  "errors": [{
    "message": "GraphQL introspection is not allowed by Apollo Server, but the query contained __schema or __type...",
    ...
  }]
}
```

### Method 3: Full Schema Introspection

For a complete schema introspection query, use:

```graphql
query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    subscriptionType { name }
    types {
      ...FullType
    }
    directives {
      name
      description
      locations
      args {
        ...InputValue
      }
    }
  }
}

fragment FullType on __Type {
  kind
  name
  description
  fields(includeDeprecated: true) {
    name
    description
    args {
      ...InputValue
    }
    type {
      ...TypeRef
    }
    isDeprecated
    deprecationReason
  }
  inputFields {
    ...InputValue
  }
  interfaces {
    ...TypeRef
  }
  enumValues(includeDeprecated: true) {
    name
    description
    isDeprecated
    deprecationReason
  }
  possibleTypes {
    ...TypeRef
  }
}

fragment InputValue on __InputValue {
  name
  description
  type { ...TypeRef }
  defaultValue
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
      }
    }
  }
}
```

## Troubleshooting

If introspection is not working despite the configuration:

### 1. Verify the Configuration
Check that `introspection: true` is set in `apps/backend/src/api/api.module.ts`.

### 2. Check Package Versions
```bash
npm list @apollo/server @nestjs/apollo @nestjs/graphql
```

Current versions:
- `@apollo/server`: ^5.0.0
- `@nestjs/apollo`: ^13.2.1
- `@nestjs/graphql`: ^13.2.0

### 3. Verify NODE_ENV
In production (Docker), `NODE_ENV=production` is set in the Dockerfile (line 54).
This should NOT affect introspection since we explicitly set `introspection: true`.

### 4. Test in Different Environments

**Development:**
```bash
cd apps/backend
npm run start:dev
```

**Production:**
```bash
cd apps/backend
NODE_ENV=production npm run start:prod
```

Both should have introspection enabled.

### 5. Check for Middleware or Plugins
Ensure no middleware or Apollo plugins are interfering with introspection.
Currently, no additional plugins are configured.

## Security Considerations

**Note:** Enabling introspection in production exposes your GraphQL schema to anyone who can access the endpoint. This is generally safe if:
- Your API is behind authentication/authorization
- The schema itself doesn't contain sensitive information
- You're aware of what's being exposed

If you want to restrict introspection in production, remove the `introspection: true` line or set it to `false`.

## References

- [Apollo Server Introspection Documentation](https://www.apollographql.com/docs/apollo-server/workflow/introspection/)
- [NestJS GraphQL Documentation](https://docs.nestjs.com/graphql/quick-start)
- [Apollo Server v5 Migration Guide](https://www.apollographql.com/docs/apollo-server/migration/)
