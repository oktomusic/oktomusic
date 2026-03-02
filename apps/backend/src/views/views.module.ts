import { Module } from "@nestjs/common";
import { ViewsController } from "./views.controller";
import { MetaTagsModule } from "../common/metatags/metatags.module";

@Module({
  imports: [MetaTagsModule],
  controllers: [ViewsController],
})
export class ViewsModule {}
