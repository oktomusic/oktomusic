import type { ChangeEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { t } from "@lingui/core/macro";
import { LuSearch, LuFolder } from "react-icons/lu";

import { OktoInput } from "./Base/OktoInput";

export function HeaderMenuSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") || "";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    setSearchParams(params);
  };

  return (
    <div className="relative ml-32 w-96">
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
        className="absolute top-1/2 right-2 -translate-y-1/2 text-zinc-400 hover:text-white"
        aria-label="Go to search"
      >
        <LuFolder className="size-5" />
      </Link>
    </div>
  );
}
