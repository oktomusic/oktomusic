import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { HiChevronDown, HiCheck } from "react-icons/hi2";

interface OktoListboxProps<T extends string> {
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly options: Record<T, string>;
  readonly disabled?: boolean;
  readonly id?: string;
  readonly "aria-describedby"?: string;
}

export function OktoListbox<T extends string>(props: OktoListboxProps<T>) {
  return (
    <Listbox
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled}
    >
      <ListboxButton
        id={props.id}
        aria-describedby={props["aria-describedby"]}
        className="relative flex min-w-32 items-center justify-between gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm/6 text-white focus:not-data-focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
      >
        {props.options[props.value]}
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
        {(Object.keys(props.options) as T[]).map((key) => (
          <ListboxOption
            key={key}
            value={key}
            className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
          >
            <HiCheck className="invisible size-4 fill-white group-data-selected:visible" />
            <div className="text-sm/6 text-white">{props.options[key]}</div>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
