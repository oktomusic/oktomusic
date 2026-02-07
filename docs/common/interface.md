# Oktomusic Main Interface

The UI is Oktomusic is build for fullscreen use. Overflows should never happen outside of explicitly defined scrollable areas.

Two elements are always present: the header and the bottom player controls.
The header is fixed to the top of the screen, while the player controls are fixed to the bottom.

The main content area is between these two elements and should take up all remaining space.

This area is split into three columns:

- The left panel is the library and is foldable in a small bar.
- The middle panel is the main content area and should be used for content matching the current route.
- The right panel is for the queue and is hiddable entirelly with a player bar button.

In addition, it is possible for a separated panel to take the place of the main content area (ex: lyrics player) as an overlay (NOT a replacement).
