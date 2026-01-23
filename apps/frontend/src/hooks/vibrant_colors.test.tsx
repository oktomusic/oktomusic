import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { VibrantColors } from "../atoms/player/machine";

const state = vi.hoisted(() => ({
  colors: null as VibrantColors | null,
}));

const applyColorPropertiesMock = vi.hoisted(() => vi.fn());

vi.mock("../utils/vibrant_colors", () => ({
  default: applyColorPropertiesMock,
}));

vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();

  return {
    ...actual,
    useAtomValue: () => state.colors,
  };
});

import { useVibrantColorsProperties } from "./vibrant_colors";

function TestComponent() {
  useVibrantColorsProperties();
  return null;
}

interface TestComponentWithDocumentProps {
  readonly targetDocument: Document;
}

function TestComponentWithDocument(props: TestComponentWithDocumentProps) {
  useVibrantColorsProperties(props.targetDocument);
  return null;
}

describe("useVibrantColorsProperties", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (
      globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });

    container.remove();
    state.colors = null;
    vi.clearAllMocks();
  });

  it("applies color properties on mount", async () => {
    state.colors = null;

    await act(async () => {
      root.render(<TestComponent />);
      await Promise.resolve();
    });

    expect(applyColorPropertiesMock).toHaveBeenCalledTimes(1);
    expect(applyColorPropertiesMock).toHaveBeenCalledWith(document, null);
  });

  it("re-applies color properties when colors change", async () => {
    const colorsA: VibrantColors = {
      vibrant: "#111111",
      darkVibrant: "#222222",
      lightVibrant: "#333333",
      muted: "#444444",
      darkMuted: "#555555",
      lightMuted: "#666666",
    };

    const colorsB: VibrantColors = {
      vibrant: "#aaaaaa",
      darkVibrant: "#bbbbbb",
      lightVibrant: "#cccccc",
      muted: "#dddddd",
      darkMuted: "#eeeeee",
      lightMuted: "#ffffff",
    };

    state.colors = colorsA;
    await act(async () => {
      root.render(<TestComponent />);
      await Promise.resolve();
    });

    state.colors = colorsB;
    await act(async () => {
      root.render(<TestComponent />);
      await Promise.resolve();
    });

    expect(applyColorPropertiesMock).toHaveBeenCalledTimes(2);
    expect(applyColorPropertiesMock).toHaveBeenNthCalledWith(
      1,
      document,
      colorsA,
    );
    expect(applyColorPropertiesMock).toHaveBeenNthCalledWith(
      2,
      document,
      colorsB,
    );
  });

  it("applies color properties to a custom document", async () => {
    const customDoc = document.implementation.createHTMLDocument("PiP");
    const colors: VibrantColors = {
      vibrant: "#111111",
      darkVibrant: "#222222",
      lightVibrant: "#333333",
      muted: "#444444",
      darkMuted: "#555555",
      lightMuted: "#666666",
    };

    state.colors = colors;
    await act(async () => {
      root.render(<TestComponentWithDocument targetDocument={customDoc} />);
      await Promise.resolve();
    });

    expect(applyColorPropertiesMock).toHaveBeenCalledTimes(1);
    expect(applyColorPropertiesMock).toHaveBeenCalledWith(customDoc, colors);
  });
});
