import { type PlaylistBasic } from "../../api/graphql/gql/graphql";
import coverPlaceHolder from "../../assets/pip-cover-placeholder.svg";
import { ListCard } from "../ListCard/ListCard";

interface PlaylistCardListProps {
  readonly playlists: readonly PlaylistBasic[];
}

export function PlaylistCardList(props: PlaylistCardListProps) {
  return (
    <div className="flex w-full flex-row flex-wrap gap-4">
      {props.playlists.map((playlist) => (
        <ListCard
          key={playlist.id}
          link={`/playlist/${playlist.id}`}
          cover={coverPlaceHolder}
          title={playlist.name}
          users={[
            {
              id: playlist.creator.id,
              username: playlist.creator.username,
            },
          ]}
        />
      ))}
    </div>
  );
}
