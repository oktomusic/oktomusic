import { useNavigate } from "react-router";

interface ArtistInfo {
  readonly id: string;
  readonly name: string;
}

interface ListCardProps {
  readonly link: string;
  readonly cover: string;
  readonly title: string;
  readonly year?: number;
  readonly artists: ArtistInfo[];
}

export function ListCard(props: ListCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    void navigate(props.link);
  };

  const handleArtistClick = (
    e: React.MouseEvent<HTMLSpanElement>,
    artistId: string,
  ) => {
    e.stopPropagation();
    void navigate(`/artist/${artistId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group h-72 w-50 max-w-min cursor-pointer rounded-lg bg-zinc-800 p-3"
      role="link"
    >
      <div className="mb-2 size-44 rounded-lg">
        <img
          src={props.cover}
          alt={props.title}
          className="h-full w-full rounded-lg"
          loading="lazy"
          fetchPriority="low"
        />
      </div>
      <h3 className="mb-1 line-clamp-2 font-semibold">{props.title}</h3>
      <p className="line-clamp-2 text-sm text-zinc-400">
        {props.year ? <span>{props.year} • </span> : null}
        {props.artists.map((artist, index) => (
          <span key={artist.id ?? index}>
            <span
              onClick={(e) => handleArtistClick(e, artist.id)}
              className="cursor-pointer hover:underline"
              role="link"
            >
              {artist.name}
            </span>
            {index < (props.artists.length ?? 0) - 1 && ", "}
          </span>
        ))}
      </p>
    </div>
  );
}
