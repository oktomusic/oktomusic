import { Album } from "../../api/graphql/gql/graphql";
import { ListCard } from "../ListCard/ListCard";

interface AlbumCardListProps {
  readonly albums: Omit<Album, "tracksByDisc">[];
}

export function AlbumCardList(props: AlbumCardListProps) {
  return (
    <div className="flex w-full flex-row flex-wrap gap-4">
      {props.albums.map((album) => (
        <ListCard
          key={album.id}
          link={`/album/${album.id}`}
          cover={[album.id] as const}
          title={album.name}
          artists={album.artists}
          year={album.date?.getFullYear()}
        />
      ))}
    </div>
  );
}
