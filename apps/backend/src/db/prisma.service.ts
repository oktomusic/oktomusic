import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ConfigType } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../generated/prisma/client";
import appConfig from "../config/definitions/app.config";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
  ) {
    const connectionString = appConf.databaseUrl;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
