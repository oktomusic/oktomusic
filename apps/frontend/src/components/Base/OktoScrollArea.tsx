import { ScrollArea } from "@base-ui/react/scroll-area";

import "./OktoScrollArea.css";

interface OktoScrollAreaProps {
  readonly className?: string;
  readonly children: React.ReactNode;
}

export function OktoScrollArea(props: OktoScrollAreaProps) {
  return (
    <ScrollArea.Root
      className={`oktoscrollarea__root${props.className ? ` ${props.className}` : ""}`}
    >
      <ScrollArea.Viewport className={"oktoscrollarea__viewport"}>
        <ScrollArea.Content>{props.children}</ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className={"oktoscrollarea__scrollbar"}
        orientation="vertical"
      >
        <ScrollArea.Thumb className={"oktoscrollarea__scrollbar__thumb"} />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
