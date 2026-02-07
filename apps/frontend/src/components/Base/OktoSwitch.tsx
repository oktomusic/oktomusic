import { Switch, SwitchProps } from "@headlessui/react";

export function OktoSwitch(props: SwitchProps<"button">) {
  return (
    <Switch
      {...props}
      className="group inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 transition data-checked:bg-blue-700"
    >
      <span className="size-4 translate-x-1 rounded-full bg-zinc-200 transition group-data-checked:translate-x-6" />
    </Switch>
  );
}
