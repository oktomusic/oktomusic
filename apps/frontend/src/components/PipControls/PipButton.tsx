import { IconType } from "react-icons/lib";

interface PipButtonProps {
  readonly title: string;
  readonly icon: IconType;
}

export default function PipButton(props: PipButtonProps) {
  return (
    <button type="button" title={props.title} aria-label={props.title}>
      <props.icon className="size-6" />
    </button>
  );
}
