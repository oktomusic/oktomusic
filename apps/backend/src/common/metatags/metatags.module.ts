import { Module } from "@nestjs/common";

import { MetaTagsService } from "./metatags.service";

@Module({
  providers: [MetaTagsService],
  exports: [MetaTagsService],
})
export class MetaTagsModule {}
