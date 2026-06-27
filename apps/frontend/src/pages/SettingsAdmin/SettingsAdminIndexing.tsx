import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useSubscription } from "@apollo/client/react";
import {
  LuCircleCheck,
  LuCircleX,
  LuClock3,
  LuInfo,
  LuPlay,
  LuRefreshCw,
  LuTriangleAlert,
} from "react-icons/lu";

import { TRIGGER_INDEXING_MUTATION } from "../../api/graphql/mutations/triggerIndexing";
import { INDEXING_OVERVIEW_QUERY } from "../../api/graphql/queries/indexingOverview";
import { INDEXING_JOB_UPDATED_SUBSCRIPTION } from "../../api/graphql/subscriptions/indexingJobUpdated";
import {
  IndexingJobStatus,
  IndexingProgressStepStatus,
  IndexingReportLevel,
  type IndexingJobUpdatedSubscription,
  type IndexingOverviewQuery,
  type TriggerIndexingMutation,
} from "../../api/graphql/gql/graphql";
import { OktoButton } from "../../components/Base/OktoButton";
import { OktoProgress } from "../../components/Base/OktoProgress";
import { OktoScrollArea } from "../../components/Base/OktoScrollArea";

type OverviewJob = NonNullable<
  IndexingOverviewQuery["indexingOverview"]["latestJob"]
>;
type TriggeredJob = TriggerIndexingMutation["triggerIndexing"];
type SubscriptionJob = IndexingJobUpdatedSubscription["indexingJobUpdated"];
type IndexingJobSnapshot = OverviewJob | TriggeredJob | SubscriptionJob;
type IndexingProgressStep = IndexingJobSnapshot["steps"][number];
type IndexingReport = IndexingJobSnapshot["reports"][number];

const numberFormatter = new Intl.NumberFormat();

function isRunningStatus(status?: IndexingJobStatus): boolean {
  return (
    status === IndexingJobStatus.Active || status === IndexingJobStatus.Queued
  );
}

function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) {
    return "Never";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

function formatTime(value: Date | string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString();
}

const FORMAT_ENUM_REGEX = /^\w/;

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(FORMAT_ENUM_REGEX, (letter) => letter.toUpperCase());
}

function getStatusClass(status?: IndexingJobStatus): string {
  switch (status) {
    case IndexingJobStatus.Active:
      return "border-blue-400/40 bg-blue-400/10 text-blue-200";
    case IndexingJobStatus.Queued:
      return "border-sky-400/40 bg-sky-400/10 text-sky-200";
    case IndexingJobStatus.Completed:
      return "border-green-400/40 bg-green-400/10 text-green-200";
    case IndexingJobStatus.Failed:
      return "border-red-400/40 bg-red-400/10 text-red-200";
    default:
      return "border-zinc-600 bg-zinc-700 text-zinc-200";
  }
}

function getStatusIcon(status?: IndexingJobStatus) {
  switch (status) {
    case IndexingJobStatus.Completed:
      return <LuCircleCheck className="size-4" />;
    case IndexingJobStatus.Failed:
      return <LuCircleX className="size-4" />;
    case IndexingJobStatus.Active:
      return <LuRefreshCw className="size-4" />;
    default:
      return <LuClock3 className="size-4" />;
  }
}

function getStepProgress(step: IndexingProgressStep): {
  readonly value: number;
  readonly max: number;
  readonly valueLabel: string;
} {
  const total = step.total ?? null;
  const current = step.current ?? 0;

  if (total === null) {
    if (
      step.status === IndexingProgressStepStatus.Completed ||
      step.status === IndexingProgressStepStatus.Skipped
    ) {
      return { value: 1, max: 1, valueLabel: formatEnumLabel(step.status) };
    }

    return { value: 0, max: 1, valueLabel: formatEnumLabel(step.status) };
  }

  if (total === 0) {
    return {
      value:
        step.status === IndexingProgressStepStatus.Completed ||
        step.status === IndexingProgressStepStatus.Skipped
          ? 1
          : 0,
      max: 1,
      valueLabel: "0 / 0",
    };
  }

  return {
    value: Math.min(current, total),
    max: total,
    valueLabel: `${numberFormatter.format(current)} / ${numberFormatter.format(total)}`,
  };
}

