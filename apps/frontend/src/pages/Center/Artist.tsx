import { useParams } from "react-router";

export function Artist() {
  const { cuid } = useParams();

  return <div>Artist: {cuid}</div>;
}
