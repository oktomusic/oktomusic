import { act, useRef } from "react";
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

import { useVibrantColors, useVibrantColorsPlaying } from "./vibrant_colors";

function TestComponent() {
  useVibrantColorsPlaying();
  return null;
}

interface TestComponentWithDocumentProps {
  readonly targetDocument: Document;
}

function TestComponentWithDocument(props: TestComponentWithDocumentProps) {
  useVibrantColorsPlaying(props.targetDocument);
  return null;
}

interface TestComponentWithRefProps {
  readonly colors?: VibrantColors;
}

function TestComponentWithRef(props: TestComponentWithRefProps) {
  const targetRef = useRef<HTMLDivElement>(null);

  useVibrantColors(targetRef, props.colors);

  return <div ref={targetRef} />;
}

describe("useVibrantColorsPlaying", () => {
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
    expect(applyColorPropertiesMock).toHaveBeenCalledWith(
      document.documentElement,
      null,
    );
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
      document.documentElement,
      colorsA,
    );
    expect(applyColorPropertiesMock).toHaveBeenNthCalledWith(
      2,
      document.documentElement,
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
    expect(applyColorPropertiesMock).toHaveBeenCalledWith(
      customDoc.documentElement,
      colors,
    );
  });
});

describe("useVibrantColors", () => {
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
    vi.clearAllMocks();
  });

  it("applies color properties on mount", async () => {
    const colors: VibrantColors = {
      vibrant: "#111111",
      darkVibrant: "#222222",
      lightVibrant: "#333333",
      muted: "#444444",
      darkMuted: "#555555",
      lightMuted: "#666666",
    };

    await act(async () => {
      root.render(<TestComponentWithRef colors={colors} />);
      await Promise.resolve();
    });

    const targetElement = container.querySelector("div");

    expect(targetElement).not.toBeNull();
    expect(applyColorPropertiesMock).toHaveBeenCalledTimes(1);
    expect(applyColorPropertiesMock).toHaveBeenCalledWith(
      targetElement,
      colors,
    );
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

    await act(async () => {
      root.render(<TestComponentWithRef colors={colorsA} />);
      await Promise.resolve();
    });

    await act(async () => {
      root.render(<TestComponentWithRef colors={colorsB} />);
      await Promise.resolve();
    });

    const targetElement = container.querySelector("div");

    expect(targetElement).not.toBeNull();
    expect(applyColorPropertiesMock).toHaveBeenCalledTimes(3);
    expect(applyColorPropertiesMock).toHaveBeenNthCalledWith(
      1,
      targetElement,
      colorsA,
    );
    expect(applyColorPropertiesMock).toHaveBeenNthCalledWith(
      2,
      targetElement,
      null,
    );
    expect(applyColorPropertiesMock).toHaveBeenNthCalledWith(
      3,
      targetElement,
      colorsB,
    );
  });

  it("clears color properties on unmount", async () => {
    const colors: VibrantColors = {
      vibrant: "#111111",
      darkVibrant: "#222222",
      lightVibrant: "#333333",
      muted: "#444444",
      darkMuted: "#555555",
      lightMuted: "#666666",
    };

    await act(async () => {
      root.render(<TestComponentWithRef colors={colors} />);
      await Promise.resolve();
    });

    const targetElement = container.querySelector("div");

    act(() => {
      root.unmount();
    });

    expect(targetElement).not.toBeNull();
    expect(applyColorPropertiesMock).toHaveBeenCalledTimes(2);
    expect(applyColorPropertiesMock).toHaveBeenNthCalledWith(
      1,
      targetElement,
      colors,
    );
    expect(applyColorPropertiesMock).toHaveBeenNthCalledWith(
      2,
      targetElement,
      null,
    );
  });
});
