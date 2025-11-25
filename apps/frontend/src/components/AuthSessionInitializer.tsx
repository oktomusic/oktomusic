import { useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { useSetAtom } from "jotai";

import { authSessionAtom } from "../atoms/auth/atoms";
import { ME_QUERY } from "../api/graphql/queries/me";

export default function AuthSessionInitializer() {
  const setAuthSession = useSetAtom(authSessionAtom);
  const { data, loading, error } = useQuery(ME_QUERY, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  useEffect(() => {
    if (loading) {
      setAuthSession({ status: "unknown", user: null });
      return;
    }

    if (data?.me) {
      setAuthSession({ status: "authenticated", user: data.me });
      return;
    }

    setAuthSession({ status: "unauthenticated", user: null });
  }, [data, error, loading, setAuthSession]);

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch current user", error);
    }
  }, [error]);

  return null;
}
