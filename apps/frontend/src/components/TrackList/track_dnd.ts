export const TRACK_DND_TYPE = "track";

export const TRACK_LIST_DND_TYPE = "track-list";

export interface TrackDragData {
  readonly type: typeof TRACK_DND_TYPE;
  readonly trackId: string;
  readonly trackName: string;
  readonly playlistId?: string;
  readonly playlistTrackIndex?: number;
}

export type TrackDropIndicator = "before" | "after" | null;

export interface TrackSortableConfig {
  readonly id: string;
  readonly index: number;
  readonly group: string;
  readonly enabled: boolean;
}

/**
 * Type guard for TrackDragData, used to validate the data of a DnD source
 */
export function isTrackDragData(data: unknown): data is TrackDragData {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const candidate = data as Partial<TrackDragData>;

  return (
    candidate.type === TRACK_DND_TYPE &&
    typeof candidate.trackId === "string" &&
    typeof candidate.trackName === "string"
  );
}
