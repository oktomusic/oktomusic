import { Button } from "@base-ui/react/button";
import { useLingui } from "@lingui/react/macro";
import {
  LuCircleArrowDown,
  LuCircleCheck,
  LuCirclePlus,
  LuEllipsis,
} from "react-icons/lu";
import { OktoMenu, OktoMenuItem } from "../Base/OktoMenu";

interface CollectionViewToolbarPlaylistProps {
  readonly playlistName: string;
  readonly isInLibrary: boolean;
  readonly libraryActionDisabled?: boolean;
  readonly libraryActionLoading?: boolean;
  readonly onToggleLibrary: () => void;
  readonly menuItems: readonly OktoMenuItem[];
}

export function CollectionViewToolbarPlaylist(
  props: CollectionViewToolbarPlaylistProps,
) {
  const { t } = useLingui();

  const albumName = props.playlistName;
  const LibraryIcon = props.isInLibrary ? LuCircleCheck : LuCirclePlus;
  const disabled =
    props.libraryActionDisabled === true || props.libraryActionLoading === true;
  const title =
    props.libraryActionDisabled === true && props.isInLibrary
      ? t`Already in library`
      : props.isInLibrary
        ? t`Remove from library`
        : t`Save to library`;

  return (
    <>
      <Button
        className={[
          "size-8 disabled:cursor-not-allowed disabled:opacity-60",
          props.isInLibrary ? "text-blue-500 hover:text-blue-400" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        title={title}
        aria-label={t`Save to library`}
        aria-pressed={props.isInLibrary}
        onClick={props.onToggleLibrary}
        disabled={disabled}
      >
        <LibraryIcon className="m-auto size-8" />
      </Button>
      <Button
        className="size-8"
        title={t`Download`}
        onClick={undefined /* TODO */}
      >
        <LuCircleArrowDown className="m-auto size-8" />
      </Button>
      <OktoMenu
        button={<LuEllipsis className="size-8" />}
        items={props.menuItems}
        positionAlign="start"
        positionSide="bottom"
        buttonAriaLabel={t`More options for ${albumName}`}
      />
    </>
  );
}