function getStepClass(status: IndexingProgressStepStatus): string {
  switch (status) {
    case IndexingProgressStepStatus.Completed:
      return "border-green-400/30 bg-green-400/5";
    case IndexingProgressStepStatus.Running:
      return "border-blue-400/30 bg-blue-400/5";
    case IndexingProgressStepStatus.Failed:
      return "border-red-400/30 bg-red-400/5";
    case IndexingProgressStepStatus.Skipped:
      return "border-zinc-500/40 bg-zinc-700/30";
    case IndexingProgressStepStatus.Pending:
      return "border-zinc-700 bg-zinc-900/20";
  }
}

function getReportClass(level: IndexingReportLevel): string {
  switch (level) {
    case IndexingReportLevel.Error:
      return "border-red-500/50 bg-red-500/10 text-red-100";
    case IndexingReportLevel.Warning:
      return "border-yellow-500/50 bg-yellow-500/10 text-yellow-100";
    case IndexingReportLevel.Info:
      return "border-blue-500/40 bg-blue-500/10 text-blue-100";
  }
}

function getReportIcon(level: IndexingReportLevel) {
  switch (level) {
    case IndexingReportLevel.Error:
      return <LuCircleX className="mt-0.5 size-4 shrink-0 text-red-300" />;
    case IndexingReportLevel.Warning:
      return (
        <LuTriangleAlert className="mt-0.5 size-4 shrink-0 text-yellow-300" />
      );
    case IndexingReportLevel.Info:
      return <LuInfo className="mt-0.5 size-4 shrink-0 text-blue-300" />;
  }
}

