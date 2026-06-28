import { useAtomValue } from "jotai";
import { Link } from "react-router";
import { LuSearch, LuSettings } from "react-icons/lu";

import { authSessionAtom } from "../../atoms/auth/atoms";

export function Home() {
  const authSession = useAtomValue(authSessionAtom);

  if (authSession.status !== "authenticated" || !authSession.user) {
    return null;
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="m-4 flex flex-col justify-center gap-2">
        <h2 className="mb-8 text-center text-3xl font-bold">
          {document.title}
        </h2>

        <Link
          className="flex w-72 cursor-pointer flex-row items-center gap-2 rounded-full bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/25"
          to="/search"
        >
          <LuSearch className="mr-2 inline-block h-6 w-6" />
          <span>Search</span>
        </Link>

        <Link
          className="flex w-72 cursor-pointer flex-row items-center gap-2 rounded-full bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/25"
          to="/settings/client"
        >
          <LuSettings className="mr-2 inline-block h-6 w-6" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}
