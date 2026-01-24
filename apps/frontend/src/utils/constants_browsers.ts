import chrome_icon from "../assets/google_chrome_2022.svg";
import brave_icon from "../assets/brave_2022.svg";
import edge_icon from "../assets/microsoft_edge_2019.svg";
// icons are from Wikipedia

export interface SupportedBrowser {
  readonly name: string;
  readonly icon: string;
  readonly dlLink: string;
}

export const supportedBrowsers: SupportedBrowser[] = [
  {
    name: "Google Chrome",
    icon: chrome_icon,
    dlLink: "https://www.google.com/chrome",
  },
  {
    name: "Brave",
    icon: brave_icon,
    dlLink: "https://brave.com",
  },
  {
    name: "Microsoft Edge",
    icon: edge_icon,
    dlLink: "https://www.microsoft.com/edge",
  },
] as const;
