import { test, expect } from "@playwright/test";

test.describe("OIDC Authentication Flow", () => {
  test.skip("complete login flow with PKCE", async ({ page }) => {
    // Note: This test requires Keycloak to be running with proper configuration
    // To run this test:
    // 1. Start Keycloak: docker compose up keycloak -d
    // 2. Configure Keycloak with:
    //    - Realm: oktomusic
    //    - Client ID: oktomusic-client
    //    - Valid redirect URIs: http://localhost:3000/auth/callback
    //    - Create a test user with credentials
    // 3. Set environment variables in apps/backend/.env:
    //    OIDC_ISSUER=http://localhost:8080/realms/oktomusic
    //    OIDC_CLIENT_ID=oktomusic-client
    //    OIDC_CLIENT_SECRET=<your-secret>
    //    OIDC_REDIRECT_URI=http://localhost:3000/auth/callback

    // Navigate to the app
    await page.goto("/");

    // Check initial state - should not be logged in
    await expect(page.getByText("Not logged in")).toBeVisible();

    // Click login link
    await page.getByRole("link", { name: "Login" }).click();

    // Should be on login page
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();

    // Click login button to initiate OIDC flow
    await page.getByRole("button", { name: "Login with OIDC" }).click();

    // Should be redirected to Keycloak login page
    // Wait for redirect (might take a moment)
    await page.waitForURL(/.*keycloak.*/);
    await expect(page).toHaveURL(/.*keycloak.*/);

    // Fill in Keycloak credentials
    await page.getByLabel("Username or email").fill("testuser");
    await page.getByLabel("Password").fill("testpass");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should be redirected back to callback page
    await page.waitForURL(/.*auth\/callback.*/);

    // Should complete authentication and redirect to home
    await page.waitForURL("/");

    // Should now be logged in
    await expect(page.getByText("✓ Logged in")).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to Dashboard" })).toBeVisible();

    // Navigate to dashboard
    await page.getByRole("link", { name: "Go to Dashboard" }).click();
    await expect(page).toHaveURL("/dashboard");

    // Should see dashboard with user info
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("✓ You are logged in!")).toBeVisible();

    // Should see user information
    await expect(page.getByRole("heading", { name: "User Information" })).toBeVisible();

    // Test token refresh
    await page.getByRole("button", { name: "Refresh Token" }).click();
    await expect(page.getByText("Refreshing...")).toBeVisible();
    // Wait for refresh to complete
    await expect(page.getByText("Refreshing...")).not.toBeVisible();

    // Test logout
    await page.getByRole("button", { name: "Logout" }).click();

    // Should be redirected to Keycloak logout or back to login
    // Wait for redirect
    await page.waitForURL(/.*(login|keycloak).*/);
  });

  test("navigation without authentication", async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Should see not logged in state
    await expect(page.getByText("Not logged in")).toBeVisible();

    // Try to go to dashboard without auth
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL("/login");
  });

  test("session check API endpoint", async ({ page }) => {
    // Navigate to app
    await page.goto("/");

    // Make API call to check session
    const response = await page.request.get("/api/auth/session");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty("authenticated");
    expect(data.authenticated).toBe(false);
  });
});
