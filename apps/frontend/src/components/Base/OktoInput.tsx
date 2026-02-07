import type { ChangeEvent } from "react";

interface OktoInputProps {
  readonly id: string;
  readonly type?: "text" | "number" | "email" | "password" | "tel" | "url";
  readonly value: string | number;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly "aria-describedby"?: string;
  readonly className?: string;
}

export function OktoInput(props: OktoInputProps) {
  return (
    <input
      id={props.id}
      type={props.type ?? "text"}
      value={props.value}
      onChange={props.onChange}
      min={props.min}
      max={props.max}
      step={props.step}
      disabled={props.disabled}
      placeholder={props.placeholder}
      aria-describedby={props["aria-describedby"]}
      className={`w-32 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}
