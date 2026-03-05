import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class SearchAlbumsInput {
  @Field({
    nullable: true,
    description: "Filter by album name (case-insensitive partial match)",
  })
  name?: string;

  @Field({ nullable: true, description: "Filter by artist ID" })
  artistId?: string;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 50,
    description: "Maximum number of results",
  })
  limit?: number;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 0,
    description: "Number of results to skip",
  })
  offset?: number;
}
