import type { InputHTMLAttributes } from "react";
import { Input } from "@headlessui/react";

interface OktoInputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly className?: string;
}

export function OktoInput(props: OktoInputProps) {
  const { className, ...rest } = props;
  return (
    <Input
      {...rest}
      className={`h-9 w-32 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25 ${className ?? ""}`}
    />
  );
}
