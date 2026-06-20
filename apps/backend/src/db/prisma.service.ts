import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";
import appConfig from "../config/definitions/app.config";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
  ) {
    const connectionString = appConf.databaseUrl;
    const adapter = new PrismaPg({ connectionString });

    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
