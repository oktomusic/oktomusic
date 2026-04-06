import { useQuery } from "@apollo/client/react";
import { useParams } from "react-router";
import { t } from "@lingui/core/macro";
import { LuPen, LuShare } from "react-icons/lu";

import { PlaylistVisibility } from "../../api/graphql/gql/graphql";
import { ME_QUERY } from "../../api/graphql/queries/me";
import { USER_PROFILE_QUERY } from "../../api/graphql/queries/userProfile";
import { GenericLoading } from "./GenericLoading";
import { GenericGraphQLError } from "./GenericGraphQLError";
import { PlaylistCardList } from "../../components/Base/PlaylistCardList";
import { CollectionView } from "../../components/CollectionView/CollectionView";
import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import { useShare } from "../../hooks/use_share";
import { CollectionViewToolbarUser } from "../../components/CollectionView/CollectionViewToolbarUser";
import { OktoMenuItem } from "../../components/Base/OktoMenu";

export function User() {
  const { cuid } = useParams();

  const { data, loading, error } = useQuery(USER_PROFILE_QUERY, {
    variables: {
      userId: cuid!,
    },
    skip: !cuid,
  });

  const { data: meData } = useQuery(ME_QUERY);

  const share = useShare(
    data ? `${window.location.origin}/user/${data.userProfile.id}` : undefined,
    data?.userProfile.username || undefined,
  );

  if (!cuid) {
    return null;
  }

  if (loading) {
    return <GenericLoading />;
  }

  if (error) {
    return <GenericGraphQLError error={error} />;
  }

  const playlists = data?.userProfile.playlists ?? [];
  const isOwnProfile = meData?.me.id === data?.userProfile.id;

  const publicPlaylists = playlists.filter(
    (playlist) => playlist.visibility === PlaylistVisibility.Public,
  );

  const privateAndUnlistedPlaylists = playlists.filter(
    (playlist) =>
      playlist.visibility === PlaylistVisibility.Private ||
      playlist.visibility === PlaylistVisibility.Unlisted,
  );

  return (
    <CollectionView
      type={t`Profile`}
      title={data!.userProfile.username}
      cover={coverPlaceHolder}
      toolbar={
        <CollectionViewToolbarUser
          username={data!.userProfile.username}
          menuItems={[
            ...(isOwnProfile
              ? ([
                  {
                    type: "router-link",
                    label: t`Edit profile`,
                    icon: <LuPen className="size-4" />,
                    to: "/settings/account",
                  },
                ] as const satisfies readonly OktoMenuItem[])
              : []),
            {
              type: "button",
              label: t`Share`,
              icon: <LuShare className="size-4" />,
              onClick: share,
            },
          ]}
        />
      }
    >
      <div className="flex w-full flex-col gap-10 p-6">
        <section aria-label={t`Public playlists`} className="space-y-4">
          <h2 className="text-2xl font-bold">{t`Public playlists`}</h2>
          {publicPlaylists.length === 0 ? (
            <div className="p-6">{t`No public playlists found`}</div>
          ) : (
            <PlaylistCardList playlists={publicPlaylists} />
          )}
        </section>

        {isOwnProfile ? (
          <section aria-label={t`Private and unlisted playlists`}>
            <h2 className="pb-4 text-2xl font-bold">
              {t`Private and unlisted playlists`}
            </h2>
            {privateAndUnlistedPlaylists.length === 0 ? (
              <div className="p-6">{t`No private or unlisted playlists found`}</div>
            ) : (
              <PlaylistCardList playlists={privateAndUnlistedPlaylists} />
            )}
          </section>
        ) : null}
      </div>
    </CollectionView>
  );
}
