import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { GraphQLISODateTime } from "@nestjs/graphql";

import { Role, Sex } from "../../generated/prisma";

registerEnumType(Role, { name: "Role" });
registerEnumType(Sex, { name: "Sex" });

@ObjectType("User")
export class UserModel {
  @Field()
  id!: string;

  @Field()
  username!: string;

  @Field()
  oidcSub!: string;

  @Field(() => Role)
  role!: Role;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;

  @Field(() => Sex, { nullable: true })
  sex!: Sex | null;
}
