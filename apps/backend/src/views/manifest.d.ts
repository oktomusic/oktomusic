// Copied from Vite PWA plugin types to avoid adding it as a dependency

interface ShareTargetFiles {
  name: string;
  accept: string | string[];
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest/launch_handler#launch_handler_item_values
 */
type LaunchHandlerClientMode =
  | "auto"
  | "focus-existing"
  | "navigate-existing"
  | "navigate-new";
type Display = "fullscreen" | "standalone" | "minimal-ui" | "browser";
type DisplayOverride = Display | "window-controls-overlay";
type IconPurpose = "monochrome" | "maskable" | "any";
/**
 * type StringLiteralUnion<'maskable'> = 'maskable' | string
 * This has auto completion whereas `'maskable' | string` doesn't
 * Adapted from https://github.com/microsoft/TypeScript/issues/29729
 */
type StringLiteralUnion<T extends U, U = string> = T | (U & {});
type ScopeExtensionsType = "origin";

/**
 * @see https://w3c.github.io/manifest/#manifest-image-resources
 */
interface IconResource {
  sizes?: string;
  src: string;
  type?: string;
  /**
   * **NOTE**: string values for backward compatibility with the old type.
   */
  purpose?: StringLiteralUnion<IconPurpose> | IconPurpose[];
}

interface ManifestOptions {
  /**
   * @default _npm_package_name_
   */
  name: string;
  /**
   * @default _npm_package_name_
   */
  short_name: string;
  /**
   * @default _npm_package_description_
   */
  description: string;
  /**
   * @default []
   * @see https://developer.mozilla.org/en-US/docs/Web/Manifest/icons
   * @see https://w3c.github.io/manifest/#icons-member
   */
  icons: IconResource[];
  /**
   * @default []
   * @see https://developer.mozilla.org/en-US/docs/Web/Manifest/file_handlers
   * @see https://wicg.github.io/manifest-incubations/#file_handlers-member
   */
  file_handlers: {
    action: string;
    accept: Record<string, string[]>;
  }[];
  /**
   * @default `routerBase`
   */
  start_url: string;
  /**
   * Restricts what web pages can be viewed while the manifest is applied
   */
  scope: string;
  /**
   * A string that represents the identity for the application
   */
  id: string;
  /**
   * Defines the default orientation for all the website's top-level
   */
  orientation:
    | "any"
    | "natural"
    | "landscape"
    | "landscape-primary"
    | "landscape-secondary"
    | "portrait"
    | "portrait-primary"
    | "portrait-secondary";
  /**
   * @default `standalone`
   * @see https://developer.mozilla.org/en-US/docs/Web/Manifest/display
   * @see https://w3c.github.io/manifest/#display-member
   */
  display: Display;
  /**
   * @default []
   * @see https://developer.mozilla.org/en-US/docs/Web/Manifest/display_override
   * @see https://wicg.github.io/manifest-incubations/#display_override-member
   */
  display_override: DisplayOverride[];
  /**
   * @default `#ffffff`
   */
  background_color: string;
  /**
   * @default `#42b883`
   */
  theme_color: string;
  /**
   * @default `ltr`
   */
  dir: "ltr" | "rtl";
  /**
   * @default `en`
   */
  lang: string;
  /**
   * @default A combination of `routerBase` and `options.build.publicPath`
   */
  publicPath: string;
  /**
   * @default []
   */
  related_applications: {
    platform: string;
    url: string;
    id?: string;
  }[];
  /**
   * @default false
   */
  prefer_related_applications: boolean;
  /**
   * @default []
   */
  protocol_handlers: {
    protocol: string;
    url: string;
  }[];
  /**
   * @default []
   * @see https://developer.mozilla.org/en-US/docs/Web/Manifest/shortcuts
   * @see https://w3c.github.io/manifest/#shortcuts-member
   */
  shortcuts: {
    name: string;
    short_name?: string;
    url: string;
    description?: string;
    icons?: IconResource[];
  }[];
  /**
   * @default []
   * @see https://developer.mozilla.org/en-US/docs/Web/Manifest/screenshots
   */
  screenshots: {
    src: string;
    sizes: string;
    label?: string;
    platform?:
      | "android"
      | "ios"
      | "kaios"
      | "macos"
      | "windows"
      | "windows10x"
      | "chrome_web_store"
      | "play"
      | "itunes"
      | "microsoft-inbox"
      | "microsoft-store";
    form_factor?: "narrow" | "wide";
    type?: string;
  }[];
  /**
   * @default []
   */
  categories: string[];
  /**
   * @default ''
   */
  iarc_rating_id: string;
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/Manifest/share_target
   * @see https://w3c.github.io/web-share-target/level-2/#share_target-member
   */
  share_target: {
    action: string;
    method?: "GET" | "POST";
    enctype?: string;
    params: {
      title?: string;
      text?: string;
      url?: string;
      files?: ShareTargetFiles | ShareTargetFiles[];
    };
  };
  /**
   * @see https://github.com/WICG/pwa-url-handler/blob/main/handle_links/explainer.md#handle_links-manifest-member
   */
  handle_links?: "auto" | "preferred" | "not-preferred";
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/Manifest/launch_handler#launch_handler_item_values
   */
  launch_handler?: {
    client_mode: LaunchHandlerClientMode | LaunchHandlerClientMode[];
  };
  /**
   * @see https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/sidebar#enable-sidebar-support-in-your-pwa
   */
  edge_side_panel?: {
    preferred_width?: number;
  };
  /**
   * @see https://github.com/WICG/manifest-incubations/blob/gh-pages/scope_extensions-explainer.md
   * @see https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/scope_extensions
   * @default []
   */
  scope_extensions: {
    origin: string;
    /**
     * @default 'origin'
     */
    type?: StringLiteralUnion<ScopeExtensionsType>;
  }[];
}
