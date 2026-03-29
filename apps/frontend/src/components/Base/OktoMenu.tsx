import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { Menu } from "@base-ui/react/menu";

export interface OktoMenuButtonItem {
  readonly type: "button";
  readonly hidden?: boolean;
  readonly label: string;
  readonly onClick: () => void;
  readonly icon?: ReactNode;
  readonly shortcut?: string;
  readonly disabled?: boolean;
}

export interface OktoMenuLinkItem {
  readonly type: "link";
  readonly hidden?: boolean;
  readonly label: string;
  readonly href: string;
  readonly target?: "_blank" | "_self" | "_parent" | "_top";
  readonly rel?: string;
  readonly icon?: ReactNode;
  readonly shortcut?: string;
  readonly disabled?: boolean;
}

export interface OktoMenuRouterLinkItem {
  readonly type: "router-link";
  readonly hidden?: boolean;
  readonly label: string;
  readonly to: string;
  readonly icon?: ReactNode;
  readonly shortcut?: string;
  readonly disabled?: boolean;
}

export interface OktoMenuSeparatorItem {
  readonly type: "separator";
  readonly hidden?: boolean;
}

export interface OktoMenuSubmenuItem {
  readonly type: "submenu";
  readonly hidden?: boolean;
  readonly component: ReactNode;
}

export type OktoMenuItem =
  | OktoMenuButtonItem
  | OktoMenuLinkItem
  | OktoMenuRouterLinkItem
  | OktoMenuSeparatorItem
  | OktoMenuSubmenuItem;

export interface OktoMenuProps {
  readonly button: ReactNode;
  readonly buttonClassName?: string;
  readonly buttonTitle?: string;
  readonly buttonAriaLabel?: string;
  readonly items: readonly OktoMenuItem[];
  readonly menuClassName?: string;
  readonly positionAlign?: "start" | "center" | "end";
  readonly positionSide?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "inline-end"
    | "inline-start";
}

export function OktoMenuButton(props: OktoMenuButtonItem) {
  return (
    <Menu.Item
      role="button"
      onClick={props.onClick}
      className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-white select-none focus:outline-0 data-highlighted:bg-white/10"
    >
      {props.icon}
      <span>{props.label}</span>
      {props.shortcut && (
        <kbd className="ml-auto font-sans text-xs text-white/50">
          {props.shortcut}
        </kbd>
      )}
    </Menu.Item>
  );
}

export function OktoMenuLink(props: OktoMenuLinkItem) {
  return (
    <Menu.LinkItem
      href={props.href}
      target={props.target}
      rel={props.rel}
      className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-white select-none focus:outline-0 data-highlighted:bg-white/10"
    >
      {props.icon && <span>{props.icon}</span>}
      <span>{props.label}</span>
      {props.shortcut && (
        <kbd className="ml-auto font-sans text-xs text-white/50">
          {props.shortcut}
        </kbd>
      )}
    </Menu.LinkItem>
  );
}

export function OktoMenuRouterLink(props: OktoMenuRouterLinkItem) {
  return (
    <Menu.Item className="group focus:outline-0">
      {(() => {
        const isDisabled = Boolean(props.disabled);
        return (
          <Link
            to={props.to}
            className={`flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-white select-none group-data-highlighted:bg-white/10 focus:outline-0 ${
              isDisabled ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={isDisabled}
            tabIndex={isDisabled ? -1 : undefined}
            onClick={isDisabled ? (e) => e.preventDefault() : undefined}
          >
            {props.icon && <span>{props.icon}</span>}
            <span>{props.label}</span>
            {props.shortcut && (
              <kbd className="ml-auto font-sans text-xs text-white/50">
                {props.shortcut}
              </kbd>
            )}
          </Link>
        );
      })()}
    </Menu.Item>
  );
}

export function OktoMenuSeparator() {
  return <Menu.Separator className="my-1 h-px bg-white/15" />;
}

export function OktoMenu(props: OktoMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className={props.buttonClassName}
        title={props.buttonTitle}
        aria-label={props.buttonAriaLabel}
      >
        {props.button}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Backdrop />
        <Menu.Positioner
          align={props.positionAlign || "start"}
          side={props.positionSide || "bottom"}
        >
          <Menu.Viewport>
            <Menu.Popup
              className={`mt-2 w-52 rounded-xl bg-zinc-800 p-1 text-sm/6 text-white transition duration-100 ease-in [--anchor-gap:--spacing(1)] focus:outline-none data-leave:data-closed:opacity-0 ${
                props.menuClassName ?? ""
              }`}
            >
              {props.items
                .filter((item) => !item.hidden)
                .map((item, index) => {
                  switch (item.type) {
                    case "button":
                      return <OktoMenuButton key={index} {...item} />;
                    case "link":
                      return <OktoMenuLink key={index} {...item} />;
                    case "router-link":
                      return <OktoMenuRouterLink key={index} {...item} />;
                    case "separator":
                      return <OktoMenuSeparator key={index} />;
                    case "submenu":
                      return <Fragment key={index}>{item.component}</Fragment>;
                  }
                })}
            </Menu.Popup>
          </Menu.Viewport>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
