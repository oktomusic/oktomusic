import type { ReactNode } from "react";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Link } from "react-router";

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
  readonly newTab?: boolean;
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

export type OktoMenuItem =
  | OktoMenuButtonItem
  | OktoMenuLinkItem
  | OktoMenuRouterLinkItem
  | OktoMenuSeparatorItem;

export interface OktoMenuProps {
  readonly button: ReactNode;
  readonly buttonClassName?: string;
  readonly buttonTitle?: string;
  readonly buttonAriaLabel?: string;
  readonly items: readonly OktoMenuItem[];
  readonly menuClassName?: string;
  readonly anchor?:
    | "top start"
    | "top end"
    | "right start"
    | "right end"
    | "bottom start"
    | "bottom end"
    | "left start"
    | "left end";
}

export function OktoMenu(props: OktoMenuProps) {
  return (
    <Menu>
      <MenuButton
        className={props.buttonClassName}
        title={props.buttonTitle}
        aria-label={props.buttonAriaLabel}
      >
        {props.button}
      </MenuButton>
      <MenuItems
        transition
        anchor={props.anchor || "bottom end"}
        className={`w-52 rounded-xl bg-zinc-800 p-1 text-sm/6 text-white transition duration-100 ease-in [--anchor-gap:--spacing(1)] focus:outline-none data-leave:data-closed:opacity-0 ${
          props.menuClassName ?? ""
        }`}
      >
        {props.items
          .filter((item) => !item.hidden)
          .map((item, index) => {
            if (item.type === "separator") {
              return (
                <div
                  key={`separator-${index}`}
                  role="separator"
                  className="my-1 h-px bg-white/5"
                />
              );
            }

            const icon = item.icon ? (
              <span
                className="flex size-4 items-center justify-center"
                aria-hidden="true"
              >
                {item.icon}
              </span>
            ) : null;

            const shortcut = item.shortcut ? (
              <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline">
                {item.shortcut}
              </kbd>
            ) : null;

            if (item.type === "link") {
              const targetValue = item.newTab ? "_blank" : item.target;
              const relValue =
                item.rel ??
                (targetValue === "_blank" ? "noreferrer" : undefined);
              const isDisabled = Boolean(item.disabled);

              return (
                <MenuItem key={`link-${index}`}>
                  <a
                    href={item.href}
                    target={targetValue}
                    rel={relValue}
                    className={`group flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-white select-none data-focus:bg-white/10 ${
                      isDisabled ? "pointer-events-none opacity-50" : ""
                    }`}
                    aria-disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : undefined}
                    onClick={
                      isDisabled
                        ? (event) => {
                            event.preventDefault();
                          }
                        : undefined
                    }
                  >
                    {icon}
                    {item.label}
                    {shortcut}
                  </a>
                </MenuItem>
              );
            }

            if (item.type === "router-link") {
              const isDisabled = Boolean(item.disabled);

              return (
                <MenuItem key={`router-link-${index}`}>
                  <Link
                    to={item.to}
                    className={`group flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-white select-none data-focus:bg-white/10 ${
                      isDisabled ? "pointer-events-none opacity-50" : ""
                    }`}
                    aria-disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : undefined}
                    onClick={
                      isDisabled
                        ? (event) => {
                            event.preventDefault();
                          }
                        : undefined
                    }
                  >
                    {icon}
                    {item.label}
                    {shortcut}
                  </Link>
                </MenuItem>
              );
            }

            return (
              <MenuItem key={`button-${index}`}>
                <button
                  type="button"
                  className="group flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-white select-none data-focus:bg-white/10"
                  onClick={item.onClick}
                  disabled={item.disabled}
                >
                  {icon}
                  {item.label}
                  {shortcut}
                </button>
              </MenuItem>
            );
          })}
      </MenuItems>
    </Menu>
  );
}
