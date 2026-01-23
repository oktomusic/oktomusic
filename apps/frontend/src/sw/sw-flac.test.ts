import { afterEach, describe, expect, it, vi } from "vitest";

import { getOPFSFileResponse } from "./sw-flac";

type StorageDirectoryHandleLike = {
  readonly getDirectoryHandle: (name: string) => Promise<unknown>;
};

type FileSystemFileHandleLike = {
  readonly getFile: () => Promise<File>;
};

type StorageDirectoryHandleFilesLike = {
  readonly getFileHandle: (name: string) => Promise<unknown>;
};

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
