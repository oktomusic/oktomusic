# OIDC Setup Guide with Keycloak

This guide explains how to set up Keycloak for local development and testing of the OIDC authentication flow.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and pnpm installed

## Step 1: Start Keycloak

```bash
docker compose up keycloak -d
```

Keycloak will be available at http://localhost:8080

## Step 2: Access Keycloak Admin Console

1. Open http://localhost:8080 in your browser
2. Click on "Administration Console"
3. Login with:
   - Username: `admin`
   - Password: `admin`

## Step 3: Create a Realm

1. Click on the dropdown menu next to "master" in the top left
2. Click "Create Realm"
3. Enter realm name: `oktomusic`
4. Click "Create"

## Step 4: Create a Client

1. In the left sidebar, click "Clients"
2. Click "Create client"
3. Fill in the details:
   - **Client type**: OpenID Connect
   - **Client ID**: `oktomusic-client`
   - Click "Next"
4. Configure capabilities:
   - **Client authentication**: ON (this generates a client secret)
   - **Authorization**: OFF
   - **Authentication flow**: 
     - Standard flow: ON
     - Direct access grants: ON
   - Click "Next"
5. Configure Login settings:
   - **Valid redirect URIs**: `http://localhost:3000/auth/callback`
   - **Valid post logout redirect URIs**: `http://localhost:3000`
   - **Web origins**: `http://localhost:3000`
   - Click "Save"

## Step 5: Get Client Secret

1. In the client details page, click on the "Credentials" tab
2. Copy the "Client secret" value

## Step 6: Create a Test User

1. In the left sidebar, click "Users"
2. Click "Add user"
3. Fill in the details:
   - **Username**: `testuser`
   - **Email**: `testuser@example.com`
   - **First name**: `Test`
   - **Last name**: `User`
   - **Email verified**: ON
   - Click "Create"
4. Click on the "Credentials" tab
5. Click "Set password"
6. Fill in:
   - **Password**: `testpass`
   - **Password confirmation**: `testpass`
   - **Temporary**: OFF
   - Click "Save"

## Step 7: Configure Backend

1. Copy `apps/backend/.env.example` to `apps/backend/.env`
2. Update the values:
   ```env
   OIDC_ISSUER=http://localhost:8080/realms/oktomusic
   OIDC_CLIENT_ID=oktomusic-client
   OIDC_CLIENT_SECRET=<paste-your-client-secret-here>
   OIDC_REDIRECT_URI=http://localhost:3000/auth/callback
   OIDC_LOGOUT_REDIRECT_URI=http://localhost:3000
   ```

## Step 8: Start the Application

```bash
# Start the database
docker compose up postgres -d

# Generate Prisma client
cd apps/backend
pnpm db:generate

# Start the backend
pnpm start:dev
```

In another terminal:
```bash
# Start the frontend
cd apps/frontend
pnpm dev
```

## Step 9: Test the Login Flow

1. Open http://localhost:3000 in your browser
2. You should see "Not logged in"
3. Click "Login"
4. Click "Login with OIDC"
5. You'll be redirected to Keycloak
6. Login with:
   - Username: `testuser`
   - Password: `testpass`
7. You'll be redirected back to the app
8. You should now see "✓ Logged in"
9. Click "Go to Dashboard" to see your user information

## Step 10: Run E2E Tests

```bash
# Make sure the backend is running
# Then run Playwright tests
pnpm exec playwright test
```

## Troubleshooting

### Keycloak Connection Issues

If you get connection errors, make sure:
- Keycloak is running: `docker compose ps keycloak`
- The issuer URL is correct and accessible
- The client secret matches the one in Keycloak

### Redirect URI Mismatch

If you get "Invalid redirect URI" error:
- Check that the redirect URI in Keycloak matches exactly: `http://localhost:3000/auth/callback`
- Make sure there are no trailing slashes

### Token Refresh Issues

If token refresh fails:
- Check that the refresh token is being stored correctly
- Verify that the client configuration allows refresh token rotation
- Check browser console for errors

## Additional Configuration

### PKCE (Proof Key for Code Exchange)

PKCE is automatically enabled by the backend. Keycloak supports PKCE by default.

### Scopes

Default scopes requested:
- `openid` - Required for OIDC
- `profile` - User profile information
- `email` - User email address

You can modify scopes in the `.env` file:
```env
OIDC_SCOPES=openid profile email offline_access
```

### Token Expiration

Keycloak default token lifetimes:
- Access Token: 5 minutes
- Refresh Token: 30 minutes

The frontend automatically refreshes tokens every 50 minutes (configurable in `Dashboard.tsx`).

## Security Notes

- Never commit your `.env` file to version control
- Use different client secrets for different environments
- In production, use HTTPS for all OIDC communications
- Implement proper session storage (Redis, database) instead of in-memory storage
- Consider implementing CSRF protection for additional security
