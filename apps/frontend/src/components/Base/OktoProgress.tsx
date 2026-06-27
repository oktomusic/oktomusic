import { Progress } from "@base-ui/react/progress";

interface OktoProgressProps {
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly label: string;
  readonly valueLabel?: string;
  readonly className?: string;
}

export function OktoProgress(props: OktoProgressProps) {
  return (
    <Progress.Root
      className={`grid max-w-full grid-cols-2 gap-y-2 ${props.className || ""}`}
      min={props.min}
      max={props.max}
      value={props.value}
    >
      <Progress.Label className="text-sm font-normal">
        {props.label}
      </Progress.Label>
      <Progress.Value className="text-right text-sm">
        {() => props.valueLabel ?? `${props.value} / ${props.max}`}
      </Progress.Value>
      <Progress.Track className="col-span-2 h-2 overflow-hidden rounded-lg bg-zinc-700">
        <Progress.Indicator className="bg-zinc-400 transition-[width] duration-500" />
      </Progress.Track>
    </Progress.Root>
  );
}
