import { Field, InputType } from "@nestjs/graphql";

import { Sex } from "../../../generated/prisma";

@InputType()
export class UpdateUserProfileInput {
  @Field(() => Sex, {
    nullable: true,
    description: "User sex chosen during profile setup",
  })
  sex?: Sex | null;
}
