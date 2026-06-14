import { Field, InputType } from "@nestjs/graphql";

import { LibraryItemType } from "../library.model";

@InputType()
export class LibraryItemRefInput {
  @Field(() => LibraryItemType)
  itemType!: LibraryItemType;

  @Field()
  itemId!: string;
}
