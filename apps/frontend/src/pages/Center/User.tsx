import { useQuery } from "@apollo/client/react";
import { useParams } from "react-router";
import { t } from "@lingui/core/macro";
import { LuShare } from "react-icons/lu";

import { USER_PROFILE_QUERY } from "../../api/graphql/queries/userProfile";
import { GenericLoading } from "./GenericLoading";
import { GenericGraphQLError } from "./GenericGraphQLError";
import { CollectionView } from "../../components/CollectionView/CollectionView";
import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import { useShare } from "../../hooks/use_share";

export function User() {
  const { cuid } = useParams();

  const { data, loading, error } = useQuery(USER_PROFILE_QUERY, {
    variables: {
      userId: cuid!,
    },
    skip: !cuid,
  });

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

  return (
    <CollectionView
      type={t`Profile`}
      title={data!.userProfile.username}
      cover={coverPlaceHolder}
      meta={<></>}
      actions={{
        menuItems: [
          {
            type: "button",
            label: t`Share`,
            icon: <LuShare className="size-4" />,
            onClick: share,
          },
        ],
      }}
    >
      {JSON.stringify(data, undefined, 2)}
    </CollectionView>
  );
}
