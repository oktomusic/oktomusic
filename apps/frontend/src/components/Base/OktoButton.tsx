import type { ButtonHTMLAttributes } from "react";

import { Button } from "@base-ui/react/button";

export function OktoButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...props}
      className={
        "cursor-pointer rounded-lg bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/25" +
        ` ${props.className ?? ""}`
      }
    >
      {props.children}
    </Button>
  );
}
