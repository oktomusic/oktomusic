import { useEffect, useState } from "react";
import { OktoButton } from "../../components/Base/OktoButton";
import { OktoProgress } from "../../components/Base/OktoProgress";
import { OktoScrollArea } from "../../components/Base/OktoScrollArea";

function IndexingReportItem() {
  return (
    <li className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-2">
      <h4 className="text-yellow-500">WARNING</h4>
    </li>
  );
}

export function SettingsAdminIndexing() {
  const [value, setValue] = useState(20);

  // Simulate changes
  useEffect(() => {
    const interval = setInterval(() => {
      setValue((current) =>
        Math.min(100, Math.round(current + Math.random() * 25)),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full flex-col gap-4 rounded-lg bg-zinc-800 p-4">
      <div className="flex flex-row justify-between">
        <h3 className="text-xl font-semibold text-white">Library Indexing</h3>
        <OktoButton className="border border-zinc-700">
          Index Library
        </OktoButton>
      </div>
      <div className="flex rounded-lg border border-zinc-700 p-4">
        <OktoProgress
          value={value}
          min={0}
          max={200}
          label="Indexing Progress"
          className="w-full"
        />
      </div>
      <OktoScrollArea className="h-96 max-h-96 w-full flex-1 rounded-lg border border-zinc-700">
        <ul className="flex w-full flex-1 flex-col gap-2 px-4 py-4">
          {[
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20,
          ].map((i) => (
            <IndexingReportItem key={i} />
          ))}
        </ul>
      </OktoScrollArea>
    </div>
  );
}
