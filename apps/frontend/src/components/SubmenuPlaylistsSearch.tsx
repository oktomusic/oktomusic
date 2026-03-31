import { useState } from "react";
import { useSetAtom } from "jotai";
import { useQuery } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { Menu } from "@base-ui/react/menu";
import { Input } from "@base-ui/react/input";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { LuChevronRight, LuListPlus, LuPlus } from "react-icons/lu";

import { SEARCH_MY_PLAYLISTS_QUERY } from "../api/graphql/queries/searchMyPlaylists";
import { OktoMenuButton, OktoMenuSeparator } from "./Base/OktoMenu";
import { dialogPlaylistOpenAtom } from "../atoms/app/dialogs";

interface SubmenuPlaylistsSearchProps {
  readonly onClick: (playlistId: string) => Promise<void>;
}

export function SubmenuPlaylistsSearch(props: SubmenuPlaylistsSearchProps) {
  const setDialogPlaylistOpen = useSetAtom(dialogPlaylistOpenAtom);

  const [searchQuery, setSearchQuery] = useState("");

  console.log(typeof props);

  const { data, loading, error } = useQuery(SEARCH_MY_PLAYLISTS_QUERY, {
    variables: {
      name: searchQuery,
    },
  });

  // 7 lines of 36px + separator of 9px

  return (
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-white select-none focus:outline-0 data-highlighted:bg-white/10">
        <LuListPlus className="size-4" />
        {t`Add to playlist`}
        <LuChevronRight className="ml-auto size-4" />
      </Menu.SubmenuTrigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} alignOffset={-12}>
          <Menu.Popup className="mt-2 max-h-67.25 w-52 origin-(--transform-origin) overflow-hidden rounded-xl bg-zinc-800 p-1 text-sm/6 text-white transition duration-100 ease-in [--anchor-gap:--spacing(1)] focus:outline-none data-leave:data-closed:opacity-0">
            <Input
              placeholder={t`Find a playlist...`}
              className="h-9 w-full rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-2 focus:-outline-offset-2 focus:outline-white/25 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Escape") {
                  e.stopPropagation();
                }
              }}
            />
            <OktoMenuButton
              type="button"
              label={t`New playlist`}
              onClick={() => {
                setDialogPlaylistOpen(true);
              }}
              icon={<LuPlus className="size-4" />}
            />
            <OktoMenuSeparator />
            <ScrollArea.Root className={"max-h-45 w-auto"}>
              <ScrollArea.Viewport className="h-full">
                <ScrollArea.Content>
                  {loading && <div>Loading...</div>}
                  {error && <div>Error loading playlists</div>}
                  {data &&
                    data.searchMyPlaylists.map((playlist) => (
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
