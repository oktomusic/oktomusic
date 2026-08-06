import path from "node:path";

import { HttpException, HttpStatus, Module } from "@nestjs/common";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { unwrapResolverError } from "@apollo/server/errors";
import type { Request, Response } from "express";
import { GraphQLError } from "graphql";

import { BullmqModule } from "../bullmq/bullmq.module";
import { AdminGuard } from "../common/guards/admin.guard";
import { AuthGuard } from "../common/guards/auth.guard";
import { GraphqlAdminGuard } from "../common/guards/graphql-admin.guard";
import { GraphqlAuthGuard } from "../common/guards/graphql-auth.guard";
import { type AppConfig } from "../config/definitions/app.config";
import { PrismaModule } from "../db/prisma.module";
import { OidcService } from "../oidc/oidc.service";
import { AlbumController } from "./album/album.controller";
import { AlbumResolver } from "./album/album.resolver";
import { AlbumService } from "./album/album.service";
import { ApiController } from "./api.controller";
import { ApiResolver } from "./api.resolver";
import { ApiService } from "./api.service";
import { ArtistResolver } from "./artist/artist.resolver";
import { ArtistService } from "./artist/artist.service";
import { AuthController } from "./auth/auth.controller";
import { IndexingResolver } from "./indexing/indexing.resolver";
import { IndexingService } from "./indexing/indexing.service";
import { LibraryResolver } from "./library/library.resolver";
import { LibraryService } from "./library/library.service";
import { MediaController } from "./media/media.controller";
import { MediaService } from "./media/media.service";
import { PlaylistController } from "./playlist/playlist.controller";
import { PlaylistResolver } from "./playlist/playlist.resolver";
import { PlaylistService } from "./playlist/playlist.service";
import { ReportingController } from "./reporting/reporting.controller";
import { SearchResolver } from "./search/search.resolver";
import { SearchService } from "./search/search.service";
import { TrackResolver } from "./track/track.resolver";
import { TrackService } from "./track/track.service";
import { UserResolver } from "./user/user.resolver";
import { UserService } from "./user/user.service";

const graphqlCodeByStatus: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "BAD_USER_INPUT",
  [HttpStatus.UNAUTHORIZED]: "UNAUTHENTICATED",
  [HttpStatus.FORBIDDEN]: "FORBIDDEN",
  [HttpStatus.NOT_FOUND]: "NOT_FOUND",
  [HttpStatus.CONFLICT]: "CONFLICT",
  [HttpStatus.UNPROCESSABLE_ENTITY]: "UNPROCESSABLE_ENTITY",
  [HttpStatus.TOO_MANY_REQUESTS]: "RATE_LIMITED",
};

const resolveHttpExceptionMessage = (exception: HttpException): string => {
  const response = exception.getResponse();

  if (typeof response === "string") {
    return response;
  }

  if (response && typeof response === "object") {
    const message = (response as { message?: string | string[] }).message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return exception.message;
};

const mapHttpExceptionToGraphqlError = (exception: HttpException) => {
  const status = exception.getStatus();
  const httpStatus = status;
  const code =
    graphqlCodeByStatus[httpStatus] ??
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR
      ? "INTERNAL_SERVER_ERROR"
      : "BAD_REQUEST");

  return new GraphQLError(resolveHttpExceptionMessage(exception), {
    extensions: {
      code,
      http: {
        status,
      },
    },
  });
};

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
          formatError: (formattedError, error) => {
            const originalError = unwrapResolverError(error);

            if (originalError instanceof HttpException) {
              const graphqlError =
                mapHttpExceptionToGraphqlError(originalError);

              return {
                ...formattedError,
                message: graphqlError.message,
                extensions: {
                  ...(formattedError.extensions ?? {}),
                  ...graphqlError.extensions,
                },
              };
            }

            return formattedError;
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
    PlaylistController,
    ReportingController,
  ],
  providers: [
    ApiService,
    ApiResolver,
    UserResolver,
    UserService,
    IndexingResolver,
    IndexingService,
    OidcService,
    AuthGuard,
    AdminGuard,
    GraphqlAuthGuard,
    GraphqlAdminGuard,
    MediaService,
    AlbumService,
    AlbumResolver,
    TrackService,
    TrackResolver,
    ArtistService,
    ArtistResolver,
    PlaylistService,
    PlaylistResolver,
    SearchService,
    SearchResolver,
    LibraryResolver,
    LibraryService,
  ],
  exports: [AuthGuard, AdminGuard, GraphqlAuthGuard, GraphqlAdminGuard],
})
export class ApiModule {}
