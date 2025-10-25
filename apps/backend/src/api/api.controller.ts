import { Controller, Get, Inject } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

import { ApiInfoResJSONSchema } from "@oktomusic/api-schemas";
import type { ApiInfoRes } from "@oktomusic/api-schemas";

import oidcConfig from "../config/definitions/oidc.config";

@Controller("api")
@ApiTags("API")
export class ApiController {
  constructor(
    @Inject(oidcConfig.KEY)
    private readonly oidcConf: ConfigType<typeof oidcConfig>,
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
}
