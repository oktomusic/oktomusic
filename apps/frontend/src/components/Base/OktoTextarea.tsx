import type { InputHTMLAttributes } from "react";

interface OktoTextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  readonly className?: string;
}

export function OktoTextarea(props: OktoTextareaProps) {
  const { className, ...rest } = props;

  return (
    <textarea
      {...rest}
      className={`resize-none rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-2 focus:-outline-offset-2 focus:outline-white/25 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
    />
  );
}
