import { useQuery } from "@apollo/client/react";
import { useAtom, useSetAtom } from "jotai";
import { Link } from "react-router";
import { Button } from "@base-ui/react/button";
import { useLingui } from "@lingui/react/macro";
import { LuPanelLeftClose, LuPanelLeftOpen, LuPlus } from "react-icons/lu";

import { MY_LIBRARY_QUERY } from "../api/graphql/queries/myLibrary";
import { panelLeftExpandedAtom } from "../atoms/app/panels";
import { dialogPlaylistOpenAtom } from "../atoms/app/dialogs";
import coverPlaceHolder from "../assets/pip-cover-placeholder.svg";
import { Cover } from "../components/Base/Cover";
import { getCoverImagesFromAlbumIds } from "../components/Base/CoverImages";
import { OktoScrollArea } from "../components/Base/OktoScrollArea";
import { LibraryRow } from "../components/LibraryRow/LibraryRow";
import { OktoButton } from "../components/Base/OktoButton";

export function PanelLeft() {
  const { t } = useLingui();
  const [expanded, setExpanded] = useAtom(panelLeftExpandedAtom);
  const { data, loading, error } = useQuery(MY_LIBRARY_QUERY);
  const libraryItems = data?.myLibrary.items ?? [];

  const setOpen = useSetAtom(dialogPlaylistOpenAtom);

  return (
    <nav
      id="oktomusic:panel-left"
      className="flex flex-col overflow-hidden rounded bg-zinc-900"
      aria-label="Library"
    >
      <div className="flex items-center px-2 pt-2">
        <Button
          type="button"
          onClick={() => {
            setExpanded((prev) => !prev);
          }}
          aria-label={expanded ? "Collapse library" : "Expand library"}
          title={expanded ? "Collapse library" : "Expand library"}
          className="flex size-16 items-center justify-center rounded text-zinc-400 hover:text-zinc-300"
        >
          {expanded ? (
            <LuPanelLeftClose className="size-6" />
          ) : (
            <LuPanelLeftOpen className="size-6" />
          )}
        </Button>
        {expanded ? (
          <OktoButton
            className="mr-2.5 ml-auto flex h-9 flex-row items-center gap-1 rounded-full!"
            title={t`Create a playlist`}
            onClick={() => setOpen(true)}
          >
            <LuPlus className="size-5" />
            {t`Create`}
          </OktoButton>
        ) : null}
      </div>
      {!expanded && (
        <div className="flex h-16 w-20 items-center justify-center px-2">
          <OktoButton
            className="mx-auto flex size-9 items-center justify-center rounded-full! p-0!"
            title={t`Create a playlist`}
            onClick={() => setOpen(true)}
          >
            <LuPlus className="size-5" />
          </OktoButton>
        </div>
      )}
      {expanded ? (
        <OktoScrollArea
          render={<ul />}
          className="w-full flex-1 px-2 pb-2"
          noMargin={true}
        >
          {loading && libraryItems.length === 0 && (
            <li className="px-3 py-2 text-sm text-zinc-400">
              {t`Loading library`}
            </li>
          )}
          {error && libraryItems.length === 0 && (
            <li className="px-3 py-2 text-sm text-red-300">
              {t`Could not load library`}
            </li>
          )}
          {!loading && !error && libraryItems.length === 0 && (
            <li className="px-3 py-2 text-sm text-zinc-400">
              {t`Your library is empty`}
            </li>
          )}
          {libraryItems.map((entry) => {
            if (entry.item.__typename === "AlbumBasic") {
              return (
                <LibraryRow
                  key={entry.id}
                  type="album"
                  album={{
                    id: entry.item.id,
                    name: entry.item.name,
                    artists: entry.item.artists,
                  }}
                />
              );
            }

            return (
              <LibraryRow
                key={entry.id}
                type="playlist"
                playlist={{
                  id: entry.item.id,
                  name: entry.item.name,
                  author: entry.item.creator,
                  coverAlbumIds: entry.item.coverAlbumIds,
                }}
              />
            );
          })}
        </OktoScrollArea>
      ) : (
        <OktoScrollArea className="flex-1 pb-2 select-none" noMargin={true}>
          <div className="flex flex-col items-center align-middle">
            {libraryItems.map((entry) => {
              const title = entry.item.name;
              const link =
                entry.item.__typename === "AlbumBasic"
                  ? `/album/${entry.item.id}`
                  : `/playlist/${entry.item.id}`;
              const cover =
                entry.item.__typename === "AlbumBasic"
                  ? ([entry.item.id] as const)
                  : getCoverImagesFromAlbumIds(
                      entry.item.coverAlbumIds,
                      coverPlaceHolder,
                    );

              return (
                <Link
                  key={entry.id}
                  to={link}
                  className="size-16 rounded py-2 hover:bg-white/10"
                  aria-label={title}
                  title={title}
                >
                  <Cover
                    imgs={cover}
                    size={96}
                    alt={`${title} cover`}
                    loading="lazy"
                    fetchPriority="low"
                    className="mx-auto size-12 rounded"
                  />
                </Link>
              );
            })}
          </div>
        </OktoScrollArea>
      )}
    </nav>
  );
}
