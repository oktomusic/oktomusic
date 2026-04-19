import { useState } from "react";
import { DragOverlay, useDragDropMonitor } from "@dnd-kit/react";

import { isTrackDragData, TRACK_DND_TYPE } from "./TrackList/track_dnd";

interface OverlayPointerOffset {
  readonly x: number;
  readonly y: number;
}

/**
 * Render drag overlays for the entire application, based on the current DnD state.
 *
 * - Uses a drag monitor to track the current drag source and pointer position, and conditionally renders an overlay element that follows the pointer.
 * - Uses type guards to validate the DnD source data and render appropriate content for different drag types.
 *
 * @see https://dndkit.com/react/components/drag-overlay
 */
export function OktoDragOverlay() {
  const [pointerOffset, setPointerOffset] =
    useState<OverlayPointerOffset | null>(null);

  useDragDropMonitor({
    onDragStart: (event) => {
      const { source, position } = event.operation;

      if (
        source === null ||
        source.type !== TRACK_DND_TYPE ||
        !(source.element instanceof Element)
      ) {
        setPointerOffset(null);
        return;
      }

      const sourceRect = source.element.getBoundingClientRect();

      setPointerOffset({
        x: position.current.x - sourceRect.left,
        y: position.current.y - sourceRect.top,
      });
    },
    onDragEnd: () => {
      setPointerOffset(null);
    },
  });

  return (
    <DragOverlay
      dropAnimation={null}
      className="pointer-events-none fixed inset-0 z-50"
    >
      {(source) => {
        if (!source) {
          return null;
        }

        const sourceData = source.data;

        if (source.type === TRACK_DND_TYPE && isTrackDragData(sourceData)) {
          return (
            // Element follows pointer, with top left corder as the anchor point
            <div
              className="w-64 truncate rounded-md bg-zinc-950/95 px-2 py-1 text-sm text-zinc-100 shadow-lg backdrop-blur-sm"
              style={
                pointerOffset === null
                  ? undefined
                  : {
                      transform: `translate(${pointerOffset.x}px, ${pointerOffset.y}px)`,
                    }
              }
            >
              {sourceData.trackName}
            </div>
          );
        }

        return source.type?.toString() ?? source.id.toString();
      }}
    </DragOverlay>
  );
}
