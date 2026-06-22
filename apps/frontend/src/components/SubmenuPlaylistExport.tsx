import { Menu } from "@base-ui/react";
import { t } from "@lingui/core/macro";
import { LuArrowDownToLine, LuChevronRight } from "react-icons/lu";

import { OktoMenuLink } from "./Base/OktoMenu";

interface SubmenuPlaylistExportProps {
  readonly playlistId: string;
}

export function SubmenuPlaylistExport(props: SubmenuPlaylistExportProps) {
  return (
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-white select-none focus:outline-0 data-highlighted:bg-white/10">
        <LuArrowDownToLine className="size-4" />
        {t`Export as...`}
        <LuChevronRight className="ml-auto size-4" />
      </Menu.SubmenuTrigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} alignOffset={-12}>
          <Menu.Popup className="mt-2 w-52 origin-(--transform-origin) overflow-hidden rounded-xl bg-zinc-800 p-1 text-sm/6 text-white transition duration-100 ease-in focus:outline-none data-ending-style:opacity-0 data-starting-style:opacity-0">
            <OktoMenuLink
              type="link"
              href={`/api/playlist/${props.playlistId}/xspf`}
              download
              label="XSPF"
            />
            <OktoMenuLink
              type="link"
              href={`/api/playlist/${props.playlistId}/jspf`}
              download
              label="JSPF"
            />
            <OktoMenuLink
              type="link"
              href={`/api/playlist/${props.playlistId}/m3u`}
              download
              label="M3U"
            />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  );
}
