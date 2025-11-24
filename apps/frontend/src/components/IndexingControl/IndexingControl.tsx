import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

import { TRIGGER_INDEXING_MUTATION } from "../../api/graphql/mutations/triggerIndexing";
import { INDEXING_JOB_STATUS_QUERY } from "../../api/graphql/queries/indexingJobStatus";
import { IndexingJobStatus } from "../../api/graphql/gql/graphql";

export default function IndexingControl() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [triggerIndexing, { loading: triggerLoading }] =
    useMutation(TRIGGER_INDEXING_MUTATION);

  const { data: statusData, startPolling, stopPolling } = useQuery(
    INDEXING_JOB_STATUS_QUERY,
    {
      variables: { jobId: currentJobId ?? "" },
      skip: !currentJobId,
      fetchPolicy: "network-only",
    },
  );

  // Poll for job status when a job is active
  useEffect(() => {
    if (!currentJobId) return;

    // Start polling every 2 seconds
    startPolling(2000);

    return () => {
      stopPolling();
    };
  }, [currentJobId, startPolling, stopPolling]);

  // Stop polling when job is completed or failed
  useEffect(() => {
    if (!statusData?.indexingJobStatus) return;

    const status = statusData.indexingJobStatus.status;
    if (status === IndexingJobStatus.Completed || status === IndexingJobStatus.Failed) {
      stopPolling();
    }
  }, [statusData?.indexingJobStatus, stopPolling]);

  const handleTriggerIndexing = async () => {
    setError(null);
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

  const jobStatus = statusData?.indexingJobStatus;

  return (
    <section
      className="border border-gray-300 rounded-lg p-4 bg-gray-50"
      role="region"
      aria-label="Library Indexing Control"
    >
      <h2 className="text-xl font-bold mb-4">Library Indexing</h2>

      <button
        onClick={() => {
          void handleTriggerIndexing();
        }}
        disabled={triggerLoading || jobStatus?.status === IndexingJobStatus.Active}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mb-4"
        aria-label="Trigger library indexing"
      >
        {triggerLoading ? "Triggering..." : "Trigger Indexing"}
      </button>

      {error ? (
        <div className="text-red-500 mb-2" role="alert">
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
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
              {new Date(jobStatus.completedAt as string).toLocaleString()}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
