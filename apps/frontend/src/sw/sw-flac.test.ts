import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPartialResponse } from "workbox-range-requests";

import {
  fetchMediaHandler,
  getOPFSFileResponse,
  handleMediaRequest,
  MEDIA_URL_PATTERN,
} from "./sw-flac";

vi.mock("workbox-range-requests", async () => {
  const actual = await vi.importActual<typeof import("workbox-range-requests")>(
    "workbox-range-requests",
  );

  return {
    ...actual,
    createPartialResponse: vi.fn(),
  };
});

type StorageDirectoryHandleLike = {
  readonly getDirectoryHandle: (name: string) => Promise<unknown>;
};

type FileSystemFileHandleLike = {
  readonly getFile: () => Promise<File>;
};

type StorageDirectoryHandleFilesLike = {
  readonly getFileHandle: (name: string) => Promise<unknown>;
};

type CacheLike = {
  readonly match: (
    request: Request,
    options?: CacheQueryOptions,
  ) => Promise<Response | undefined>;
  readonly put: (request: Request, response: Response) => Promise<void>;
};

function stubCacheStorage(cacheImpl: CacheLike): ReturnType<typeof vi.fn> {
  const open = vi.fn(() => Promise.resolve(cacheImpl));

  Object.defineProperty(globalThis, "caches", {
    value: { open },
    configurable: true,
  });

  return open;
}

function stubFetch(impl: typeof fetch): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(impl);

  Object.defineProperty(globalThis, "fetch", {
    value: fetchMock,
    configurable: true,
  });

  return fetchMock;
}

function stubNavigatorStorageGetDirectory(
  impl: () => Promise<unknown>,
): ReturnType<typeof vi.fn> {
  const getDirectory = vi.fn(impl);

  // jsdom provides a real Navigator instance; patch its `storage` property.
  Object.defineProperty(globalThis.navigator, "storage", {
    value: { getDirectory },
    configurable: true,
  });

  return getDirectory;
}

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  Object.defineProperty(globalThis.navigator, "storage", {
    value: { getDirectory: vi.fn(() => Promise.reject(new Error("no opfs"))) },
    configurable: true,
  });
});

describe("getOPFSFileResponse", () => {
  it("returns a Response with FLAC headers when the file exists in OPFS", async () => {
    const cuid = "cuid_123";
    const fileBytes = new Uint8Array([0x66, 0x4c, 0x61, 0x43]); // "fLaC"
    const opfsFile = new File([fileBytes], `${cuid}.flac`, {
      type: "application/octet-stream",
    });

    const fileHandle: FileSystemFileHandleLike = {
      getFile: vi.fn(() => Promise.resolve(opfsFile)),
    };

    const filesDir: StorageDirectoryHandleFilesLike = {
      getFileHandle: vi.fn((name: string) => {
        expect(name).toBe(`${cuid}.flac`);
        return Promise.resolve(fileHandle);
      }),
    };

    const root: StorageDirectoryHandleLike = {
      getDirectoryHandle: vi.fn((name: string) => {
        expect(name).toBe("files");
        return Promise.resolve(filesDir);
      }),
    };

    stubNavigatorStorageGetDirectory(() => Promise.resolve(root));

    const response = await getOPFSFileResponse(cuid);
    expect(response).not.toBeNull();
    expect(response).toBeInstanceOf(Response);

    expect(fileHandle.getFile).toHaveBeenCalledTimes(1);

    const headers = (response as Response).headers;
    expect(headers.get("Content-Type")).toBe("audio/flac");
    expect(headers.get("Accept-Ranges")).toBe("bytes");
    expect(headers.get("Content-Length")).toBe(opfsFile.size.toString());
  });

  it("returns null when OPFS is unavailable (getDirectory throws)", async () => {
    stubNavigatorStorageGetDirectory(() =>
      Promise.reject(new Error("OPFS unavailable")),
    );

    await expect(getOPFSFileResponse("cuid_abc")).resolves.toBeNull();
  });

  it("returns null when /files directory cannot be opened", async () => {
    const root: StorageDirectoryHandleLike = {
      getDirectoryHandle: vi.fn(() =>
        Promise.reject(new Error("no files dir")),
      ),
    };

    stubNavigatorStorageGetDirectory(() => Promise.resolve(root));

    await expect(getOPFSFileResponse("cuid_abc")).resolves.toBeNull();
  });

  it("returns null when the FLAC file cannot be opened", async () => {
    const filesDir: StorageDirectoryHandleFilesLike = {
      getFileHandle: vi.fn(() => Promise.reject(new Error("no such file"))),
    };

    const root: StorageDirectoryHandleLike = {
      getDirectoryHandle: vi.fn(() => Promise.resolve(filesDir)),
    };

    stubNavigatorStorageGetDirectory(() => Promise.resolve(root));

    await expect(getOPFSFileResponse("cuid_missing")).resolves.toBeNull();
  });
});

