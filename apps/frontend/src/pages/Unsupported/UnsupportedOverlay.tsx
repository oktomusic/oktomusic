import { useLingui } from "@lingui/react/macro";
import { supportedBrowsers } from "../../utils/constants_browsers";

interface UnsupportedOverlayProps {
  readonly missing: string[];
}

export function UnsupportedOverlay({ missing }: UnsupportedOverlayProps) {
  const { t } = useLingui();

  return (
    <div className="min-h-app-shell flex w-full sm:items-center sm:justify-center">
      <div className="child-scroll bg-zinc-900 p-6 select-none sm:rounded-md">
        <h1 className="w-full text-center text-2xl">
          {t`Upgrade to a supported Chromium browser`}
        </h1>
        <ul className="my-6 grid w-full grid-cols-1 divide-y divide-zinc-600 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
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
