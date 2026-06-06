import type { ChangeEvent } from "react";
import { t } from "@lingui/core/macro";
import { LuFolder, LuSearch } from "react-icons/lu";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";

import { OktoInput } from "./Base/OktoInput";

export function HeaderMenuSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isSearchRoute = location.pathname === "/search";
  const q = isSearchRoute ? searchParams.get("q") || "" : "";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const params = isSearchRoute
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams();

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    const search = params.toString();
    const nextPath = search ? `/search?${search}` : "/search";

    if (isSearchRoute) {
      setSearchParams(params, { replace: true });
    } else {
      void navigate(nextPath, { replace: false });
    }
  };

  return (
    <div className="relative ml-8 w-72">
      <div className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-zinc-400">
        <LuSearch className="size-5" />
      </div>
      <OktoInput
        className="h-10 w-full pr-9 pl-9"
        placeholder={t`Search`}
        value={q}
        onChange={handleChange}
        aria-label={t`Search`}
      />

      <Link
        to="/search"
        className="absolute top-1/2 right-2 -translate-y-1/2 text-zinc-400 hover:text-white focus:text-white focus:outline-0"
        aria-label={t`Browse`}
      >
        <LuFolder className="size-5" />
      </Link>
    </div>
  );
}
