import { Link } from "react-router";
import { useAtomValue } from "jotai";
import {
  HiOutlineArrowDownCircle,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth,
  HiOutlineInformationCircle,
  HiOutlineUser,
} from "react-icons/hi2";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { t } from "@lingui/core/macro";

import { pwaDeferredPromptAtom } from "../atoms/app/atoms";

export function HeaderMenu() {
  const pwaDeferedPrompt = useAtomValue(pwaDeferredPromptAtom);

  return (
    <div className="flex h-14 flex-row gap-2 p-2">
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
        <Menu>
          <MenuButton className="flex aspect-square size-8 items-center justify-center rounded-full bg-slate-700">
            AA
          </MenuButton>
          <MenuItems
            transition
            anchor="bottom end"
            className="w-52 origin-top-right rounded-xl border border-white/10 bg-black p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
          >
            <MenuItem>
              <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                <HiOutlineUser className="size-4" />
                User Profile
                <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline">
                  ⌘E
                </kbd>
              </button>
            </MenuItem>
            <MenuItem>
              <a
                href="https://oktomusic.afcms.dev"
                target="_blank"
                rel="noreferrer"
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
              >
                <HiOutlineInformationCircle className="size-4" />
                {t`About`}
              </a>
            </MenuItem>
            <div className="my-1 h-px bg-white/5" />
            <MenuItem>
              <a
                href="/api/auth/logout"
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
              >
                <HiOutlineArrowRightOnRectangle className="size-4" />
                {t`Logout`}
              </a>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}
