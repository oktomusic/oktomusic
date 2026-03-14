import { useParams } from "react-router";

export function User() {
  const { cuid } = useParams();

  return <div>{cuid}</div>;
}
