import { Controller, Get, Inject } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

import { ApiInfoResJSONSchema } from "@oktomusic/api-schemas";
import type { ApiInfoRes } from "@oktomusic/api-schemas";

import oidcConfig from "../config/definitions/oidc.config";
import { ApiService } from "./api.service";
import type { User } from "../generated/prisma";

@Controller("api")
@ApiTags("API")
export class ApiController {
  constructor(
    @Inject(oidcConfig.KEY)
    private readonly oidcConf: ConfigType<typeof oidcConfig>,
    private readonly apiService: ApiService,
  ) {}

  @Get("info")
  @ApiOkResponse({
    schema: ApiInfoResJSONSchema as SchemaObject,
    description: "Get backend infos",
  })
  getInfo(): ApiInfoRes {
    return {
      version: "0.0.1",
      oidc: {
        issuer: this.oidcConf.issuer,
        client_id: this.oidcConf.clientId,
      },
    };
  }

  @Get("users")
  @ApiOkResponse({ description: "List users" })
  getUsers(): Promise<User[]> {
    return this.apiService.listUsers();
  }
}
