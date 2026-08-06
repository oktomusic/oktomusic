import { Module } from "@nestjs/common";

import { MetaTagsModule } from "../common/metatags/metatags.module";
import { ViewsController } from "./views.controller";

@Module({
  imports: [MetaTagsModule],
  controllers: [ViewsController],
})
export class ViewsModule {}
