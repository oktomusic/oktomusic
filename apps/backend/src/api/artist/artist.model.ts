import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType("Artist")
export class ArtistModel {
  @Field()
  id!: string;

  @Field()
  name!: string;
}
