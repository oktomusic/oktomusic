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

const setToastMock = vi.hoisted(() => vi.fn());

vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();

  return {
    ...actual,
    useSetAtom: () => setToastMock,
  };
});

vi.mock("@lingui/core/macro", () => ({
  t: (strings: TemplateStringsArray) => strings.join(""),
}));

import { useShare } from "./use_share";

interface TestComponentProps {
  readonly url?: string;
  readonly title?: string;
}

function TestComponent(props: TestComponentProps) {
  const share = useShare(props.url, props.title);

  return (
    <button type="button" data-testid="share" onClick={share}>
      Share
    </button>
  );
}

describe("useShare", () => {
  let container: HTMLDivElement;
  let root: Root;
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    (
      globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();

    vi.clearAllMocks();
  });

  it("returns early when url or title is missing", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: shareMock,
    });

    await act(async () => {
      root.render(<TestComponent url={undefined} title="Playlist" />);
      await Promise.resolve();
    });

    const button = container.querySelector<HTMLButtonElement>(
      "[data-testid='share']",
    );

    await act(async () => {
      button?.click();
      await Promise.resolve();
    });

    expect(shareMock).not.toHaveBeenCalled();
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(setToastMock).not.toHaveBeenCalled();
  });

  it("uses navigator.share when available", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: shareMock,
    });

    await act(async () => {
      root.render(
        <TestComponent
          url="https://example.test/playlist/abc"
          title="My playlist"
        />,
      );
      await Promise.resolve();
    });

    const button = container.querySelector<HTMLButtonElement>(
      "[data-testid='share']",
    );

    await act(async () => {
      button?.click();
      await Promise.resolve();
    });

    expect(shareMock).toHaveBeenCalledWith({
      title: "My playlist",
      url: "https://example.test/playlist/abc",
    });
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(setToastMock).not.toHaveBeenCalled();
  });

  it("shows an error toast when navigator.share fails", async () => {
    const shareMock = vi.fn().mockRejectedValue(new Error("share failed"));
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: shareMock,
    });

    await act(async () => {
      root.render(
        <TestComponent
          url="https://example.test/playlist/abc"
          title="My playlist"
        />,
      );
      await Promise.resolve();
    });

    const button = container.querySelector<HTMLButtonElement>(
      "[data-testid='share']",
    );

    await act(async () => {
      button?.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(setToastMock).toHaveBeenCalledWith({
      type: "error",
      message: "Failed to share",
    });
    expect(writeTextMock).not.toHaveBeenCalled();
  });

  it("copies to clipboard and shows success toast when Web Share API is unavailable", async () => {
    await act(async () => {
      root.render(
        <TestComponent
          url="https://example.test/playlist/abc"
          title="My playlist"
        />,
      );
      await Promise.resolve();
    });

    const button = container.querySelector<HTMLButtonElement>(
      "[data-testid='share']",
    );

    await act(async () => {
      button?.click();
      await Promise.resolve();
    });

    expect(writeTextMock).toHaveBeenCalledWith(
      "https://example.test/playlist/abc",
    );
    expect(setToastMock).toHaveBeenCalledWith({
      type: "success",
      message: "Link copied to clipboard",
    });
  });
});
