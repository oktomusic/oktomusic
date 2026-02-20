import path from "node:path";

import { HttpException, HttpStatus, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { unwrapResolverError } from "@apollo/server/errors";
import type { Request, Response } from "express";
import { GraphQLError } from "graphql";

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
  const httpStatus = status as HttpStatus;
  const code =
    graphqlCodeByStatus[httpStatus] ??
    (httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR
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