describe("fetchMediaHandler", () => {
  it("calls event.respondWith when URL matches /api/media/{cuid} pattern", () => {
    const cuid = "cuid_test123";
    const url = `https://example.com/api/media/${cuid}`;
    const request = new Request(url);

    const respondWith = vi.fn();
    const event = {
      request,
      respondWith,
    } as unknown as FetchEvent;

    const mockServiceWorker = {
      addEventListener: vi.fn(),
    } as unknown as ServiceWorkerGlobalScope;

    fetchMediaHandler.call(mockServiceWorker, event);

    expect(respondWith).toHaveBeenCalledOnce();
    expect(respondWith).toHaveBeenCalledWith(expect.any(Promise));
  });

  it("does not call event.respondWith when URL does not match pattern", () => {
    const url = "https://example.com/api/other/resource";
    const request = new Request(url);

    const respondWith = vi.fn();
    const event = {
      request,
      respondWith,
    } as unknown as FetchEvent;

    const mockServiceWorker = {
      addEventListener: vi.fn(),
    } as unknown as ServiceWorkerGlobalScope;

    fetchMediaHandler.call(mockServiceWorker, event);

    expect(respondWith).not.toHaveBeenCalled();
  });

  it("does not call event.respondWith for non-media API paths", () => {
    const url = "https://example.com/api/tracks";
    const request = new Request(url);

    const respondWith = vi.fn();
    const event = {
      request,
      respondWith,
    } as unknown as FetchEvent;

    const mockServiceWorker = {
      addEventListener: vi.fn(),
    } as unknown as ServiceWorkerGlobalScope;

    fetchMediaHandler.call(mockServiceWorker, event);

    expect(respondWith).not.toHaveBeenCalled();
  });

  it("extracts CUID correctly from the URL", () => {
    const cuid = "cuid_abc123xyz";
    const url = `https://example.com/api/media/${cuid}`;
    const request = new Request(url);

    const respondWith = vi.fn();
    const event = {
      request,
      respondWith,
    } as unknown as FetchEvent;

    const mockServiceWorker = {
      addEventListener: vi.fn(),
    } as unknown as ServiceWorkerGlobalScope;

    fetchMediaHandler.call(mockServiceWorker, event);

    expect(respondWith).toHaveBeenCalledOnce();
    expect(respondWith).toHaveBeenCalledWith(expect.any(Promise));
  });

  it("does not match URL with additional path segments after cuid", () => {
    const url = "https://example.com/api/media/cuid_123/extra";
    const request = new Request(url);

    const respondWith = vi.fn();
    const event = {
      request,
      respondWith,
    } as unknown as FetchEvent;

    const mockServiceWorker = {
      addEventListener: vi.fn(),
    } as unknown as ServiceWorkerGlobalScope;

    fetchMediaHandler.call(mockServiceWorker, event);

    expect(respondWith).not.toHaveBeenCalled();
  });

  it("handles URLs with query parameters", () => {
    const cuid = "cuid_query123";
    const url = `https://example.com/api/media/${cuid}?param=value`;
    const request = new Request(url);

    const respondWith = vi.fn();
    const event = {
      request,
      respondWith,
    } as unknown as FetchEvent;

    const mockServiceWorker = {
      addEventListener: vi.fn(),
    } as unknown as ServiceWorkerGlobalScope;

    fetchMediaHandler.call(mockServiceWorker, event);

    expect(respondWith).toHaveBeenCalledOnce();
    expect(respondWith).toHaveBeenCalledWith(expect.any(Promise));
  });
});

