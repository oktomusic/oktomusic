import { useAtomValue } from "jotai";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "../../api/graphql/queries/me.ts";
import { networkStatusAtom } from "../../atoms/app/atoms";

function AppInfo() {
  const isOnline = useAtomValue(networkStatusAtom);

  const { data, loading, error } = useQuery(ME_QUERY, {
    fetchPolicy: "no-cache",
  });

  return (
    <div>
      <ul>
        <li>
          <strong>Network Status:</strong> {isOnline ? "Online" : "Offline"}
        </li>
      </ul>
      <div
        style={{
          alignItems: "start",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading
          ? "Loading..."
          : error
            ? `Error: ${error.message}`
            : data && (
                <>
                  <div>
                    <strong>ID:</strong> {data.me.id}
                  </div>
                  <div>
                    <strong>Username:</strong> {data.me.username}
                  </div>
                  <div>
                    <strong>Role:</strong> {data.me.role}
                  </div>
                </>
              )}
      </div>
    </div>
  );
}

export default AppInfo;
