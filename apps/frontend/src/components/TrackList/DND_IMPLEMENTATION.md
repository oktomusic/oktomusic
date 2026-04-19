# TrackList Drag and Drop Implementation

## Goals

This implementation provides playlist track reordering with a predictable UI and safe persistence:

- A dedicated drag overlay for track items.
- A fixed source row highlight while dragging.
- A line indicator that shows the effective insertion point.
- Optimistic local reorder with rollback when the backend mutation fails.

## Main Building Blocks

### Provider Scope

Drag and drop is enabled at app level with a single `DragDropProvider` in `App.tsx`. This allows `useDragDropMonitor`, `useDroppable`, `useSortable`, and `DragOverlay` to coordinate through one shared manager.

### Shared DnD Contracts

`track_dnd.ts` centralizes shared contracts:

- `TRACK_DND_TYPE`: draggable/sortable entity type for tracks.
- `TRACK_LIST_DND_TYPE`: droppable type for track list containers.
- `TrackDragData`: payload shape attached to sortable track entities.
- `TrackSortableConfig`: per-item sortable identity and placement config.
- `TrackDropIndicator`: visual marker state for insertion line rendering.
- `isTrackDragData`: runtime type guard used by the overlay.

This keeps TrackList and overlay logic aligned on one source of truth.

## Track Row Setup (`TrackElement.tsx`)

Each row registers `useSortable` with:

- A stable `id` that includes list id + positional identity.
- `type` and `accept` set to the track type.
- `group` set to the list droppable id.
- DnD payload data (`trackId`, `trackName`, playlist metadata).

The component receives 3 DnD-oriented props:

- `sortable`: sortable identity/index/group metadata.
- `isDragSourceHighlighted`: keeps source row visually marked.
- `dropIndicator`: controls before/after insertion line style.

## List Orchestration (`TrackList.tsx`)

### Local Render Model

The list keeps `sortableTrackItems` state as the rendered source of truth for reorderable views. This decouples visual order from incoming query arrays and enables controlled optimistic updates.

### Drag Preview State

`dragPreview` stores:

- `sourceIndex`: original dragged index.
- `insertionSlot`: slot boundary where the item would be inserted.

This enables indicator rendering without moving non-overlay rows in the DOM.

### Drag Event Flow

- `onDragStart`: initializes preview state for the active list.
- `onDragOver`:
  - Restricts handling to the same group/list.
  - Calls `event.preventDefault()` to stop optimistic sortable DOM movement.
  - Computes `insertionSlot` by target index and pointer half-split.
- `onDragEnd`:
  - Clears preview.
  - Converts insertion slot to final reorder index.
  - Applies local optimistic reorder.
  - Sends `reorderPlaylistTracks` mutation when list is playlist-backed.
  - Rolls back local state and emits toast error if mutation fails.

## Drag Overlay (`OktoDragOverlay.tsx`)

Overlay behavior:

- Uses `DragOverlay` with `dropAnimation={null}` to avoid drop-time jitter.
- Uses pointer-offset capture on drag start so overlay follows cursor anchoring.
- Uses `isTrackDragData` to safely read `trackName` from source payload.
- Falls back to source type text for non-track drags.

## Styling (`TrackList.css`)

- Source row highlight class: `track-list__track--drag-source`.
- Insertion line classes:
  - `track-list__track--drop-before`
  - `track-list__track--drop-after`

The line appears as a thin colored separator at row boundaries.

## Persistence and Failure Strategy

### Optimistic Update

UI updates immediately on drop for responsiveness.

### Mutation

`reorderPlaylistTracks(id, fromPosition, toPosition)` persists server order.

### Rollback

On failure, previous local order is restored and an error toast is shown.

This avoids stale incorrect visual ordering.

## Why This Works Well

- Keeps DnD data contracts explicit and reusable.
- Separates visual preview state from persisted list state.
- Maintains predictable drop behavior even with duplicate tracks.
- Limits backend dependency impact by graceful rollback.

## Plan To Reduce File Size and Complexity

### Phase 1: Extract Pure Utilities

Create a `track_list_dnd_utils.ts` file and move:

- `reorderSortableTrackItems`
- `toSortableTrackItems`
- `clamp`
- `toPlaylistTargetIndex`
- insertion-slot helpers and guards

This reduces cognitive load in `TrackList.tsx` and improves testability.

### Phase 2: Extract Drag Monitor Hook

Create `useTrackListDragPreview.ts` to own:

- drag preview state lifecycle
- monitor handlers (`onDragStart`, `onDragOver`, `onDragEnd`)
- translation from drag operation to insertion slot/index

`TrackList.tsx` then becomes primarily rendering and mutation orchestration.

### Phase 3: Extract Persistence Hook

Create `usePlaylistTrackReorder.ts` to own:

- optimistic reorder commit
- mutation execution
- rollback + toast handling
- in-flight lock management

This isolates API concerns from drag visual logic.

### Phase 4: Split Overlay Positioning

Create `useOverlayPointerOffset.ts` for cursor-anchor behavior and keep `OktoDragOverlay.tsx` as presentational.

### Phase 5: Add Focused Unit Tests

Introduce tests for:

- slot-to-target index conversion
- no-op boundaries
- duplicate-id-safe reorder behavior
- rollback restoration path

This supports safe refactors and avoids regressions when extracting hooks.
