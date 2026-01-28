import { useParams } from "react-router";
import { useQuery } from "@apollo/client/react";

import { ALBUM_QUERY } from "../../api/graphql/queries/album";

export default function Album() {
  const { cuid } = useParams();

  const { data, loading, error } = useQuery(ALBUM_QUERY, {
    variables: { id: cuid! },
    skip: !cuid,
  });

  if (!cuid) {
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
