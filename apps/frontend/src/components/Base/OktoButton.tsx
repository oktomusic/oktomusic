export function OktoButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      {...props}
      className={
        "rounded-lg bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700 focus:bg-zinc-700" +
        ` ${props.className ?? ""}`
      }
    >
      {props.children}
    </button>
  );
}
