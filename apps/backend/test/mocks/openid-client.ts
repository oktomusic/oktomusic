// Minimal mock of openid-client used in tests
export type Configuration = {
  serverMetadata: () => { supportsPKCE: () => boolean };
};

export type TokenEndpointResponse = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
};

export const discovery = jest.fn(() => {
  return {
    serverMetadata: () => ({ supportsPKCE: () => true }),
  } as Configuration;
});

export const randomPKCECodeVerifier = jest.fn(() => "verifier");
export const calculatePKCECodeChallenge = jest.fn(() =>
  Promise.resolve("challenge"),
);
export const randomState = jest.fn(() => "state");

export const buildAuthorizationUrl = jest.fn(() => {
  return new URL("https://issuer.example/authorize");
});

export const authorizationCodeGrant = jest.fn(() =>
  Promise.resolve({ access_token: "at" } as TokenEndpointResponse),
);

export const fetchUserInfo = jest.fn(() =>
  Promise.resolve({ sub: "mock-user" }),
);

export const refreshTokenGrant = jest.fn(() =>
  Promise.resolve({ access_token: "at2" }),
);

export const buildEndSessionUrl = jest.fn(() => {
  return new URL("https://issuer.example/logout");
});
