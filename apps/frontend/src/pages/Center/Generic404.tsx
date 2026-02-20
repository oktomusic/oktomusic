import { Link } from "react-router";
import { t } from "@lingui/core/macro";

export function Generic404() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <span className="text-4xl font-bold">{t`Page not found`}</span>
      <Link
        to="/"
        className="flex h-12 w-32 items-center justify-center rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-bold hover:bg-zinc-700 focus:bg-zinc-700"
      >
        {t`Home`}
      </Link>
    </div>
  );
}
