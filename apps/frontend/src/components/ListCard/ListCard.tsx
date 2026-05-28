import { useNavigate } from "react-router";

import { Cover } from "../Base/Cover";
import type { CoverImages } from "../Base/CoverImages";

interface ArtistInfo {
  readonly id: string;
  readonly name: string;
}

interface UserInfo {
  readonly id: string;
  readonly username: string;
}

interface ListCardBaseProps {
  readonly link: string;
  readonly cover: CoverImages;
  readonly title: string;
  readonly year?: number;
}

interface ListCardArtistsProps extends ListCardBaseProps {
  readonly artists: readonly ArtistInfo[];
  readonly users?: never;
}

interface ListCardUsersProps extends ListCardBaseProps {
  readonly artists?: never;
  readonly users: readonly UserInfo[];
}

type ListCardProps = ListCardArtistsProps | ListCardUsersProps;

export function ListCard(props: ListCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    void navigate(props.link);
  };

  const isArtistList = props.artists !== undefined;
  const peopleRoutePrefix: "/artist/" | "/user/" = isArtistList
    ? "/artist/"
    : "/user/";
  const people: readonly { readonly id: string; readonly label: string }[] =
    isArtistList
      ? props.artists.map((artist) => ({ id: artist.id, label: artist.name }))
      : props.users.map((user) => ({ id: user.id, label: user.username }));
  const hasMeta = props.year !== undefined || people.length > 0;

  return (
    <div
      onClick={handleCardClick}
      className="group h-72 w-50 max-w-min cursor-pointer rounded-lg bg-zinc-800 p-3"
      role="link"
    >
      <Cover
        imgs={props.cover}
        size={256}
        alt={props.title}
        className="mb-2 size-44 rounded-lg"
        loading="lazy"
        fetchPriority="low"
      />
      <h3 className="mb-1 line-clamp-2 font-semibold">{props.title}</h3>
      {hasMeta ? (
        <p className="line-clamp-2 text-sm text-zinc-400">
          {props.year ? <span>{props.year} • </span> : null}
          {people.map((person, index) => (
            <span key={person.id ?? index}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void navigate(`${peopleRoutePrefix}${person.id}`);
                }}
                className="cursor-pointer hover:underline"
                role="link"
              >
                {person.label}
              </button>
              {index < people.length - 1 && ", "}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
