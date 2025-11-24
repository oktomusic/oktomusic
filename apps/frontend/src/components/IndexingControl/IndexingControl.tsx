import { useEffect, useState } from "react";

import type {
  IndexingTriggerRes,
  IndexingStatusRes,
} from "@oktomusic/api-schemas";

import {
  triggerIndexing,
  getIndexingStatus,
} from "../../api/axios/endpoints/indexing";

export default function IndexingControl() {
  const [jobData, setJobData] = useState<IndexingTriggerRes | null>(null);
  const [statusData, setStatusData] = useState<IndexingStatusRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll for job status when a job is active
  useEffect(() => {
    if (!jobData?.jobId) return;

    let intervalId: number | null = null;

    const fetchStatus = async () => {
      try {
        const status = await getIndexingStatus(jobData.jobId);
        setStatusData(status);

        // Stop polling if job is completed or failed
        if (status.status === "completed" || status.status === "failed") {
          if (intervalId !== null) {
            clearInterval(intervalId);
          }
          return;
        }
      } catch (err) {
        console.error("Error fetching job status:", err);
      }
    };

    // Initial fetch
    void fetchStatus();

    // Poll every 2 seconds
    intervalId = setInterval(() => {
      void fetchStatus();
    }, 2000);

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [jobData?.jobId]);

  const handleTriggerIndexing = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await triggerIndexing();
      setJobData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to trigger indexing",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "queued":
        return "text-blue-500";
      case "active":
        return "text-yellow-500";
      case "completed":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusEmoji = (status?: string) => {
    switch (status) {
      case "queued":
        return "⏳";
      case "active":
        return "⚙️";
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "❓";
    }
  };

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
        disabled={loading || statusData?.status === "active"}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mb-4"
        aria-label="Trigger library indexing"
      >
        {loading ? "Triggering..." : "Trigger Indexing"}
      </button>

      {error ? (
        <div className="text-red-500 mb-2" role="alert">
          Error: {error}
        </div>
      ) : null}

      {statusData ? (
        <div className="space-y-2">
          <div>
            <strong>Job ID:</strong> {statusData.jobId}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span className={getStatusColor(statusData.status)}>
              {getStatusEmoji(statusData.status)} {statusData.status}
            </span>
          </div>
          {statusData.progress !== undefined ? (
            <div>
              <strong>Progress:</strong> {statusData.progress}%
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${statusData.progress}%` }}
                  role="progressbar"
                  aria-valuenow={statusData.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          ) : null}
          {statusData.error ? (
            <div className="text-red-500">
              <strong>Error:</strong> {statusData.error}
            </div>
          ) : null}
          {statusData.completedAt ? (
            <div>
              <strong>Completed:</strong>{" "}
              {new Date(statusData.completedAt).toLocaleString()}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
