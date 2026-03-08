import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { IconType } from "react-icons/lib";
import { HiChevronDown, HiCheck } from "react-icons/hi2";

export interface OktoListboxOption {
  readonly label: string;
  readonly icon?: IconType;
}

export interface OktoListboxProps<T extends string> {
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly options: Record<T, OktoListboxOption | string>;
  readonly disabled?: boolean;
  readonly id?: string;
  readonly "aria-describedby"?: string;
  readonly className?: string;
}

export function OktoListbox<T extends string>(props: OktoListboxProps<T>) {
  const currentOption = props.options[props.value];
  const currentLabel =
    typeof currentOption === "string" ? currentOption : currentOption.label;
  const CurrentIcon = typeof currentOption !== "string" && currentOption.icon;

  return (
    <Listbox
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled}
    >
      <ListboxButton
        id={props.id}
        aria-describedby={props["aria-describedby"]}
        className={
          "relative flex h-9 min-w-44 items-center justify-between gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm/6 text-white focus:not-data-focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25" +
          (props.className ? ` ${props.className}` : "")
        }
      >
        <div className="flex items-center gap-2">
          {CurrentIcon && <CurrentIcon className="size-4" />}
          {currentLabel}
        </div>
        <HiChevronDown
          className="size-4 shrink-0 fill-white/60"
          aria-hidden="true"
        />
      </ListboxButton>
      <ListboxOptions
        anchor="bottom"
        transition
        className="w-(--button-width) rounded-xl bg-zinc-800 p-1 transition duration-100 ease-in [--anchor-gap:--spacing(1)] focus:outline-none data-leave:data-closed:opacity-0"
      >
        {(Object.keys(props.options) as T[]).map((key) => {
          const option = props.options[key];

          return (
            <ListboxOption
              key={key}
              value={key}
              className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
            >
              <HiCheck className="invisible size-4 fill-white group-data-selected:visible" />
              {typeof option !== "string" && option.icon && (
                <option.icon className="size-4" />
              )}
              <div className="text-sm/6 text-white">
                {typeof option === "string" ? option : option.label}
              </div>
            </ListboxOption>
          );
        })}
      </ListboxOptions>
    </Listbox>
  );
}
