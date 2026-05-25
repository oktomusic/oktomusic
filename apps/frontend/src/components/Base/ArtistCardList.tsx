import { type Artist } from "../../api/graphql/gql/graphql";
import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import { ListCard } from "../ListCard/ListCard";

interface ArtistCardListProps {
  readonly artists: readonly Artist[];
}

export function ArtistCardList(props: ArtistCardListProps) {
  return (
    <div className="flex w-full flex-row flex-wrap gap-4">
      {props.artists.map((artist) => (
        <ListCard
          key={artist.id}
          link={`/artist/${artist.id}`}
          cover={coverPlaceHolder}
          title={artist.name}
          artists={[]}
        />
      ))}
    </div>
  );
}
