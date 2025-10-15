import hbs from "hbs";
import Handlebars from "handlebars";
import type { ViewModel } from "../view-model";

/**
 * Registers the `viteAssetTags` Handlebars helper.
 * It renders precomputed asset tags (with SRI) from the view model in production.
 */
export function registerViteAssetTagsHelper(): void {
  hbs.registerHelper("viteAssetTags", function (this: ViewModel) {
    if (!this.assetTags) return "";
    return new Handlebars.SafeString(
      this.assetTags
        .map((tag) => {
          const attrs = Object.entries(tag.attrs)
            .map(([key, value]) => {
              if (typeof value === "boolean") {
                return value ? key : "";
              }
              return `${key}="${value}"`;
            })
            .filter(Boolean)
            .join(" ");
          return `<${tag.tag} ${attrs}></${tag.tag}>`;
        })
        .join("\n    "),
    );
  });
}
