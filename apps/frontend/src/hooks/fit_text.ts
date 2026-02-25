import { useLayoutEffect, type RefObject } from "react";

const DEFAULT_FONT_SIZES_REM = [4.5, 3.75, 3, 2.25, 1.875, 1.5] as const;

function fitText(
  container: HTMLElement,
  content: HTMLElement,
  target: HTMLElement,
  fontSizesRem: readonly number[],
) {
  const maxHeight = container.clientHeight;

  const clone = content.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.visibility = "hidden";
  clone.style.width = `${container.clientWidth}px`;
  container.appendChild(clone);

  const cloneTarget = clone.querySelector(
    target.tagName.toLowerCase(),
  ) as HTMLElement;
  let sizeIndex = fontSizesRem.length - 1;

  for (let i = 0; i < fontSizesRem.length; i++) {
    cloneTarget.style.fontSize = `${fontSizesRem[i]}rem`;
    if (clone.offsetHeight <= maxHeight) {
      sizeIndex = i;
      break;
    }
  }

  clone.remove();
  target.style.fontSize = `${fontSizesRem[sizeIndex]}rem`;
}

/**
 * Automatically scales the font size of a target element to fit within a
 * container, stepping down through fixed rem sizes until the content fits.
 *
 * @param containerRef - The element whose height constrains the content.
 * @param contentRef - The wrapper element whose height is measured against the container.
 * @param targetRef - The element whose `fontSize` will be adjusted.
 * @param fontSizesRem - Descending list of font sizes in rem to try. Defaults to `[4.5, 3.75, 3, 2.25, 1.875, 1.5]`.
 */
export function useFitText(
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
  fontSizesRem: readonly number[] = DEFAULT_FONT_SIZES_REM,
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const target = targetRef.current;
    if (!container || !content || !target) return;

    fitText(container, content, target, fontSizesRem);

    const observer = new ResizeObserver(() => {
      fitText(container, content, target, fontSizesRem);
    });
    observer.observe(container);

    return () => observer.disconnect();
  });
}
