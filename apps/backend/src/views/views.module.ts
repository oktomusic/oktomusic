import { Module } from "@nestjs/common";
import { ViewsController } from "./views.controller";
import { OpenGraphModule } from "../common/opengraph/opengraph.module";

@Module({
  imports: [OpenGraphModule],
  controllers: [ViewsController],
})
export class ViewsModule {}
