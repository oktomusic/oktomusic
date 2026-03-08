import { useAtom } from "jotai";
import { Link } from "react-router";
import { Button } from "@headlessui/react";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";

import { panelLeftExpandedAtom } from "../atoms/app/panels";
import {
  LibraryRow,
  LibraryRowAlbum,
} from "../components/LibraryRow/LibraryRow";

const tempAlbumIds = [
  "lf9mqe3tcy3of7nwl9ibvrh1",
  "bm6ufc7gv7pxft0a8bxi910z",
  "xbarxqzurmczwyovxi5eurju",
  "ddkv8d75ztunzb0h79o11kva",
  "t5ecii5gpuzre5mef3gdr8l7",
  "lafto992msn9s8cr42sst2cl",
  "lf9mqe3tcy3of7nwl9ibvrh1",
  "bm6ufc7gv7pxft0a8bxi910z",
  "xbarxqzurmczwyovxi5eurju",
  "ddkv8d75ztunzb0h79o11kva",
  "t5ecii5gpuzre5mef3gdr8l7",
  "lafto992msn9s8cr42sst2cl",
  "lf9mqe3tcy3of7nwl9ibvrh1",
  "bm6ufc7gv7pxft0a8bxi910z",
  "xbarxqzurmczwyovxi5eurju",
  "ddkv8d75ztunzb0h79o11kva",
  "t5ecii5gpuzre5mef3gdr8l7",
  "lafto992msn9s8cr42sst2cl",
] as const;

const tempAlbums: LibraryRowAlbum[] = tempAlbumIds.map((id) => ({
  id,
  name: id,
  artists: [{ id: "aaa", name: "Artist" }],
}));

export function PanelLeft() {
  const [expanded, setExpanded] = useAtom(panelLeftExpandedAtom);

  return (
    <nav
      id="oktomusic:panel-left"
      className="flex flex-col overflow-hidden rounded bg-zinc-900"
      aria-label="Library"
    >
      <div className="flex items-center justify-end p-2">
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
      </div>
      {expanded ? (
        <ul className="flex w-full flex-1 flex-col overflow-y-auto px-2 pb-2">
          {tempAlbums.map((album, index) => (
            <LibraryRow key={index} type="album" album={album} />
          ))}
        </ul>
      ) : (
        <div className="scrollbar-hidden flex flex-1 flex-col items-center pb-2 align-middle select-none">
          {tempAlbumIds.map((id, index) => (
            <Link
              key={index}
              to={`/album/${id}`}
              className="size-16 rounded py-2 hover:bg-white/10"
            >
              <img
                src={`/api/album/${id}/cover/96`}
                alt={id}
                loading="lazy"
                fetchPriority="low"
                className="mx-auto size-12 rounded"
              />
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
