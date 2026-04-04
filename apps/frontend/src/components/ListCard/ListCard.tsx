import { useNavigate } from "react-router";

interface ArtistInfo {
  readonly id: string;
  readonly name: string;
}

interface UserInfo {
  readonly id: string;
  readonly username: string;
}

type ListCardPeopleProps =
  | {
      readonly artists: readonly ArtistInfo[];
      readonly users?: never;
    }
  | {
      readonly artists?: never;
      readonly users: readonly UserInfo[];
    };

type ListCardProps = ListCardPeopleProps & {
  readonly link: string;
  readonly cover: string;
  readonly title: string;
  readonly year?: number;
};

export function ListCard(props: ListCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    void navigate(props.link);
  };

  const handlePersonClick = (
    e: React.MouseEvent<HTMLSpanElement>,
    personId: string,
    routePrefix: "/artist/" | "/user/",
  ) => {
    e.stopPropagation();
    void navigate(`${routePrefix}${personId}`);
  };

  const isArtistList = props.artists !== undefined;
  const peopleRoutePrefix: "/artist/" | "/user/" = isArtistList
    ? "/artist/"
    : "/user/";
  const people: readonly { readonly id: string; readonly label: string }[] =
    isArtistList
      ? props.artists.map((artist) => ({ id: artist.id, label: artist.name }))
      : props.users.map((user) => ({ id: user.id, label: user.username }));

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
        {people.map((person, index) => (
          <span key={person.id ?? index}>
            <span
              onClick={(e) => handlePersonClick(e, person.id, peopleRoutePrefix)}
              className="cursor-pointer hover:underline"
              role="link"
            >
              {person.label}
            </span>
            {index < people.length - 1 && ", "}
          </span>
        ))}
      </p>
    </div>
  );
}
