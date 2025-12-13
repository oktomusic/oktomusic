import { describe, expect, it } from "vitest";

import { getMediaImages } from "./media_images";

describe("getMediaImages", () => {
  it("returns a list of cover images for common sizes", () => {
    const uuid = "any-id";
    const images = getMediaImages(uuid);

    expect(images).toHaveLength(7);

    for (const image of images) {
      expect(image.src).toContain(`/api/album/${uuid}/cover/`);
      expect(image.type).toBe("image/avif");
      expect(image.sizes).toMatch(/^\d+x\d+$/);
    }
  });
});
