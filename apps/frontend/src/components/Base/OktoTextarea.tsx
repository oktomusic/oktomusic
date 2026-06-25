import React from "react";
import { Field } from "@base-ui/react/field";

export type OktoTextareaProps = Omit<Field.Control.Props, "render"> &
  React.ComponentPropsWithoutRef<"textarea">;

export const OktoTextarea = function OktoTextArea({
  ref: forwardedRef,
  ...props
}: OktoTextareaProps & { ref?: React.RefObject<HTMLTextAreaElement | null> }) {
  return (
    <Field.Control
      {...props}
      ref={forwardedRef}
      render={<textarea />}
      className={`resize-none rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-2 focus:-outline-offset-2 focus:outline-white/25 disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
};
