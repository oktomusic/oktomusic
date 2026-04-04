import { HiEllipsisHorizontal } from "react-icons/hi2";
import { t } from "@lingui/core/macro";

import { OktoMenu, OktoMenuItem } from "../Base/OktoMenu";

interface CollectionViewToolbarUserProps {
  readonly username: string;
  readonly menuItems: readonly OktoMenuItem[];
}

export function CollectionViewToolbarUser(
  props: CollectionViewToolbarUserProps,
) {
  const albumName = props.username;

  return (
    <>
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
