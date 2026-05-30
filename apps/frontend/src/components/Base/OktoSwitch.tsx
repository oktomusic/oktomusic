import { Switch, SwitchRootProps } from "@base-ui/react/switch";

export function OktoSwitch(props: SwitchRootProps) {
  return (
    <Switch.Root
      {...props}
      className="inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 transition data-checked:bg-blue-700 data-disabled:cursor-not-allowed"
    >
      <Switch.Thumb className="size-4 translate-x-1 rounded-full bg-zinc-200 transition data-checked:translate-x-6" />
    </Switch.Root>
  );
}
