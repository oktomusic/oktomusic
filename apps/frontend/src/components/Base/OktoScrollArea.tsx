import type { ReactElement, ReactNode } from "react";

import { ScrollArea } from "@base-ui/react/scroll-area";

import "./OktoScrollArea.css";

interface OktoScrollAreaProps {
  readonly render?: ReactElement;
  readonly id?: string;
  readonly className?: string;
  readonly noMargin?: boolean;
  readonly children: ReactNode;
}

export function OktoScrollArea(props: OktoScrollAreaProps) {
  return (
    <ScrollArea.Root
      id={props.id}
      className={`oktoscrollarea__root${props.className ? ` ${props.className}` : ""}`}
      render={props.render}
    >
      <ScrollArea.Viewport className={"oktoscrollarea__viewport"}>
        <ScrollArea.Content className={"oktoscrollarea__content"}>
          {props.children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className={
          "oktoscrollarea__scrollbar" +
          (props.noMargin ? " oktoscrollarea__scrollbar--no-margin" : "")
        }
        orientation="vertical"
      >
        <ScrollArea.Thumb
          className={
            "oktoscrollarea__scrollbar__thumb" +
            (props.noMargin
              ? " oktoscrollarea__scrollbar__thumb--no-margin"
              : "")
          }
        />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