describe("handleMediaRequest", () => {
  it("delegates non-GET requests to the network", async () => {
    const request = new Request("https://example.com/api/media/cuid_1", {
      method: "POST",
    });
    const event = { request } as FetchEvent;
    const fetchMock = stubFetch(() => Promise.resolve(new Response("ok")));

    const response = await handleMediaRequest(event, "cuid_1");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(request);
    await expect(response.text()).resolves.toBe("ok");
  });

  it("serves range requests from cached full responses", async () => {
    const request = new Request("https://example.com/api/media/cuid_2", {
      headers: { Range: "bytes=0-10" },
    });
    const event = { request } as FetchEvent;
    const cacheMatch = vi.fn(() => Promise.resolve(new Response("full")));
    const cachePut = vi.fn(() => Promise.resolve(undefined));
    const cachesOpen = stubCacheStorage({ match: cacheMatch, put: cachePut });
    const fetchMock = stubFetch(() => Promise.resolve(new Response("network")));
    const createPartialResponseMock = vi.mocked(createPartialResponse);
    createPartialResponseMock.mockResolvedValue(
      new Response("partial", { status: 206 }),
    );

    const response = await handleMediaRequest(event, "cuid_2");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(cachesOpen).toHaveBeenCalledOnce();
    expect(cacheMatch).toHaveBeenCalledOnce();
    const matchedRequest = (
      cacheMatch.mock.calls as unknown as Array<[Request, CacheQueryOptions?]>
    )[0]?.[0];
    expect(matchedRequest).toBeInstanceOf(Request);
    expect(matchedRequest.headers.has("range")).toBe(false);
    await expect(response.text()).resolves.toBe("partial");
  });

  it("fetches and caches full responses on range cache miss", async () => {
    const request = new Request("https://example.com/api/media/cuid_3", {
      headers: { Range: "bytes=0-10" },
    });
    const event = { request } as FetchEvent;
    const cacheMatch = vi.fn(() => Promise.resolve(undefined));
    const cachePut = vi.fn(() => Promise.resolve(undefined));
    const cachesOpen = stubCacheStorage({ match: cacheMatch, put: cachePut });
    const fetchMock = stubFetch(() =>
      Promise.resolve(new Response("full", { status: 200 })),
    );
    const createPartialResponseMock = vi.mocked(createPartialResponse);
    createPartialResponseMock.mockResolvedValue(
      new Response("partial", { status: 206 }),
    );

    const response = await handleMediaRequest(event, "cuid_3");

    expect(cachesOpen).toHaveBeenCalledTimes(2);
    expect(cacheMatch).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledOnce();
    const fetchedRequest = fetchMock.mock.calls[0][0] as Request;
    expect(fetchedRequest.headers.has("range")).toBe(false);
    expect(cachePut).toHaveBeenCalledOnce();
    const cachedRequest = (
      cachePut.mock.calls as unknown as Array<[Request, Response]>
    )[0]?.[0];
    expect(cachedRequest).toBeInstanceOf(Request);
    expect(cachedRequest.headers.has("range")).toBe(false);
    await expect(response.text()).resolves.toBe("partial");
  });
});

describe("MEDIA_URL_PATTERN", () => {
  it("matches valid /api/media/{cuid} paths", () => {
    expect(MEDIA_URL_PATTERN.test("/api/media/cuid_123")).toBe(true);
    expect(MEDIA_URL_PATTERN.test("/api/media/abc123xyz")).toBe(true);
    expect(MEDIA_URL_PATTERN.test("/api/media/test_id_456")).toBe(true);
  });

  it("does not match paths with additional segments", () => {
    expect(MEDIA_URL_PATTERN.test("/api/media/cuid_123/extra")).toBe(false);
    expect(MEDIA_URL_PATTERN.test("/api/media/cuid_123/metadata")).toBe(false);
  });

  it("does not match paths missing the cuid", () => {
    expect(MEDIA_URL_PATTERN.test("/api/media/")).toBe(false);
    expect(MEDIA_URL_PATTERN.test("/api/media")).toBe(false);
  });

  it("does not match other API paths", () => {
    expect(MEDIA_URL_PATTERN.test("/api/tracks")).toBe(false);
    expect(MEDIA_URL_PATTERN.test("/api/albums")).toBe(false);
    expect(MEDIA_URL_PATTERN.test("/media/cuid_123")).toBe(false);
  });

  it("extracts cuid from matching paths", () => {
    const match = "/api/media/cuid_test123".match(MEDIA_URL_PATTERN);
    expect(match).not.toBeNull();
    expect(match?.[1]).toBe("cuid_test123");
  });
});
