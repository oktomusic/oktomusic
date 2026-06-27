import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Input } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { useLingui } from "@lingui/react/macro";
import { useSetAtom } from "jotai";
import {
  LuChevronRight,
  LuListPlus,
  LuLoaderCircle,
  LuPlus,
} from "react-icons/lu";

import { SEARCH_MY_PLAYLISTS_QUERY } from "../api/graphql/queries/searchMyPlaylists";
import { OktoMenuButton, OktoMenuSeparator } from "./Base/OktoMenu";
import { dialogPlaylistOpenAtom } from "../atoms/app/dialogs";

interface SubmenuPlaylistsSearchProps {
  readonly onClick: (playlistId: string) => Promise<void>;
}

export function SubmenuPlaylistsSearch(props: SubmenuPlaylistsSearchProps) {
  const { t } = useLingui();

  const setDialogPlaylistOpen = useSetAtom(dialogPlaylistOpenAtom);

  const [searchQuery, setSearchQuery] = useState("");

  const { data, previousData, loading, error } = useQuery(
    SEARCH_MY_PLAYLISTS_QUERY,
    {
      variables: {
        name: searchQuery,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const playlistData = data ?? previousData;
  const playlistItems = playlistData?.searchMyPlaylists ?? [];
  const showErrorPlaceholder = Boolean(error) && !playlistData;

  return (
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-white select-none focus:outline-0 data-highlighted:bg-white/10">
        <LuListPlus className="size-4" />
        {t`Add to playlist`}
        <LuChevronRight className="ml-auto size-4" />
      </Menu.SubmenuTrigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} alignOffset={-12}>
          {/* max-h-67.25 = (7 playlist rows × 36px) + 9px separator height */}
          <Menu.Popup className="mt-2 max-h-67.25 w-52 origin-(--transform-origin) overflow-hidden rounded-xl bg-zinc-800 p-1 text-sm/6 text-white transition duration-100 ease-in focus:outline-none data-ending-style:opacity-0 data-starting-style:opacity-0">
            <div className="relative">
              <Input
                placeholder={t`Find a playlist...`}
                className="h-9 w-full rounded-lg bg-zinc-800 py-1.5 pr-9 pl-3 text-sm text-white focus:outline-2 focus:-outline-offset-2 focus:outline-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Escape") {
                    e.stopPropagation();
                  }
                }}
                aria-busy={loading}
              />
              {loading ? (
                <div
                  className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                  role="status"
                  aria-live="polite"
                >
                  <LuLoaderCircle
                    className="size-4 animate-spin text-white/70"
                    aria-hidden={true}
                  />
                  <span className="sr-only">{t`Loading playlists`}</span>
                </div>
              ) : null}
            </div>
            <OktoMenuButton
              type="button"
              label={t`New playlist`}
              onClick={() => {
                setDialogPlaylistOpen(true);
              }}
              icon={<LuPlus className="size-4" />}
            />
            <OktoMenuSeparator />
            {/* max-h-45 constrains the scrollable playlist list to 5 rows (5 × 36px = 180px) */}
            <ScrollArea.Root className={"max-h-45 w-auto"}>
              <ScrollArea.Viewport className="h-full">
                <ScrollArea.Content>
                  {showErrorPlaceholder ? (
                    <div className="flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-white/70 select-none">
                      {`Load failed`}
                    </div>
                  ) : null}
                  {playlistItems.map((playlist) => (
                    <OktoMenuButton
                      key={playlist.id}
                      type="button"
                      label={playlist.name}
                      onClick={() => {
                        void props.onClick(playlist.id);
                      }}
                    />
                  ))}
                </ScrollArea.Content>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar className="pointer-events-none flex w-1 justify-center rounded-sm bg-zinc-600 opacity-0 transition-opacity data-hovering:pointer-events-auto data-hovering:opacity-100 data-hovering:delay-0 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0">
                <ScrollArea.Thumb className="w-full rounded-sm bg-zinc-500" />
              </ScrollArea.Scrollbar>
              <ScrollArea.Corner />
            </ScrollArea.Root>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  );
}
