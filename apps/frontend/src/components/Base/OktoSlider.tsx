import type { ChangeEvent } from "react";

interface OktoSliderProps {
  readonly id: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly "aria-describedby"?: string;
  readonly showOutput?: boolean;
  readonly formatOutput?: (value: number) => string;
  readonly className?: string;
}

export function OktoSlider(props: OktoSliderProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(event.target.value);
    if (!Number.isNaN(value)) {
      props.onChange(value);
    }
  };

  const outputId = `${props.id}:output`;
  const formattedValue = props.formatOutput
    ? props.formatOutput(props.value)
    : props.value.toString();

  return (
    <div
      className={
        "flex items-center gap-3" +
        (props.className ? ` ${props.className}` : "")
      }
    >
      <input
        id={props.id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={handleChange}
        aria-describedby={props["aria-describedby"]}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {props.showOutput && (
        <output
          id={outputId}
          htmlFor={props.id}
          aria-live="polite"
          className="min-w-12 text-sm text-white"
        >
          {formattedValue}
        </output>
      )}
    </div>
  );
}
