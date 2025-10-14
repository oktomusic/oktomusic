import { Module } from "@nestjs/common";

import { OpenGraphService } from "./opengraph.service";

@Module({
  providers: [OpenGraphService],
  exports: [OpenGraphService],
})
export class OpenGraphModule {}
