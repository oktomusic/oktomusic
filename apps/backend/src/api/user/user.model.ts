import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { GraphQLISODateTime } from "@nestjs/graphql";

import { Role } from "../../generated/prisma";

registerEnumType(Role, { name: "Role" });

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
}
