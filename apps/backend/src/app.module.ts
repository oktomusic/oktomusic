import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { ViewsModule } from "./views/views.module";
import { OpenGraphModule } from "./common/opengraph/opengraph.module";

@Module({
  imports: [ApiModule, ViewsModule, OpenGraphModule],
})
export class AppModule {}
