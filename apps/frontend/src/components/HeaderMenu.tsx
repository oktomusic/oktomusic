import { Link } from "react-router";
import { useAtomValue } from "jotai";
import { Avatar } from "@base-ui/react/avatar";
import { Button } from "@base-ui/react/button";
import {
  LuChevronLeft,
  LuChevronRight,
  LuCircleArrowDown,
  LuHouse,
  LuInfo,
  LuSettings,
  LuSquareArrowRight,
  LuUserRound,
  LuUserRoundPen,
} from "react-icons/lu";
import { t } from "@lingui/core/macro";

import { pwaDeferredPromptAtom } from "../atoms/app/atoms";
import { useNavigationHistory } from "../hooks/use_navigation_history";
import { OktoMenu, OktoMenuItem } from "./Base/OktoMenu";
import { settingClientKioskMode } from "../atoms/app/settings_client";
import { authSessionAtom } from "../atoms/auth/atoms";
import { Role } from "../api/graphql/gql/graphql";
import { HeaderMenuSearch } from "./HeaderMenuSearch";

export function HeaderMenu() {
  const pwaDeferedPrompt = useAtomValue(pwaDeferredPromptAtom);
  const kioskModeEnabled = useAtomValue(settingClientKioskMode);

  const authSession = useAtomValue(authSessionAtom);

  const { canGoBack, canGoForward, goBack, goForward } = useNavigationHistory();

  const usernameInitial = authSession.user?.username
    ? authSession.user.username[0].toUpperCase()
    : "";

  const menuItems: OktoMenuItem[] = [
    {
      type: "router-link",
      label: "User Profile",
      to: `/user/${authSession.user?.id}`,
      icon: <LuUserRound className="size-4" />,
      // shortcut: "⌘E",
    },
    {
      type: "router-link",
      label: t`Account Settings`,
      to: "/settings/account",
      icon: <LuUserRoundPen className="size-4" />,
    },
    {
      type: "router-link",
      label: t`Admin Settings`,
      to: "/settings/admin",
      icon: <LuSettings className="size-4" />,
      hidden: authSession.user?.role !== Role.Admin,
    },
    {
      type: "link",
      label: t`About`,
      href: "https://oktomusic.afcms.dev",
      target: "_blank",
      rel: "noreferrer",
      icon: <LuInfo className="size-4" />,
      hidden: kioskModeEnabled,
    },
    {
      type: "separator",
    },
    {
      type: "link",
      label: t`Logout`,
      href: "/api/auth/logout",
      icon: <LuSquareArrowRight className="size-4" />,
    },
  ];

  return (
    <div className="flex h-14 flex-row gap-2 p-2">
      <div className="ml-40 flex flex-row items-center gap-2">
        <Button
          className="flex aspect-square size-8 items-center justify-center rounded-full data-disabled:cursor-not-allowed data-disabled:opacity-50"
          onClick={goBack}
          disabled={!canGoBack}
          aria-label={t`Go back`}
          title={t`Go back`}
        >
          <LuChevronLeft className="size-6" />
        </Button>
        <Button
          className="flex aspect-square size-8 items-center justify-center rounded-full data-disabled:cursor-not-allowed data-disabled:opacity-50"
          onClick={goForward}
          disabled={!canGoForward}
          aria-label={t`Go forward`}
          title={t`Go forward`}
        >
          <LuChevronRight className="size-6" />
        </Button>
        <Link
          to="/"
          aria-label={t`Home`}
          title={t`Home`}
          className="flex aspect-square size-8 items-center justify-center rounded-full data-disabled:cursor-not-allowed data-disabled:opacity-50"
        >
          <LuHouse className="size-6" />
        </Link>
      </div>
      <HeaderMenuSearch />
      <div className="flex w-full grow"></div>
      <div className="mr-2 flex flex-row items-center justify-end gap-2">
        {pwaDeferedPrompt && (
          <Button
            className="hide-in-standalone flex aspect-square size-8 items-center justify-center rounded-full"
            title={t`Install Application`}
            onClick={() => {
              void pwaDeferedPrompt.prompt();
            }}
          >
            <LuCircleArrowDown className="size-6" />
          </Button>
        )}
        <Link
          to="/settings/client"
          title="Client Settings"
          className="flex aspect-square size-8 items-center justify-center rounded-full"
        >
          <LuSettings className="size-6" />
        </Link>
        <OktoMenu
          button={
            <Avatar.Root className="inline-flex size-8 items-center justify-center rounded-full bg-zinc-700">
              {/* TODO: profile images */}
              <Avatar.Fallback>{usernameInitial}</Avatar.Fallback>
            </Avatar.Root>
          }
          buttonClassName="rounded-full focus:outline-2 focus:-outline-offset-2 focus:outline-white/25"
          buttonAriaLabel="User menu"
          positionAlign="end"
          positionSide="bottom"
          items={menuItems}
        />
      </div>
    </div>
  );
}
