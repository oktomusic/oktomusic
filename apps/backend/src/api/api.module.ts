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
import { GraphqlAdminGuard } from "../common/guards/graphql-admin.guard";
import { UserResolver } from "./user/user.resolver";
import { UserService } from "./user/user.service";
import { type AppConfig } from "src/config/definitions/app.config";
import { MediaController } from "./media/media.controller";
import { MediaService } from "./media/media.service";
import { BullmqModule } from "../bullmq/bullmq.module";
import { IndexingResolver } from "./indexing/indexing.resolver";
import { IndexingService } from "./indexing/indexing.service";
import { AlbumService } from "./album/album.service";
import { AlbumController } from "./album/album.controller";
import { MusicResolver } from "./music/music.resolver";
import { MusicService } from "./music/music.service";

@Module({
  imports: [
    PrismaModule,
    BullmqModule,
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
          subscriptions: {
            "graphql-ws": true,
          },
        };
      },
    }),
  ],
  controllers: [
    ApiController,
    AuthController,
    MediaController,
    AlbumController,
  ],
  providers: [
    ApiService,
    ApiResolver,
    UserResolver,
    UserService,
    IndexingResolver,
    MusicResolver,
    OidcService,
    AuthGuard,
    AdminGuard,
    GraphqlAuthGuard,
    GraphqlAdminGuard,
    MediaService,
    AlbumService,
    IndexingService,
    MusicService,
  ],
  exports: [AuthGuard, AdminGuard, GraphqlAuthGuard, GraphqlAdminGuard],
})
export class ApiModule {}
