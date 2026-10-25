/**
 * Clones stylesheets from one document to another.
 *
 * @todo Support hot reloading of stylesheets in dev mode.
 */
export function cloneStyles(doc1: Document, doc2: Document) {
  [...doc1.querySelectorAll('link[rel="stylesheet"]')].forEach((link) => {
    doc2.head.appendChild(link.cloneNode(true));
  });

  // In dev mode styles are applied via style tags
  if (import.meta.env.DEV) {
    [...doc1.querySelectorAll("style")].forEach((style) => {
      doc2.head.appendChild(style.cloneNode(true));
    });
  }
}
