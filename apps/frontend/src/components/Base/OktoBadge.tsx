type OktoBadgeColor = "green" | "blue" | "red" | "yellow";

interface OktoBadgeProps {
  readonly color: OktoBadgeColor;
  readonly children: React.ReactNode;
}

const colorClasses: Readonly<Record<OktoBadgeColor, string>> = {
  green: "bg-green-400/20 text-green-400 inset-ring-green-500/30",
  blue: "bg-blue-400/20 text-blue-400 inset-ring-blue-500/30",
  red: "bg-red-400/20 text-red-400 inset-ring-red-500/30",
  yellow: "bg-yellow-400/20 text-yellow-400 inset-ring-yellow-500/30",
};

export function OktoBadge(props: OktoBadgeProps) {
  return (
    <span
      className={
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium inset-ring" +
        " " +
        colorClasses[props.color]
      }
    >
      {props.children}
    </span>
  );
}
