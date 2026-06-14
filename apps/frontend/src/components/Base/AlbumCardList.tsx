import { ListCard } from "../ListCard/ListCard";

interface AlbumCardListArtist {
  readonly id: string;
  readonly name: string;
}

interface AlbumCardListAlbum {
  readonly id: string;
  readonly name: string;
  readonly date: Date | null;
  readonly artists: readonly AlbumCardListArtist[];
}

interface AlbumCardListProps {
  readonly albums: readonly AlbumCardListAlbum[];
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
