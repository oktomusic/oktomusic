import { atom } from "jotai";

/**
 * Whether the left panel (library) is expanded.
 * When `false`, the panel collapses to a narrow bar.
 */
export const panelLeftExpandedAtom = atom<boolean>(true);

/**
 * Whether the right panel (queue) is visible.
 * Toggled via a button in the player controls.
 */
export const panelRightVisibleAtom = atom<boolean>(true);

/**
 * Whether the overlay panel is visible.
 * When `true`, it covers the main content area (e.g. lyrics view).
 */
export const panelOverlayVisibleAtom = atom<boolean>(false);

export interface PanelToast {
  readonly message: string;
  readonly type: "success" | "error" | "info";
}

export const panelToastAtom = atom<PanelToast | null>(null);
