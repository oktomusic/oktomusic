import type { InputHTMLAttributes } from "react";
import { Input } from "@base-ui/react/input";

interface OktoInputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly className?: string;
}

export function OktoInput(props: OktoInputProps) {
  const { className, ...rest } = props;
  return (
    <Input
      {...rest}
      className={`h-9 w-32 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-2 focus:-outline-offset-2 focus:outline-white/25 data-disabled:cursor-not-allowed data-disabled:opacity-50 ${className ?? ""}`}
    />
  );
}
