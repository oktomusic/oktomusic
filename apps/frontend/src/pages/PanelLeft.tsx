import { useAtom } from "jotai";
import {
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from "react-icons/hi2";

import { panelLeftExpandedAtom } from "../atoms/app/panels";

export function PanelLeft() {
  const [expanded, setExpanded] = useAtom(panelLeftExpandedAtom);

  return (
    <nav
      id="oktomusic:panel-left"
      className="flex flex-col overflow-hidden rounded bg-blue-950/40"
      aria-label="Library"
    >
      <div className="flex items-center justify-end p-2">
        <button
          type="button"
          onClick={() => {
            setExpanded((prev) => !prev);
          }}
          aria-label={expanded ? "Collapse library" : "Expand library"}
          title={expanded ? "Collapse library" : "Expand library"}
          className="rounded p-1 hover:bg-white/10 focus-visible:outline-offset-2"
        >
          {expanded ? (
            <HiOutlineChevronDoubleLeft className="size-5" />
          ) : (
            <HiOutlineChevronDoubleRight className="size-5" />
          )}
        </button>
      </div>
      {expanded && (
        <div className="flex-1 px-2">
          <p className="text-sm text-white/50">Library</p>
        </div>
      )}
    </nav>
  );
}
