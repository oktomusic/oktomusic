import { Link } from "react-router";
import { useAtomValue } from "jotai";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineArrowDownCircle,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth,
  HiOutlineHome,
  HiOutlineInformationCircle,
  HiOutlineUser,
} from "react-icons/hi2";
import { t } from "@lingui/core/macro";

import { pwaDeferredPromptAtom } from "../atoms/app/atoms";
import { useNavigationHistory } from "../hooks/use_navigation_history";
import { OktoMenu, OktoMenuItem } from "./Base/OktoMenu";
import { settingClientKioskMode } from "../atoms/app/settings_client";

export function HeaderMenu() {
  const pwaDeferedPrompt = useAtomValue(pwaDeferredPromptAtom);
  const kioskModeEnabled = useAtomValue(settingClientKioskMode);

  const { canGoBack, canGoForward, goBack, goForward } = useNavigationHistory();

  const menuItems: OktoMenuItem[] = [
    {
      type: "button",
      label: "User Profile",
      onClick: () => {},
      icon: <HiOutlineUser className="size-4" />,
      shortcut: "⌘E",
    },
    {
      type: "link",
      label: t`About`,
      href: "https://oktomusic.afcms.dev",
      target: "_blank",
      rel: "noreferrer",
      icon: <HiOutlineInformationCircle className="size-4" />,
      hidden: kioskModeEnabled,
    },
    {
      type: "separator",
    },
    {
      type: "link",
      label: t`Logout`,
      href: "/api/auth/logout",
      icon: <HiOutlineArrowRightOnRectangle className="size-4" />,
    },
  ];

  return (
    <div className="flex h-14 flex-row gap-2 p-2">
      <div className="ml-40 flex flex-row items-center gap-2">
        <button
          className="flex aspect-square size-8 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
          onClick={goBack}
          disabled={!canGoBack}
          aria-label={t`Go back`}
          title={t`Go back`}
        >
          <HiChevronLeft className="size-6" />
        </button>
        <button
          className="flex aspect-square size-8 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
          onClick={goForward}
          disabled={!canGoForward}
          aria-label={t`Go forward`}
          title={t`Go forward`}
        >
          <HiChevronRight className="size-6" />
        </button>
        <Link
          to="/"
          className="flex aspect-square size-8 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HiOutlineHome className="size-6" />
        </Link>
      </div>
      <div className="flex w-full grow"></div>
      <div className="mr-2 flex flex-row items-center justify-end gap-2">
        {pwaDeferedPrompt && (
          <button
            className="hide-in-standalone flex aspect-square size-8 items-center justify-center rounded-full"
            title={t`Install Application`}
            onClick={() => {
              void pwaDeferedPrompt.prompt();
            }}
          >
            <HiOutlineArrowDownCircle className="size-6" />
          </button>
        )}
        <Link
          to="/settings/client"
          title="Client Settings"
          className="flex aspect-square size-8 items-center justify-center rounded-full"
        >
          <HiOutlineCog6Tooth className="size-6" />
        </Link>
        <OktoMenu
          button="AA"
          buttonClassName="flex aspect-square size-8 items-center justify-center rounded-full bg-slate-700"
          buttonAriaLabel="User menu"
          items={menuItems}
        />
      </div>
    </div>
  );
}
