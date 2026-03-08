import { Button } from "@headlessui/react";

export function OktoButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <Button
      {...props}
      className={
        "rounded-lg bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700 data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25" +
        ` ${props.className ?? ""}`
      }
    >
      {props.children}
    </Button>
  );
}
