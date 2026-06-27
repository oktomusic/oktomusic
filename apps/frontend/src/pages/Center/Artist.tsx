import { useParams } from "react-router";
import { useQuery } from "@apollo/client/react";
import { useLingui } from "@lingui/react/macro";
import { LuShare } from "react-icons/lu";

import { GenericLoading } from "./GenericLoading";
import { GenericGraphQLError } from "./GenericGraphQLError";
import { ARTIST_QUERY } from "../../api/graphql/queries/artist";
import { AlbumCardList } from "../../components/Base/AlbumCardList";
import { CollectionView } from "../../components/CollectionView/CollectionView";
import { CollectionViewToolbarUser } from "../../components/CollectionView/CollectionViewToolbarUser";
import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import { useShare } from "../../hooks/use_share";

export function Artist() {
  const { cuid } = useParams();
  const { t } = useLingui();

  const { data, loading, error } = useQuery(ARTIST_QUERY, {
    variables: {
      id: cuid ?? "",
    },
    skip: !cuid,
  });

  const share = useShare(
    data ? `${window.location.origin}/artist/${data.artist.id}` : undefined,
    data?.artist.name,
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

  const artist = data?.artist;
  const artistName = artist?.name ?? "";
  const albums = artist?.albums ?? [];
  const featuredOnAlbums = artist?.featuredOnAlbums ?? [];

  return (
    <CollectionView
      type={t`Artist`}
      title={artistName}
      cover={coverPlaceHolder}
      toolbar={
        <CollectionViewToolbarUser
          username={artistName}
          menuItems={[
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
        {albums.length === 0 && featuredOnAlbums.length === 0 && (
          <p className="text-center text-lg text-neutral-500">
            {t`No albums found for this artist.`}
          </p>
        )}
        {albums.length > 0 && (
          <section aria-label={t`Albums`} className="space-y-4">
            <h2 className="text-2xl font-bold">{t`Albums`}</h2>
            <AlbumCardList albums={albums} />
          </section>
        )}
        {featuredOnAlbums.length > 0 && (
          <section aria-label={t`Appears on`} className="space-y-4">
            <h2 className="text-2xl font-bold">{t`Appears on`}</h2>
            <AlbumCardList albums={featuredOnAlbums} />
          </section>
        )}
      </div>
    </CollectionView>
  );
}
