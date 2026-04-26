import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useDragDropMonitor, useDroppable } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { t } from "@lingui/core/macro";
import { useSetAtom } from "jotai";
import { LuDisc3 } from "react-icons/lu";

import { REORDER_PLAYLIST_TRACKS_MUTATION } from "../../api/graphql/mutations/playlists/reorderPlaylistTracks";
import {
  handleSeekToQueueIndexAtom,
  playerQueueFromAtom,
  replaceQueueAtom,
  type PlayerQueueFrom,
  type TrackWithAlbum,
} from "../../atoms/player/machine";
import { usePanelToast } from "../../hooks/use_panel_toast";
import { TrackElement } from "./TrackElement";
import {
  TRACK_DND_TYPE,
  TRACK_LIST_DND_TYPE,
  type TrackSortableConfig,
} from "./track_dnd";

import "./TrackList.css";

interface SortableTrackItem {
  readonly sortableId: string;
  readonly track: TrackWithAlbum;
}

interface TrackDragPreviewState {
  readonly sourceIndex: number;
  readonly insertionSlot: number | null;
}

function reorderSortableTrackItems(
  items: readonly SortableTrackItem[],
  fromIndex: number,
  toIndex: number,
): readonly SortableTrackItem[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const nextItems = [...items];
  const [movedTrack] = nextItems.splice(fromIndex, 1);

  if (movedTrack === undefined) {
    return items;
  }

  nextItems.splice(toIndex, 0, movedTrack);

  return nextItems;
}

