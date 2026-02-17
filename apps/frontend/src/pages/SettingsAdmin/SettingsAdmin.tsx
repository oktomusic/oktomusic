import { t } from "@lingui/core/macro";
import { OktoButton } from "../../components/Base/OktoButton";

function IndexingReportItem() {
  return (
    <li className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-2">
      <h4 className="text-yellow-500">WARNING</h4>
    </li>
  );
}

export function SettingsAdmin() {
  // const isIndexing = false;

  return (
    <div className="flex min-h-full w-full flex-row justify-center">
      <div className="w-4xl p-8">
        <h2 className="mb-8 text-3xl font-bold">{t`Admin Settings`}</h2>
        <div className="flex w-full flex-col gap-4 rounded-lg bg-zinc-800 p-4">
          <div className="flex flex-row justify-between">
            <h3 className="text-xl font-semibold text-white">
              Library Indexing
            </h3>
            <OktoButton>Index Library</OktoButton>
          </div>
          <div className="flex h-96 max-h-96 w-full flex-1 rounded-lg border border-zinc-700">
            <ul className="flex w-full flex-1 flex-col gap-2 overflow-auto px-4 py-4">
              {[
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                19, 20,
              ].map((i) => (
                <IndexingReportItem key={i} />
              ))}
            </ul>
          </div>
          <div className="flex rounded-lg border border-zinc-700 p-4">AAA</div>
        </div>
      </div>
    </div>
  );
}
