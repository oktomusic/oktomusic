import path from "node:path";

import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";

import { ApiController } from "./api.controller";
import { ApiService } from "./api.service";
import { ApiResolver } from "./api.resolver";
import { PrismaService } from "../db/prisma.service";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      // Explicitly enable introspection in all environments (including production)
      // This overrides Apollo Server's default behavior of disabling introspection when NODE_ENV=production
      introspection: true,
      path: "/api/graphql",
      autoSchemaFile: path.join(__dirname, "schema.gql"),
      sortSchema: true,
    }),
  ],
  controllers: [ApiController],
  providers: [ApiService, ApiResolver, PrismaService],
})
export class ApiModule {}