function toSortableTrackItems(
  tracks: readonly TrackWithAlbum[],
  droppableId: string,
): readonly SortableTrackItem[] {
  return tracks.map((track, index) => ({
    sortableId: `${droppableId}:track:${index}:${track.id}`,
    track,
  }));
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function toPlaylistTargetIndex(slot: number, sourceIndex: number): number {
  return slot > sourceIndex ? slot - 1 : slot;
}

function hasMeaningfulInsertionSlot(
  preview: TrackDragPreviewState | null,
): preview is { readonly sourceIndex: number; readonly insertionSlot: number } {
  if (preview === null || preview.insertionSlot === null) {
    return false;
  }

  return (
    preview.insertionSlot !== preview.sourceIndex &&
    preview.insertionSlot !== preview.sourceIndex + 1
  );
}

interface TrackListProps {
  readonly tracks: readonly (readonly TrackWithAlbum[])[];
  readonly displayCover?: boolean;
  /**
   * Optional source metadata for the queue being started from this list.
   */
  readonly queueFrom?: PlayerQueueFrom | null;
  /**
   * The ID of the playlist to which tracks can be added or removed.
   *
   * Used to conditionally render "Remove from playlist" menu item.
   */
  readonly playlistId?: string;
  /**
   * Enables sortable track rows and playlist reorder persistence.
   */
  readonly reorderable?: boolean;

  /**
   * Unique droppable/group identifier for this list DnD area.
   */
  readonly droppableId: string;
}

export function TrackList(props: TrackListProps) {
  const [reorderPlaylistTracks] = useMutation(REORDER_PLAYLIST_TRACKS_MUTATION);
  const setToast = usePanelToast();

  const sourceTracks = useMemo(() => props.tracks.flat(), [props.tracks]);

  const sourceTracksSignature = useMemo(
    () =>
      sourceTracks
        .map(
          (track, index) =>
            `${index}:${track.id}:${track.name}:${track.durationMs}:${track.album.id}`,
        )
        .join("|"),
    [sourceTracks],
  );

  const sourceSnapshotKey = `${props.droppableId}|${sourceTracksSignature}`;

  const [sortableTrackItems, setSortableTrackItems] = useState<
    readonly SortableTrackItem[]
  >(() => toSortableTrackItems(sourceTracks, props.droppableId));

  const sortableTrackItemsRef =
    useRef<readonly SortableTrackItem[]>(sortableTrackItems);
  const syncedSourceSnapshotKeyRef = useRef(sourceSnapshotKey);
  const persistReorderInFlightRef = useRef(false);
  const [dragPreview, setDragPreview] = useState<TrackDragPreviewState | null>(
    null,
  );
  const dragPreviewRef = useRef<TrackDragPreviewState | null>(null);

  useEffect(() => {
    sortableTrackItemsRef.current = sortableTrackItems;
  }, [sortableTrackItems]);

  useEffect(() => {
    dragPreviewRef.current = dragPreview;
  }, [dragPreview]);

  useEffect(() => {
    if (!props.reorderable) {
      return;
    }

    if (syncedSourceSnapshotKeyRef.current === sourceSnapshotKey) {
      return;
    }

    syncedSourceSnapshotKeyRef.current = sourceSnapshotKey;

    const nextItems = toSortableTrackItems(sourceTracks, props.droppableId);

    sortableTrackItemsRef.current = nextItems;
    setSortableTrackItems(nextItems);
  }, [props.droppableId, props.reorderable, sourceSnapshotKey, sourceTracks]);

  useDragDropMonitor({
    onDragStart: (event) => {
      if (!props.reorderable) {
        return;
      }

      const { source } = event.operation;

      if (!isSortable(source)) {
        return;
      }

      if (source.initialGroup !== props.droppableId) {
        return;
      }

      setDragPreview({
        sourceIndex: source.initialIndex,
        insertionSlot: null,
      });
    },
    onDragOver: (event) => {
      if (!props.reorderable) {
        return;
      }

      const { source, target } = event.operation;

      if (!isSortable(source)) {
        return;
      }

      if (source.initialGroup !== props.droppableId) {
        return;
      }

      event.preventDefault();

      const listLength = sortableTrackItemsRef.current.length;
      let insertionSlot: number | null = null;

      if (listLength === 0) {
        insertionSlot = 0;
      } else if (target !== null && isSortable(target)) {
        if (target.group === props.droppableId) {
          const targetIndex = clamp(target.index, 0, listLength - 1);
          let insertAfter = targetIndex > source.initialIndex;

          if (target.element instanceof Element) {
            const rect = target.element.getBoundingClientRect();
            insertAfter =
              event.operation.position.current.y >= rect.top + rect.height / 2;
          }

          insertionSlot = clamp(
            targetIndex + (insertAfter ? 1 : 0),
            0,
            listLength,
          );
        }
      } else if (target?.id === props.droppableId) {
        insertionSlot = listLength;
      }

      setDragPreview((previous) => {
        const nextPreview: TrackDragPreviewState = {
          sourceIndex: source.initialIndex,
          insertionSlot,
        };

        if (
          previous?.sourceIndex === nextPreview.sourceIndex &&
          previous.insertionSlot === nextPreview.insertionSlot
        ) {
          return previous;
        }

        return nextPreview;
      });
    },
    onDragEnd: (event) => {
      const { source } = event.operation;

      const sourceBelongsToThisList =
        isSortable(source) && source.initialGroup === props.droppableId;

      if (sourceBelongsToThisList) {
        setDragPreview(null);
      }

      if (event.canceled || !props.reorderable || !sourceBelongsToThisList) {
        return;
      }

      if (persistReorderInFlightRef.current) {
        return;
      }

      const { initialGroup, group, initialIndex, index } = source;

      if (initialGroup !== props.droppableId || group !== props.droppableId) {
        return;
      }

      const listLength = sortableTrackItemsRef.current.length;

      if (listLength === 0) {
        return;
      }

      const insertionSlot = dragPreviewRef.current?.insertionSlot;
      const targetIndex =
        insertionSlot === null || insertionSlot === undefined
          ? index
          : clamp(
              toPlaylistTargetIndex(insertionSlot, initialIndex),
              0,
              listLength - 1,
            );

      const currentItems = sortableTrackItemsRef.current;
      const nextItems = reorderSortableTrackItems(
        currentItems,
        initialIndex,
        targetIndex,
      );

      if (nextItems === currentItems) {
        return;
      }

      sortableTrackItemsRef.current = nextItems;
      setSortableTrackItems(nextItems);

      if (props.playlistId === undefined) {
        return;
      }

      persistReorderInFlightRef.current = true;

      void reorderPlaylistTracks({
        variables: {
          id: props.playlistId,
          fromPosition: initialIndex,
          toPosition: targetIndex,
        },
      })
        .catch((err: unknown) => {
          console.error(err);

          sortableTrackItemsRef.current = currentItems;
          setSortableTrackItems(currentItems);

          setToast({
            message: t`Failed to reorder playlist tracks`,
            type: "error",
          });
        })
        .finally(() => {
          persistReorderInFlightRef.current = false;
        });
    },
  });

  const renderedTracks = useMemo(() => {
    if (!props.reorderable) {
      return props.tracks;
    }

    return [sortableTrackItems.map((item) => item.track)] as const;
  }, [props.reorderable, props.tracks, sortableTrackItems]);

  const isMultiDisc = renderedTracks.length > 1;
  const displayCover = props.displayCover !== false;
  const effectiveDragPreview = hasMeaningfulInsertionSlot(dragPreview)
    ? dragPreview
    : null;

  const { isDropTarget, ref } = useDroppable({
    id: props.droppableId,
    type: TRACK_LIST_DND_TYPE,
    accept: TRACK_DND_TYPE,
  });

  // Flatten all rendered tracks so click-to-play always follows visible order.
  const allTracks = useMemo(() => renderedTracks.flat(), [renderedTracks]);

  const replaceQueue = useSetAtom(replaceQueueAtom);
  const setQueueFrom = useSetAtom(playerQueueFromAtom);
  const seekToQueueIndex = useSetAtom(handleSeekToQueueIndexAtom);

  const handlePlay = useCallback(
    (globalIndex: number) => {
      setQueueFrom(props.queueFrom ?? null);
      replaceQueue(allTracks);
      if (globalIndex > 0) {
        seekToQueueIndex(globalIndex);
      }
    },
    [allTracks, props.queueFrom, replaceQueue, seekToQueueIndex, setQueueFrom],
  );

  return (
    <div
      className={
        "track-list" + (isDropTarget ? " track-list--drop-target" : "")
      }
      ref={ref}
    >
      <nav className="track-list__nav mb-2 grid w-full border-b border-zinc-600 pb-2">
        <span className="text-end">#</span>
        <span className="border-zinc-600">Title</span>
        <span className="border-l border-zinc-600 px-2">Duration</span>
      </nav>
      {renderedTracks.map((discTracks, discIndex) => {
        // Calculate the starting global index for this disc
        const discStartIndex = renderedTracks
          .slice(0, discIndex)
          .reduce((sum, disc) => sum + disc.length, 0);

        const discNumber = discIndex + 1;

        return (
          <div key={discIndex} className="track-list__disc">
            {isMultiDisc && (
              <div className="flex h-14 flex-row items-center gap-4 px-4">
                <LuDisc3 />
                <h2 className="track-list__disc-title font-bold">
                  {t`Disc ${discNumber}`}
                </h2>
              </div>
            )}
            <ol className="track-list__tracks">
              {discTracks.map((track, trackIndex) => {
                const globalIndex = discStartIndex + trackIndex;
                const sortableId =
                  props.reorderable &&
                  sortableTrackItems[globalIndex] !== undefined
                    ? sortableTrackItems[globalIndex].sortableId
                    : `${props.droppableId}:track:${globalIndex}:${track.id}`;

                const sortable: TrackSortableConfig = {
                  id: sortableId,
                  index: globalIndex,
                  group: props.droppableId,
                  enabled: props.reorderable === true,
                };

                const dropIndicator =
                  effectiveDragPreview?.insertionSlot === globalIndex
                    ? "before"
                    : effectiveDragPreview?.insertionSlot === globalIndex + 1
                      ? "after"
                      : null;

                const isDragSourceHighlighted =
                  dragPreview?.sourceIndex === globalIndex;

                return (
                  <TrackElement
                    key={sortableId}
                    track={track}
                    index={trackIndex}
                    displayCover={displayCover}
                    onPlay={() => handlePlay(globalIndex)}
                    playlistId={props.playlistId}
                    playlistTrackIndex={globalIndex}
                    sortable={sortable}
                    isDragSourceHighlighted={isDragSourceHighlighted}
                    dropIndicator={dropIndicator}
                  />
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
