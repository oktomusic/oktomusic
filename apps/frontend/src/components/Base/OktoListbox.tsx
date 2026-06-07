import { Select } from "@base-ui/react/select";
import { LuCheck, LuChevronDown } from "react-icons/lu";

export interface OktoListboxOption {
  readonly label: string;
  readonly icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | string;
}

export interface OktoListboxItem<T extends string> extends OktoListboxOption {
  readonly value: T;
}

export interface OktoListboxProps<T extends string> {
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly options: readonly OktoListboxItem<T>[];
  readonly disabled?: boolean;
  readonly id?: string;
  readonly "aria-describedby"?: string;
  readonly className?: string;
}

export function OktoListbox<T extends string>(props: OktoListboxProps<T>) {
  const handleValueChange = (value: T | null) => {
    if (value === null) {
      return;
    }

    props.onChange(value);
  };

  return (
    <Select.Root
      value={props.value}
      onValueChange={handleValueChange}
      disabled={props.disabled}
    >
      <Select.Trigger
        id={props.id}
        className={
          "relative flex h-9 min-w-44 items-center justify-between gap-2 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm/6 text-white focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/25 disabled:cursor-not-allowed disabled:opacity-50 data-focused:outline-2 data-focused:-outline-offset-2 data-focused:outline-white/25" +
          (props.className ? ` ${props.className}` : "")
        }
        aria-describedby={props["aria-describedby"]}
      >
        <Select.Value className="flex min-w-0 items-center gap-2">
          {(value: T | null) => {
            if (value === null) {
              return null;
            }

            const option = props.options.find((item) => item.value === value);

            if (!option) {
              return null;
            }

            const Icon = option.icon;

            return (
              <>
                {Icon && <Icon className="size-4 shrink-0" />}
                {option.label}
              </>
            );
          }}
        </Select.Value>
        <Select.Icon>
          <LuChevronDown className="size-4 shrink-0" aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          alignItemWithTrigger={false}
          side="bottom"
          align="start"
          sideOffset={4}
          className="z-100"
        >
          <Select.Popup className="w-(--anchor-width) rounded-xl bg-zinc-800 p-1 text-white transition duration-100 ease-in focus:outline-none data-ending-style:opacity-0 data-starting-style:opacity-0">
            <Select.List className="max-h-(--available-height) w-full scrollbar-none overflow-y-auto">
              {props.options.map((option) => {
                const Icon = option.icon;

                return (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-sm/6 select-none data-highlighted:bg-white/10"
                  >
                    <Select.ItemIndicator
                      keepMounted
                      className="flex size-4 items-center justify-center"
                    >
                      <LuCheck className="invisible size-4 group-data-selected:visible" />
                    </Select.ItemIndicator>
                    {typeof Icon === "string" ? (
                      <img src={Icon} alt="" className="size-4 shrink-0" />
                    ) : Icon ? (
                      <Icon className="size-4 shrink-0" />
                    ) : null}
                    <Select.ItemText className="text-white">
                      {option.label}
                    </Select.ItemText>
                  </Select.Item>
                );
              })}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
