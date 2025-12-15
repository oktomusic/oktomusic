import { useLingui } from "@lingui/react/macro";

import chrome_icon from "../../assets/google_chrome_2022.svg";
import brave_icon from "../../assets/brave_2022.svg";
import edge_icon from "../../assets/microsoft_edge_2019.svg";
// icons are from Wikipedia

interface SupportedBrowser {
  readonly name: string;
  readonly icon: string;
  readonly dlLink: string;
}

const supportedBrowsers: SupportedBrowser[] = [
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

interface UnsupportedOverlayProps {
  readonly missing: string[];
}

export function UnsupportedOverlay({ missing }: UnsupportedOverlayProps) {
  const { t } = useLingui();

  return (
    <div className="min-h-app-shell flex w-full sm:items-center sm:justify-center">
      <div className="rounded-md bg-sky-950 p-6 select-none">
        <h1 className="w-full text-center text-2xl">
          {t`Upgrade to a supported Chromium browser`}
        </h1>
        <ul className="my-6 grid w-full grid-cols-1 divide-y divide-sky-900 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {supportedBrowsers.map((browser) => (
            <li key={browser.name} className="p-4 text-center">
              <a
                href={browser.dlLink}
                target="_blank"
                rel="noreferrer noopener"
                className="flex h-full w-full flex-col items-center justify-center"
              >
                <img
                  src={browser.icon}
                  alt={browser.name}
                  className="mb-2 aspect-square h-12 w-12"
                />
                <span>{browser.name}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6">{t`The following modern web features are missing:`}</p>
        {missing.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-8">
            {missing.map((m) => (
              <li key={m} className="wrap-break-word">
                {m}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default UnsupportedOverlay;
