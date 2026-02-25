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

import { useFitText } from "./fit_text";

interface TestComponentProps {
  readonly fontSizesRem?: readonly number[];
}

function TestComponent(props: TestComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLHeadingElement>(null);

  useFitText(containerRef, contentRef, targetRef, props.fontSizesRem);

  return (
    <div ref={containerRef} data-testid="container">
      <div ref={contentRef} data-testid="content">
        <h2 ref={targetRef} data-testid="target">
          Title text
        </h2>
        <p>Metadata</p>
      </div>
    </div>
  );
}

function mockElementLayout(
  element: HTMLElement,
  dimensions: {
    offsetHeight?: number;
    clientHeight?: number;
    clientWidth?: number;
  },
) {
  if (dimensions.offsetHeight !== undefined) {
    Object.defineProperty(element, "offsetHeight", {
      configurable: true,
      get: () => dimensions.offsetHeight,
    });
  }
  if (dimensions.clientHeight !== undefined) {
    Object.defineProperty(element, "clientHeight", {
      configurable: true,
      get: () => dimensions.clientHeight,
    });
  }
  if (dimensions.clientWidth !== undefined) {
    Object.defineProperty(element, "clientWidth", {
      configurable: true,
      get: () => dimensions.clientWidth,
    });
  }
}

describe("useFitText", () => {
  let container: HTMLDivElement;
  let root: Root;

  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();
  let resizeCallback: ResizeObserverCallback;

  beforeAll(() => {
    (
      globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;

    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = vi.fn();
    }

    vi.stubGlobal("ResizeObserver", MockResizeObserver);
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

  it("sets the largest font size when content fits at maximum", async () => {
    await act(async () => {
      root.render(<TestComponent />);
      await Promise.resolve();
    });

    const containerEl = container.querySelector<HTMLElement>(
      "[data-testid='container']",
    )!;
    const targetEl = container.querySelector<HTMLElement>(
      "[data-testid='target']",
    )!;

    mockElementLayout(containerEl, { clientHeight: 200, clientWidth: 500 });

    // Make cloned content always fit
    const originalAppendChild = containerEl.appendChild.bind(containerEl);
    vi.spyOn(containerEl, "appendChild").mockImplementation((node: Node) => {
      const result = originalAppendChild(node);
      if (node instanceof HTMLElement && node.style.visibility === "hidden") {
        mockElementLayout(node, { offsetHeight: 100 });
      }
      return result;
    });

    act(() => {
      resizeCallback([], {} as ResizeObserver);
    });

    expect(targetEl.style.fontSize).toBe("4.5rem");
  });

  it("steps down font size when content overflows at larger sizes", async () => {
    await act(async () => {
      root.render(<TestComponent />);
      await Promise.resolve();
    });

    const containerEl = container.querySelector<HTMLElement>(
      "[data-testid='container']",
    )!;
    const targetEl = container.querySelector<HTMLElement>(
      "[data-testid='target']",
    )!;

    mockElementLayout(containerEl, { clientHeight: 100, clientWidth: 500 });

    let measureCount = 0;
    const originalAppendChild = containerEl.appendChild.bind(containerEl);
    vi.spyOn(containerEl, "appendChild").mockImplementation((node: Node) => {
      const result = originalAppendChild(node);
      if (node instanceof HTMLElement && node.style.visibility === "hidden") {
        measureCount = 0;
        Object.defineProperty(node, "offsetHeight", {
          configurable: true,
          get: () => {
            measureCount++;
            // First two sizes overflow (4.5rem, 3.75rem), third fits (3rem)
            return measureCount <= 2 ? 200 : 80;
          },
        });
      }
      return result;
    });

    act(() => {
      resizeCallback([], {} as ResizeObserver);
    });

    expect(targetEl.style.fontSize).toBe("3rem");
  });

  it("falls back to smallest font size when nothing fits", async () => {
    await act(async () => {
      root.render(<TestComponent />);
      await Promise.resolve();
    });

    const containerEl = container.querySelector<HTMLElement>(
      "[data-testid='container']",
    )!;
    const targetEl = container.querySelector<HTMLElement>(
      "[data-testid='target']",
    )!;

    mockElementLayout(containerEl, { clientHeight: 50, clientWidth: 500 });

    const originalAppendChild = containerEl.appendChild.bind(containerEl);
    vi.spyOn(containerEl, "appendChild").mockImplementation((node: Node) => {
      const result = originalAppendChild(node);
      if (node instanceof HTMLElement && node.style.visibility === "hidden") {
        // Always overflows
        mockElementLayout(node, { offsetHeight: 300 });
      }
      return result;
    });

    act(() => {
      resizeCallback([], {} as ResizeObserver);
    });

    expect(targetEl.style.fontSize).toBe("1.5rem");
  });

  it("uses custom font sizes when provided", async () => {
    const customSizes = [3, 2, 1] as const;

    await act(async () => {
      root.render(<TestComponent fontSizesRem={customSizes} />);
      await Promise.resolve();
    });

    const containerEl = container.querySelector<HTMLElement>(
      "[data-testid='container']",
    )!;
    const targetEl = container.querySelector<HTMLElement>(
      "[data-testid='target']",
    )!;

    mockElementLayout(containerEl, { clientHeight: 100, clientWidth: 500 });

    let measureCount = 0;
    const originalAppendChild = containerEl.appendChild.bind(containerEl);
    vi.spyOn(containerEl, "appendChild").mockImplementation((node: Node) => {
      const result = originalAppendChild(node);
      if (node instanceof HTMLElement && node.style.visibility === "hidden") {
        measureCount = 0;
        Object.defineProperty(node, "offsetHeight", {
          configurable: true,
          get: () => {
            measureCount++;
            // First size overflows, second fits
            return measureCount <= 1 ? 200 : 80;
          },
        });
      }
      return result;
    });

    act(() => {
      resizeCallback([], {} as ResizeObserver);
    });

    expect(targetEl.style.fontSize).toBe("2rem");
  });

  it("observes the container with ResizeObserver", async () => {
    await act(async () => {
      root.render(<TestComponent />);
      await Promise.resolve();
    });

    const containerEl = container.querySelector<HTMLElement>(
      "[data-testid='container']",
    )!;

    expect(mockObserve).toHaveBeenCalledWith(containerEl);
  });

  it("disconnects ResizeObserver on unmount", async () => {
    await act(async () => {
      root.render(<TestComponent />);
      await Promise.resolve();
    });

    expect(mockDisconnect).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it("cleans up the clone after measuring", async () => {
    await act(async () => {
      root.render(<TestComponent />);
      await Promise.resolve();
    });

    const containerEl = container.querySelector<HTMLElement>(
      "[data-testid='container']",
    )!;

    mockElementLayout(containerEl, { clientHeight: 200, clientWidth: 500 });

    const originalAppendChild = containerEl.appendChild.bind(containerEl);
    vi.spyOn(containerEl, "appendChild").mockImplementation((node: Node) => {
      const result = originalAppendChild(node);
      if (node instanceof HTMLElement && node.style.visibility === "hidden") {
        mockElementLayout(node, { offsetHeight: 100 });
      }
      return result;
    });

    act(() => {
      resizeCallback([], {} as ResizeObserver);
    });

    // Clone should have been removed — no hidden elements left
    const hiddenElements = containerEl.querySelectorAll(
      "[style*='visibility: hidden']",
    );
    expect(hiddenElements.length).toBe(0);
  });
});
