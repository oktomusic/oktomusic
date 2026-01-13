import { IconType } from "react-icons/lib";

interface PipButtonProps {
  readonly title: string;
  readonly disabled?: boolean;
  readonly icon: IconType;
}

export default function PipButton(props: PipButtonProps) {
  return (
    <button
      type="button"
      title={props.title}
      aria-label={props.title}
      disabled={props.disabled}
    >
      <props.icon className="size-6" />
    </button>
  );
}
