import { LuEllipsis } from "react-icons/lu";
import { useLingui } from "@lingui/react/macro";

import { OktoMenu, OktoMenuItem } from "../Base/OktoMenu";

interface CollectionViewToolbarUserProps {
  readonly username: string;
  readonly menuItems: readonly OktoMenuItem[];
}

export function CollectionViewToolbarUser(
  props: CollectionViewToolbarUserProps,
) {
  const { t } = useLingui();

  const albumName = props.username;

  return (
    <OktoMenu
      button={<LuEllipsis className="size-8" />}
      items={props.menuItems}
      positionAlign="start"
      positionSide="bottom"
      buttonAriaLabel={t`More options for ${albumName}`}
    />
  );
}
