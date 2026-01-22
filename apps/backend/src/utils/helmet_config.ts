import type { HelmetOptions } from "helmet";

type CSPDirectives = Record<string, string[]>;

/**
 * Merge a set of CSP directives
 */
export function mergeDirectivesCSP(data: CSPDirectives[]): CSPDirectives {
  return data.reduce<CSPDirectives>((acc, current) => {
    for (const [directive, values] of Object.entries(current)) {
      acc[directive] = acc[directive]
        ? Array.from(new Set([...acc[directive], ...values]))
        : [...values];
    }
    return acc;
  }, {});
}

/**
 * CSP directives that should always apply
 */
const defaultCSP: CSPDirectives = {
  baseUri: ["'none'"],

  // Disallow loading any resource by default
  defaultSrc: ["'none'"],

  // Individual resources whitelist
  imgSrc: ["'self'", "data:"], // Production assets
  manifestSrc: ["'self'"], // Manifest is built from backend
  scriptSrcElem: ["'self'"], // Production assets
  connectSrc: ["'self'"],
  styleSrc: ["'self'"], // Production assets
  mediaSrc: ["'self'"],
  workerSrc: ["'self'"],
  upgradeInsecureRequests: [],
} as const;

/**
 * CSP directives that should apply in dev (static)
 */
const staticDevCSP: CSPDirectives = {
  // Vite injects inline styles in dev
  styleSrc: ["'unsafe-inline'"],
  // React refresh
  scriptSrcElem: ["'unsafe-inline'"],
  workerSrc: ["blob:"],
} as const;

/**
 * CSP directives for Jotai devtools
 *
 * @see https://jotai.org/docs/tools/devtools
 */
const jotaiCSP: CSPDirectives = {
  imgSrc: ["data:"],
  fontSrc: ["data:"],
} as const;

/**
 * CSP directives for Graphiql
 */
const graphiqlCSP: CSPDirectives = {
  scriptSrcElem: ["https://unpkg.com"],
  styleSrcElem: ["'unsafe-inline'", "https://unpkg.com"],
  connectSrc: ["https://unpkg.com"],
} as const;

/**
 * CSP directives for Swagger
 */
const swaggerCSP: CSPDirectives = {
  styleSrcElem: ["'self'"],
} as const;

function getHelmetDirectivesCSP(
  isDev: boolean,
  viteUrl: string,
): Readonly<CSPDirectives> {
  if (!isDev) {
    return defaultCSP;
  }

  /**
   * Dynamic development CSP that depend on Vite URL
   */
  const dynamicDevCSP: CSPDirectives = {
    // Vite assets
    imgSrc: [viteUrl],

    // Vite assets
    scriptSrcElem: [viteUrl],

    // WebSocket for HMR, some other dev assets
    connectSrc: [viteUrl, viteUrl.replace("http", "ws")],
  };

  return Object.freeze(
    mergeDirectivesCSP([
      defaultCSP,
      staticDevCSP,
      dynamicDevCSP,
      jotaiCSP,
      graphiqlCSP,
      swaggerCSP,
    ]),
  );
}

export function getHelmetConfig(
  isDev: boolean,
  viteUrl: string,
): Readonly<HelmetOptions> {
  return {
    contentSecurityPolicy: {
      reportOnly: false,
      directives: getHelmetDirectivesCSP(isDev, viteUrl),
      useDefaults: false,
    },
    strictTransportSecurity: {
      maxAge: 63072000, // 2 years in seconds
      includeSubDomains: true,
      preload: true,
    },
    xPoweredBy: false,
  };
}
