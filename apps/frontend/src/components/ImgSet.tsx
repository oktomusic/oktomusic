import { forwardRef } from "react";

type BaseImgProps = Omit<React.ComponentProps<"img">, "src" | "srcSet">;

interface ImgSetImages {
  readonly "1x": string;
  readonly [key: `${number}x`]: string;
}

export type ImgSetProps = BaseImgProps & {
  readonly images: ImgSetImages;
};

const ImgSet = forwardRef<HTMLImageElement, ImgSetProps>(function ImgSet(
  { images, ...rest },
  ref,
) {
  const srcSet = Object.entries(images)
    .map(([key, url]) => `${url} ${key}`)
    .join(", ");
  return <img ref={ref} src={images["1x"]} srcSet={srcSet} {...rest} />;
});

export default ImgSet;
