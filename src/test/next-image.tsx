import type { ImgHTMLAttributes } from "react";

type ImageSource = string | { src: string };
type MockImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src: ImageSource;
  alt: string;
  fill?: boolean;
  preload?: boolean;
};

export default function MockImage({
  src,
  alt,
  fill: _fill,
  preload: _preload,
  ...props
}: MockImageProps) {
  return <img src={typeof src === "string" ? src : src.src} alt={alt} {...props} />;
}
