import { Slider } from "@base-ui/react/slider";

import "./OktoSlider.css";

interface OktoSliderProps {
  readonly id: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly isLoading?: boolean;
  readonly "aria-describedby"?: string;
  readonly className?: string;
  readonly "aria-label"?: string;
}

export function OktoSlider(props: OktoSliderProps) {
  const loading = props.isLoading ?? false;

  return (
    <Slider.Root
      value={props.value}
      min={props.min}
      max={props.max}
      step={props.step}
      thumbAlignment="edge-client-only"
      onValueChange={(value) => props.onChange(value)}
      className={"w-full"}
    >
      <Slider.Control
        className={
          "flex w-full cursor-pointer touch-none items-center py-3 select-none"
        }
      >
        <Slider.Track
          className={
            // full track (unfilled) — match old native input background
            "h-1 w-full rounded-lg select-none" +
            (loading ? " bg-zinc-700" : " bg-zinc-700") // TODO: implement a better loading style, maybe with an animated gradient or something
          }
        >
          <Slider.Indicator
            className={
              // filled portion — use accent color like old input's accent-zinc-400
              "h-1 rounded-lg bg-zinc-400 select-none"
            }
          />
          <Slider.Thumb
            aria-label={props["aria-label"] ?? "Slider"}
            className={
              // thumb: small white circle with subtle ring matching track
              "size-4 rounded-full bg-white ring-1 ring-zinc-700 select-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            }
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
