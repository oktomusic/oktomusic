import { Link } from "react-router";
import { plural, t } from "@lingui/core/macro";
import { LuGlobe, LuLink, LuLock } from "react-icons/lu";
import { DurationLong } from "../DurationLong";

interface CollectionViewUser {
  readonly id: string;
  readonly username: string;
}

interface CollectionViewMetaPlaylistProps {
  readonly visibility: "PRIVATE" | "PUBLIC" | "UNLISTED";
  readonly user: CollectionViewUser;
  readonly tracksTotal: number;
  readonly durationMs: number;
}

export function CollectionViewMetaPlaylist(
  props: CollectionViewMetaPlaylistProps,
) {
  return (
    <div className="flex flex-row items-center text-sm">
      {(() => {
        switch (props.visibility) {
          case "PRIVATE":
            return <LuLock className="mr-2 size-4" title={t`Private`} />;
          case "PUBLIC":
            return <LuGlobe className="mr-2 size-4" title={t`Public`} />;
          case "UNLISTED":
            return <LuLink className="mr-2 size-4" title={t`Unlisted`} />;
        }
      })()}
      <span className="font-bold">
        <span key={props.user.id}>
          <Link to={`/user/${props.user.id}`} className="hover:underline">
            {props.user.username}
          </Link>
        </span>
      </span>
      <span className="mx-2">•</span>
      <span>
        {plural(
          { count: props.tracksTotal },
          {
            one: "# track",
            other: "# tracks",
          },
        )}
      </span>
      <span>,&nbsp;</span>
      <DurationLong durationMs={props.durationMs} />
    </div>
  );
}
