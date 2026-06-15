import { useAtomValue } from "jotai";
import { Link } from "react-router";
import { useQuery } from "@apollo/client/react";

import { authSessionAtom } from "../../atoms/auth/atoms";
import { ME_QUERY } from "../../api/graphql/queries/me";
import { Role } from "../../api/graphql/gql/graphql";
import { IndexingControl } from "../../components/IndexingControl/IndexingControl";

export function Home() {
  const authSession = useAtomValue(authSessionAtom);

  const { data: userData } = useQuery(ME_QUERY, {
    skip: authSession.status !== "authenticated",
  });

  const isAdmin = userData?.me?.role === Role.Admin;

  if (authSession.status !== "authenticated" || !authSession.user) {
    return null;
  }

  return (
    <>
      <div className="card">
        <div className="m-4 flex flex-col gap-2">
          <div>
            <p className="text-green-600">
              ✓ Logged in as {authSession.user.username}
            </p>
          </div>
          <div>
            <Link to="/appinfo">App Info</Link>
          </div>
          {isAdmin && (
            <div className="mt-4">
              <IndexingControl />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