function IndexingReportItem(props: { readonly report: IndexingReport }) {
  const report = props.report;

  return (
    <li
      className={`rounded-lg border p-3 text-sm ${getReportClass(report.level)}`}
    >
      <div className="flex items-start gap-2">
        {getReportIcon(report.level)}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">
              {formatEnumLabel(report.level)}
            </span>
            <span className="text-xs text-zinc-300">
              {formatEnumLabel(report.type)}
            </span>
            <span className="ml-auto text-xs text-zinc-400">
              {formatTime(report.emittedAt)}
            </span>
          </div>
          <p className="mt-1 wrap-break-word">{report.message}</p>
          {report.path ? (
            <p className="mt-1 font-mono text-xs break-all text-zinc-300">
              {report.path}
            </p>
          ) : null}
          {report.details && report.details.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1 text-xs text-zinc-300">
              {report.details.map((detail) => (
                <li key={`${report.id}:${detail}`} className="wrap-break-word">
                  {detail}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </li>
  );
}

interface IndexingStepItemProps {
  readonly step: IndexingProgressStep;
}

function IndexingStepItem(props: IndexingStepItemProps) {
  const step = props.step;
  const progress = getStepProgress(step);

  return (
    <li className={`rounded-lg border p-3 ${getStepClass(step.status)}`}>
      <OktoProgress
        value={progress.value}
        min={0}
        max={progress.max}
        label={step.label}
        valueLabel={progress.valueLabel}
        className="w-full"
      />
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
        <span>{formatEnumLabel(step.status)}</span>
        {step.detail ? <span className="break-all">{step.detail}</span> : null}
      </div>
    </li>
  );
}

export function SettingsAdminIndexing() {
  const [liveJobSnapshot, setLiveJobSnapshot] =
    useState<IndexingJobSnapshot | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: overviewData,
    loading: overviewLoading,
    refetch: refetchOverview,
  } = useQuery(INDEXING_OVERVIEW_QUERY);
  const [triggerIndexing, { loading: triggerLoading }] = useMutation(
    TRIGGER_INDEXING_MUTATION,
  );

  const overviewJobSnapshot = overviewData?.indexingOverview.latestJob ?? null;
  const jobSnapshot = useMemo(() => {
    if (!liveJobSnapshot) {
      return overviewJobSnapshot;
    }

    if (!overviewJobSnapshot) {
      return liveJobSnapshot;
    }

    if (liveJobSnapshot.jobId === overviewJobSnapshot.jobId) {
      return liveJobSnapshot;
    }

    if (isRunningStatus(liveJobSnapshot.status)) {
      return liveJobSnapshot;
    }

    return overviewJobSnapshot;
  }, [liveJobSnapshot, overviewJobSnapshot]);

  const isRunning = isRunningStatus(jobSnapshot?.status);

  useSubscription(INDEXING_JOB_UPDATED_SUBSCRIPTION, {
    variables: { jobId: jobSnapshot?.jobId ?? "" },
    skip: !jobSnapshot?.jobId || !isRunning,
    onData: ({ data }) => {
      const payload = data.data?.indexingJobUpdated;

      if (!payload) {
        return;
      }

      setLiveJobSnapshot(payload);

      if (!isRunningStatus(payload.status)) {
        void refetchOverview();
      }
    },
  });

  useEffect(() => {
    if (!isRunning || !jobSnapshot?.jobId) {
      return;
    }

    let cancelled = false;
    const refreshCurrentJob = () => {
      void refetchOverview()
        .then((result) => {
          const latestJob = result.data?.indexingOverview.latestJob;

          if (
            cancelled ||
            !latestJob ||
            latestJob.jobId !== jobSnapshot.jobId
          ) {
            return;
          }

          setLiveJobSnapshot(latestJob);
        })
        .catch(() => {
          // Subscription remains the primary path; polling errors should not
          // replace the visible job state.
        });
    };

    const initialTimeout = window.setTimeout(refreshCurrentJob, 350);
    const interval = window.setInterval(refreshCurrentJob, 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimeout);
      window.clearInterval(interval);
    };
  }, [isRunning, jobSnapshot?.jobId, refetchOverview]);

  const libraryStats = overviewData?.indexingOverview.libraryStats;
  const statItems = useMemo<ReadonlyArray<readonly [string, number]>>(
    () =>
      libraryStats
        ? [
            ["Tracks", libraryStats.tracksCount],
            ["Albums", libraryStats.albumsCount],
            ["Artists", libraryStats.artistsCount],
            ["FLAC files", libraryStats.flacFilesCount],
            ["Lyrics", libraryStats.tracksWithLyricsCount],
            ["Playlists", libraryStats.playlistsCount],
            ["Users", libraryStats.usersCount],
            ["Saved items", libraryStats.savedLibraryItemsCount],
          ]
        : [],
    [libraryStats],
  );

  const handleTriggerIndexing = async () => {
    setActionError(null);

    try {
      const result = await triggerIndexing();
      const nextJob = result.data?.triggerIndexing;

      if (nextJob) {
        setLiveJobSnapshot(nextJob);
      }

      void refetchOverview();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to trigger indexing",
      );
    }
  };

  return (
    <section
      className="mb-8 flex w-full flex-col gap-4 rounded-lg bg-zinc-800 px-4 pt-4 pb-8"
      role="region"
      aria-label="Library Indexing"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">Library Indexing</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Library refreshed {formatDateTime(libraryStats?.generatedAt)}
          </p>
        </div>
        <OktoButton
          type="button"
          onClick={() => {
            void handleTriggerIndexing();
          }}
          disabled={overviewLoading || triggerLoading || isRunning}
          className="inline-flex items-center gap-2 border border-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {triggerLoading ? (
            <LuRefreshCw className="size-4" />
          ) : (
            <LuPlay className="size-4" />
          )}
          {triggerLoading ? "Triggering..." : "Trigger Indexing"}
        </OktoButton>
      </div>

      {actionError ? (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-100">
          {actionError}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {statItems.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-zinc-700 p-3">
            <div className="text-xs text-zinc-400">{label}</div>
            <div className="mt-1 text-lg font-semibold text-white">
              {numberFormatter.format(value)}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-700 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm ${getStatusClass(jobSnapshot?.status)}`}
          >
            {getStatusIcon(jobSnapshot?.status)}
            {jobSnapshot?.status
              ? formatEnumLabel(jobSnapshot.status)
              : "No indexing job"}
          </span>
          {jobSnapshot?.jobId ? (
            <span className="font-mono text-xs text-zinc-400">
              {jobSnapshot.jobId}
            </span>
          ) : null}
          {jobSnapshot?.completedAt ? (
            <span className="text-xs text-zinc-400">
              Completed {formatDateTime(jobSnapshot.completedAt)}
            </span>
          ) : null}
        </div>
        {jobSnapshot?.error ? (
          <p className="mt-2 text-sm text-red-300">{jobSnapshot.error}</p>
        ) : null}
      </div>

      <ul className="grid gap-3">
        {jobSnapshot?.steps.map((step) => (
          <IndexingStepItem key={step.key} step={step} />
        ))}
      </ul>

      <OktoScrollArea className="h-96 max-h-96 w-full flex-1 rounded-lg border border-zinc-700">
        <ul className="flex w-full flex-1 flex-col gap-2 px-4 py-4">
          {jobSnapshot?.reports.length ? (
            jobSnapshot.reports.map((report) => (
              <IndexingReportItem key={report.id} report={report} />
            ))
          ) : (
            <li className="rounded-lg border border-zinc-700 p-3 text-sm text-zinc-400">
              No indexing reports yet.
            </li>
          )}
        </ul>
      </OktoScrollArea>
    </section>
  );
}
