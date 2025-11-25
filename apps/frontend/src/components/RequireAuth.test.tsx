import { render, waitFor, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router"
import { createStore, Provider } from "jotai"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { authSessionAtom } from "../atoms/auth/atoms"
import RequireAuth from "./RequireAuth"

// Mock the auth API
vi.mock("../api/axios/endpoints/auth", () => ({
  getSession: vi.fn(),
}))

// Import the mocked module
import { getSession } from "../api/axios/endpoints/auth"

const mockedGetSession = vi.mocked(getSession)

function TestApp() {
  return <div data-testid="protected-content">Protected Content</div>
}

function LoginPage() {
  return <div data-testid="login-page">Login Page</div>
}

describe("RequireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should redirect to login when user is not authenticated", async () => {
    mockedGetSession.mockResolvedValue({ authenticated: false })

    const store = createStore()
    store.set(authSessionAtom, { authenticated: false })

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <TestApp />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

    // Wait for the redirect to happen
    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeDefined()
    })

    // Verify protected content is not rendered
    expect(screen.queryByTestId("protected-content")).toBeNull()
  })

  it("should render protected content when user is authenticated", async () => {
    mockedGetSession.mockResolvedValue({ authenticated: true })

    const store = createStore()
    store.set(authSessionAtom, { authenticated: true })

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <TestApp />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

    // Wait for the content to appear
    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeDefined()
    })

    // Verify login page is not rendered
    expect(screen.queryByTestId("login-page")).toBeNull()
  })

  it("should redirect to login when session check fails", async () => {
    mockedGetSession.mockRejectedValue(new Error("Network error"))

    const store = createStore()

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <TestApp />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

    // Wait for the redirect to happen after error
    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeDefined()
    })

    // Verify protected content is not rendered
    expect(screen.queryByTestId("protected-content")).toBeNull()
  })
})
