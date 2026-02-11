import { useState } from "react";
import { useMutation, useSubscription } from "@apollo/client/react";

import { TRIGGER_INDEXING_MUTATION } from "../../api/graphql/mutations/triggerIndexing";
import { INDEXING_JOB_UPDATED_SUBSCRIPTION } from "../../api/graphql/subscriptions/indexingJobUpdated";
import {
  IndexingJobStatus,
  type IndexingJobUpdatedSubscription,
} from "../../api/graphql/gql/graphql";

export default function IndexingControl() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latestJobStatus, setLatestJobStatus] = useState<
    IndexingJobUpdatedSubscription["indexingJobUpdated"] | null
  >(null);

  const [triggerIndexing, { loading: triggerLoading }] = useMutation(
    TRIGGER_INDEXING_MUTATION,
  );

  useSubscription(INDEXING_JOB_UPDATED_SUBSCRIPTION, {
    variables: { jobId: currentJobId ?? "" },
    skip: !currentJobId,
    onData: ({ data }) => {
      const payload = data.data?.indexingJobUpdated;
      if (payload) {
        setLatestJobStatus(payload);
      }
    },
  });

  // Clear jobId when job completes to allow triggering another
  const handleTriggerIndexing = async () => {
    setError(null);
    setLatestJobStatus(null);
    try {
      const result = await triggerIndexing();
      const jobId = result.data?.triggerIndexing?.jobId;
      if (jobId) {
        setCurrentJobId(jobId);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to trigger indexing",
      );
    }
  };

  const getStatusColor = (status?: IndexingJobStatus) => {
    switch (status) {
      case IndexingJobStatus.Queued:
        return "text-blue-500";
      case IndexingJobStatus.Active:
        return "text-yellow-500";
      case IndexingJobStatus.Completed:
        return "text-green-500";
      case IndexingJobStatus.Failed:
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusEmoji = (status?: IndexingJobStatus) => {
    switch (status) {
      case IndexingJobStatus.Queued:
        return "⏳";
      case IndexingJobStatus.Active:
        return "⚙️";
      case IndexingJobStatus.Completed:
        return "✅";
      case IndexingJobStatus.Failed:
        return "❌";
      default:
        return "❓";
    }
  };

  const jobStatus = latestJobStatus;

  type Warning = NonNullable<
    IndexingJobUpdatedSubscription["indexingJobUpdated"]["warnings"]
  >[number];

  const describeWarning = (warning: Warning) => {
    switch (warning.__typename) {
      case "IndexingErrorMetaflacParsing":
        return `Failed to parse ${warning.filePath}: ${warning.errorMessage}`;
      case "IndexingWarningSubdirectories":
        return `Nested directories under ${warning.dirPath} were skipped`;
      case "IndexingWarningFolderMetadata":
        return `${warning.folderPath}: ${warning.messages.join("; ")}`;
      default:
        return "Additional details unavailable";
    }
  };

  const formatWarningLabel = (warning: Warning) =>
    warning.type.replaceAll("_", " ");

  return (
    <section
      className="rounded-lg bg-sky-950 p-4"
      role="region"
      aria-label="Library Indexing Control"
    >
      <h2 className="mb-4 text-xl font-bold">Library Indexing</h2>

      <button
        onClick={() => {
          void handleTriggerIndexing();
        }}
        disabled={
          triggerLoading || jobStatus?.status === IndexingJobStatus.Active
        }
        className="mb-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
        aria-label="Trigger library indexing"
      >
        {triggerLoading ? "Triggering..." : "Trigger Indexing"}
      </button>

      {error ? (
        <div className="mb-2 text-red-500" role="alert">
          Error: {error}
        </div>
      ) : null}

      {jobStatus ? (
        <div className="space-y-2">
          <div>
            <strong>Job ID:</strong> {jobStatus.jobId}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span className={getStatusColor(jobStatus.status)}>
              {getStatusEmoji(jobStatus.status)} {jobStatus.status}
            </span>
          </div>
          {jobStatus.progress !== null && jobStatus.progress !== undefined ? (
            <div>
              <strong>Progress:</strong> {jobStatus.progress}%
              <div className="mt-1 h-2 w-full rounded-full bg-sky-700">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${jobStatus.progress}%` }}
                  role="progressbar"
                  aria-valuenow={jobStatus.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          ) : null}
          {jobStatus.error ? (
            <div className="text-red-500">
              <strong>Error:</strong> {jobStatus.error}
            </div>
          ) : null}
          {jobStatus.completedAt ? (
            <div>
              <strong>Completed:</strong>{" "}
              {new Date(jobStatus.completedAt).toLocaleString()}
            </div>
          ) : null}
          {jobStatus.warnings && jobStatus.warnings.length > 0 ? (
            <div>
              <strong>Warnings ({jobStatus.warnings.length}):</strong>
              <ul className="mt-2 space-y-2">
                {jobStatus.warnings.map((warning, index) => (
                  <li
                    key={`${warning.type}-${index}`}
                    className="rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-900"
                  >
                    <div className="font-semibold">
                      {formatWarningLabel(warning)}
                    </div>
                    <div>{describeWarning(warning)}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
