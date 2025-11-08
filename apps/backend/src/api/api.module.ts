import path from "node:path";

import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";

import { ApiController } from "./api.controller";
import { ApiService } from "./api.service";
import { ApiResolver } from "./api.resolver";
import { PrismaModule } from "../db/prisma.module";
import { AuthController } from "./auth/auth.controller";
import { OidcService } from "../oidc/oidc.service";
import { AuthGuard } from "../common/guards/auth.guard";
import { AdminGuard } from "../common/guards/admin.guard";

@Module({
  imports: [
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      introspection: true,
      path: "/api/graphql",
      autoSchemaFile: path.join(__dirname, "schema.gql"),
      sortSchema: true,
    }),
  ],
  controllers: [ApiController, AuthController],
  providers: [ApiService, ApiResolver, OidcService, AuthGuard, AdminGuard],
  exports: [AuthGuard, AdminGuard],
})
export class ApiModule {}
