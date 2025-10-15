import hbs from "hbs";

/**
 * Registers the `asset` Handlebars helper.
 * Prefixes asset paths with the Vite origin in development mode.
 */
export function registerAssetHelper(opts: {
  isDev: boolean;
  viteOrigin?: string;
}): void {
  const { isDev, viteOrigin } = opts;

  hbs.registerHelper("asset", (p: unknown) => {
    if (typeof p !== "string" || !p) return "";
    // Absolute URL? return as-is
    if (/^https?:\/\//i.test(p)) return p;
    // Avoid prefixing API routes
    if (p.startsWith("/api")) return p;
    if (isDev && viteOrigin) {
      const pathname = p.startsWith("/") ? p : `/${p}`;
      try {
        return new URL(pathname, viteOrigin).toString();
      } catch {
        return `${viteOrigin}${pathname}`;
      }
    }
    return p;
  });
}
