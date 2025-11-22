import path from "node:path";

import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import type { Request, Response } from "express";

import { ApiController } from "./api.controller";
import { ApiService } from "./api.service";
import { ApiResolver } from "./api.resolver";
import { PrismaModule } from "../db/prisma.module";
import { AuthController } from "./auth/auth.controller";
import { OidcService } from "../oidc/oidc.service";
import { AuthGuard } from "../common/guards/auth.guard";
import { AdminGuard } from "../common/guards/admin.guard";
import { GraphqlAuthGuard } from "../common/guards/graphql-auth.guard";
import { UserResolver } from "./user/user.resolver";
import { type AppConfig } from "src/config/definitions/app.config";
import { MediaController } from "./media/media.controller";
import { MediaService } from "./media/media.service";

@Module({
  imports: [
    PrismaModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.getOrThrow<AppConfig>("app").isProd;
        return {
          driver: ApolloDriver,
          graphiql: !isProd,
          introspection: true,
          path: "/api/graphql",
          context: ({ req, res }: { req: Request; res: Response }) => ({
            req,
            res,
          }),
          autoSchemaFile: isProd
            ? true
            : path.resolve(process.cwd(), "src/api/schema.gql"),
          sortSchema: true,
        };
      },
    }),
  ],
  controllers: [ApiController, AuthController, MediaController],
  providers: [
    ApiService,
    ApiResolver,
    UserResolver,
    OidcService,
    AuthGuard,
    AdminGuard,
    GraphqlAuthGuard,
    MediaService,
  ],
  exports: [AuthGuard, AdminGuard, GraphqlAuthGuard],
})
export class ApiModule {}
