import { Button } from "@headlessui/react";
import { t } from "@lingui/core/macro";
import { LuCircleArrowDown, LuCirclePlus } from "react-icons/lu";
import { OktoMenu, OktoMenuItem } from "../Base/OktoMenu";
import { HiEllipsisHorizontal } from "react-icons/hi2";

interface CollectionViewToolbarAlbumProps {
  readonly albumName: string;
  readonly menuItems: readonly OktoMenuItem[];
}

export function CollectionViewToolbarAlbum(
  props: CollectionViewToolbarAlbumProps,
) {
  const albumName = props.albumName;

  return (
    <>
      <Button
        className="size-8"
        title={t`Save to library`}
        onClick={undefined /* TODO */}
      >
        <LuCirclePlus className="m-auto size-8" />
      </Button>
      <Button
        className="size-8"
        title={t`Download`}
        onClick={undefined /* TODO */}
      >
        <LuCircleArrowDown className="m-auto size-8" />
      </Button>
      <OktoMenu
        button={<HiEllipsisHorizontal className="size-8" />}
        items={props.menuItems}
        positionAlign="start"
        positionSide="bottom"
        buttonAriaLabel={t`More options for ${albumName}`}
      />
    </>
  );
}
